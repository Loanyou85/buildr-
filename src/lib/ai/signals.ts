import 'server-only';
import { z } from 'zod';
import { FRICTION_KEYS, FRICTION_LABELS } from '@/lib/ideas/referentiel';
import { askJson } from './client';

/**
 * Normalisation des réponses libres « ce qui t'agace » (section 8.1).
 *
 * Le modèle intervient **en amont** du scoring et nulle part ailleurs : il
 * traduit du texte vers un vocabulaire fermé, il ne note rien. Sa sortie est
 * validée contre la liste des clés connues avant d'être utilisée — une clé
 * inventée est jetée en silence, sinon deux profils identiques
 * n'obtiendraient pas le même classement.
 */
const schema = z.object({ signals: z.array(z.string()).max(8) });

export async function normaliserFrictions(reponses: { question: string; answer: string }[]): Promise<string[]> {
  const utiles = reponses.filter((r) => r.answer.trim().length > 2);
  if (utiles.length === 0) return [];

  const vocabulaire = FRICTION_KEYS.map((key) => `- ${key} : ${FRICTION_LABELS[key]}`).join('\n');
  const texte = utiles.map((r) => `Question : ${r.question}\nRéponse : ${r.answer}`).join('\n\n');

  const resultat = await askJson(
    `Tu traduis des témoignages en clés d'un vocabulaire fermé.

Vocabulaire autorisé, et rien d'autre :
${vocabulaire}

Règles :
- Ne renvoie que des clés de cette liste, à l'identique.
- N'en invente aucune, ne reformule aucune clé.
- Ne renvoie que ce que la personne décrit réellement. Si elle ne décrit
  aucun irritant, renvoie une liste vide.
- Au maximum huit clés.

Format : { "signals": ["cle-1", "cle-2"] }`,
    texte,
    (value) => {
      const parsed = schema.safeParse(value);
      if (!parsed.success) return null;
      return parsed.data.signals;
    },
  );

  if (!resultat) return [];
  // Le filtre final est la vraie garantie : même si le modèle invente, rien
  // d'inconnu n'entre dans le moteur.
  return [...new Set(resultat.filter((key) => FRICTION_KEYS.includes(key)))];
}

/** Repli déterministe quand le modèle n'est pas disponible. */
export function frictionsParMotsCles(reponses: { answer: string }[]): string[] {
  const texte = reponses
    .map((r) => r.answer.toLowerCase())
    .join(' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const indices: Record<string, RegExp> = {
    'saisie-manuelle': /recopi|a la main|ressais|double saisie/,
    planning: /planning|horaire|roulement|equipe/,
    'rendez-vous': /rendez-vous|rdv|agenda/,
    'no-show': /pas venu|annul|absent|lapin/,
    'relances-clients': /relanc|repond pas|sans nouvelle/,
    devis: /devis/,
    factures: /factur/,
    'paiement-retard': /impay|retard de paiement|pas paye/,
    'suivi-dossier': /ou ca en est|suivi|dossier|avancement/,
    'compte-rendu': /compte rendu|compte-rendu|rapport|bilan/,
    tableur: /excel|tableur|google sheet|classeur/,
    'photos-chantier': /photo/,
    'pointage-heures': /heure|pointage|pointer/,
    stock: /stock|rupture/,
    'commandes-fournisseurs': /commande|fournisseur/,
    tournees: /tournee|trajet|itineraire|livraison/,
    reservations: /reservation|booking/,
    'notes-eleves': /eleve|adherent|progression|exercice/,
    recrutement: /recrut|candidat|embauch/,
    inventaire: /inventaire/,
  };

  return Object.entries(indices)
    .filter(([, motif]) => motif.test(texte))
    .map(([key]) => key)
    .slice(0, 8);
}
