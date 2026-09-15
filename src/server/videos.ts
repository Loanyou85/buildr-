import 'server-only';
import { z } from 'zod';
import type { Idea, Profile, VideoAngle } from '@prisma/client';
import { db } from '@/server/db';
import { askJson } from '@/lib/ai/client';
import { findForbiddenClaims, stripForbiddenClaims } from '@/lib/guardrails';
import {
  ANGLE_LABELS,
  ANGLE_PRINCIPE,
  TOTAL_SCRIPTS,
  calendrierDesAngles,
} from '@/lib/videos/angles';

/**
 * Générateur des trente scripts (section 10).
 *
 * Le calendrier des angles est déterministe : la répartition 6/6/6/5/4/3 et
 * les six premiers tournables sans utilisateurs sont des contraintes, pas des
 * préférences. Le modèle n'écrit que le contenu de chaque script, et sa sortie
 * passe par le filtre des formulations interdites avant d'être enregistrée.
 */

const scriptSchema = z.object({
  hook: z.string().min(10).max(220),
  body: z.string().min(80).max(2000),
  shotPlan: z.array(z.object({ at: z.string().max(20), shot: z.string().max(220) })).min(1).max(8),
  onScreenText: z.array(z.object({ at: z.string().max(20), text: z.string().max(120) })).min(1).max(8),
  caption: z.string().min(10).max(500),
  pinnedComment: z.string().min(5).max(200),
  durationSeconds: z.number().int().min(20).max(90),
});

type ScriptGenere = z.infer<typeof scriptSchema>;

const lotSchema = z.object({ scripts: z.array(scriptSchema.extend({ dayNumber: z.number().int() })) });

function replis(idea: Idea, angle: VideoAngle, jour: number, visage: boolean): ScriptGenere {
  const plan = visage
    ? [
        { at: '0-2 s', shot: 'Toi, face caméra, téléphone posé à hauteur des yeux.' },
        { at: '2-25 s', shot: 'Toi, avec des plans de coupe sur ton écran.' },
        { at: '25-40 s', shot: 'Retour face caméra pour la dernière phrase.' },
      ]
    : [
        { at: '0-2 s', shot: 'Capture d’écran de ton produit, voix off.' },
        { at: '2-25 s', shot: 'Enregistrement d’écran pendant que tu utilises le produit.' },
        { at: '25-40 s', shot: 'Plan fixe sur le résultat, voix off.' },
      ];

  return {
    hook: `Si tu es ${idea.targetAudience.toLowerCase()}, tu perds du temps sur ça chaque semaine.`,
    body: `${idea.problem}\n\nJ’ai construit ${idea.title} pour ça. ${idea.solution}\n\nÇa se met en place en dix minutes, et ça coûte ${idea.monthlyPrice} € par mois.`,
    shotPlan: plan,
    onScreenText: [
      { at: '0 s', text: 'Le truc que tout le monde fait à la main' },
      { at: '10 s', text: idea.title },
      { at: '30 s', text: 'Lien en commentaire' },
    ],
    caption: `${ANGLE_LABELS[angle]} — jour ${jour}. ${idea.oneLiner}`,
    pinnedComment: 'Tu fais comment aujourd’hui : carnet, tableur, ou rien du tout ?',
    durationSeconds: 45,
  };
}

async function genererLot(
  idea: Idea,
  profile: Profile | null,
  jours: { dayNumber: number; angle: VideoAngle }[],
): Promise<Map<number, ScriptGenere>> {
  const visage = profile?.showsFace ?? false;

  const resultat = await askJson(
    `Tu écris des scripts de vidéos verticales courtes pour un fondateur qui lance un petit SaaS.

Règles absolues :
- Aucune promesse de revenu. Les mots « gagne », « revenus passifs »,
  « automatique », « garanti » sont interdits, ainsi que tout montant associé
  à un délai. Aucun ton de gourou.
- Aucun chiffre inventé : pas de nombre d'utilisateurs, pas de chiffre
  d'affaires, pas de témoignage. Le fondateur n'a peut-être aucun client.
- L'accroche tient en une seconde et demie : quinze mots au maximum.
- Le corps se dit en trente à soixante secondes, écrit mot pour mot, à la
  première personne, en tutoyant le spectateur.
- Le commentaire épinglé est une question fermée, facile à répondre.
${visage ? '' : "- LE FONDATEUR NE SE FILME PAS. Aucun plan ne doit montrer son visage : capture d'écran, plan sur le téléphone en main, voix off uniquement."}`,
    `Le produit : ${idea.title}
En une phrase : ${idea.oneLiner}
Le client : ${idea.targetAudience}
Le problème : ${idea.problem}
La solution : ${idea.solution}
Le prix : ${idea.monthlyPrice} € par mois

Écris ces scripts :
${jours.map((j) => `- Jour ${j.dayNumber}, angle « ${ANGLE_LABELS[j.angle]} » : ${ANGLE_PRINCIPE[j.angle]}`).join('\n')}

Format attendu :
{ "scripts": [ { "dayNumber": 1, "hook": "...", "body": "...", "shotPlan": [{"at":"0-2 s","shot":"..."}], "onScreenText": [{"at":"0 s","text":"..."}], "caption": "...", "pinnedComment": "...", "durationSeconds": 45 } ] }`,
    (value) => {
      const parsed = lotSchema.safeParse(value);
      return parsed.success ? parsed.data.scripts : null;
    },
    4000,
  );

  const parJour = new Map<number, ScriptGenere>();
  for (const script of resultat ?? []) {
    // Garde-fou n° 1 : un script qui promet un revenu n'est pas corrigé en
    // silence, il est remplacé par le repli.
    const texte = `${script.hook} ${script.body} ${script.caption}`;
    if (findForbiddenClaims(texte).length > 0) continue;
    parJour.set(script.dayNumber, script);
  }
  return parJour;
}

/** Génère, ou régénère, les trente scripts d'une idée. */
export async function genererTrenteScripts(userId: string, ideaId: string): Promise<number> {
  const idea = await db.idea.findFirstOrThrow({ where: { id: ideaId, userId } });
  const profile = await db.profile.findUnique({ where: { userId } });
  const visage = profile?.showsFace ?? false;

  const angles = calendrierDesAngles();
  const plan = angles.map((angle, index) => ({ dayNumber: index + 1, angle }));

  // Par lots de six : une réponse de trente scripts dépasse la fenêtre utile
  // et se fait tronquer au milieu d'un script.
  const lots: (typeof plan)[] = [];
  for (let i = 0; i < plan.length; i += 6) lots.push(plan.slice(i, i + 6));
  const generes = await Promise.all(lots.map((lot) => genererLot(idea, profile, lot)));
  const parJour = new Map<number, ScriptGenere>();
  for (const lot of generes) for (const [jour, script] of lot) parJour.set(jour, script);

  await db.videoScript.deleteMany({ where: { userId, ideaId } });
  await db.videoScript.createMany({
    data: plan.map(({ dayNumber, angle }) => {
      const script = parJour.get(dayNumber) ?? replis(idea, angle, dayNumber, visage);
      return {
        userId,
        ideaId,
        dayNumber,
        angle,
        hook: stripForbiddenClaims(script.hook) || script.hook,
        body: stripForbiddenClaims(script.body) || script.body,
        shotPlan: script.shotPlan,
        onScreenText: script.onScreenText,
        caption: stripForbiddenClaims(script.caption) || script.caption,
        pinnedComment: script.pinnedComment,
        durationSeconds: script.durationSeconds,
      };
    }),
  });

  return TOTAL_SCRIPTS;
}

/** Régénère un seul script sans toucher aux vingt-neuf autres (section 10.4). */
export async function regenererScript(userId: string, scriptId: string): Promise<void> {
  const script = await db.videoScript.findFirstOrThrow({ where: { id: scriptId, userId } });
  const idea = await db.idea.findUniqueOrThrow({ where: { id: script.ideaId } });
  const profile = await db.profile.findUnique({ where: { userId } });

  const lot = await genererLot(idea, profile, [{ dayNumber: script.dayNumber, angle: script.angle }]);
  const nouveau = lot.get(script.dayNumber) ?? replis(idea, script.angle, script.dayNumber, profile?.showsFace ?? false);

  await db.videoScript.update({
    where: { id: script.id },
    data: {
      hook: stripForbiddenClaims(nouveau.hook) || nouveau.hook,
      body: stripForbiddenClaims(nouveau.body) || nouveau.body,
      shotPlan: nouveau.shotPlan,
      onScreenText: nouveau.onScreenText,
      caption: stripForbiddenClaims(nouveau.caption) || nouveau.caption,
      pinnedComment: nouveau.pinnedComment,
      durationSeconds: nouveau.durationSeconds,
      status: 'todo',
    },
  });
}

export async function scriptsDe(userId: string, ideaId: string) {
  return db.videoScript.findMany({ where: { userId, ideaId }, orderBy: { dayNumber: 'asc' } });
}
