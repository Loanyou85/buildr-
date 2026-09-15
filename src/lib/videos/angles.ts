import type { VideoAngle } from '@prisma/client';

/** Répartition imposée par la section 10.2. Elle n'est pas négociable. */
export const REPARTITION: Record<VideoAngle, number> = {
  probleme: 6,
  demonstration: 6,
  construire_en_public: 6,
  pedagogie: 5,
  coulisses: 4,
  reponse: 3,
};

export const ANGLE_LABELS: Record<VideoAngle, string> = {
  probleme: 'Le problème',
  demonstration: 'Démonstration',
  construire_en_public: 'Construire en public',
  pedagogie: 'Pédagogie',
  coulisses: 'Coulisses',
  reponse: 'Réponse',
};

export const ANGLE_PRINCIPE: Record<VideoAngle, string> = {
  probleme: 'Mettre en scène la douleur que le produit fait disparaître.',
  demonstration: 'Montrer le produit en train de faire la chose, à l’écran.',
  construire_en_public: 'Jour N : ce qui a marché, ce qui a raté, les vrais chiffres.',
  pedagogie: 'Apprendre une chose utile au public visé, sans rien vendre.',
  coulisses: 'Comment c’est fait, avec quels outils, en combien de temps.',
  reponse: 'Répondre à une objection ou une question réellement posée.',
};

/**
 * Les six premiers scripts doivent être tournables **avant d'avoir le moindre
 * utilisateur** — c'est une contrainte du générateur, pas une préférence
 * (section 10.2). Ces trois angles sont les seuls qui n'exigent ni produit
 * fini, ni client, ni chiffre.
 */
export const ANGLES_SANS_UTILISATEURS: VideoAngle[] = ['probleme', 'pedagogie', 'coulisses'];

export const TOTAL_SCRIPTS = Object.values(REPARTITION).reduce((a, b) => a + b, 0);

/**
 * Calendrier déterministe des angles sur trente jours.
 *
 * Deux contraintes : la répartition exacte ci-dessus, et jamais le même angle
 * deux fois d'affilée — un mois de trente vidéos identiques ne se regarde pas.
 */
export function calendrierDesAngles(): VideoAngle[] {
  const restant: Record<VideoAngle, number> = { ...REPARTITION };
  const suite: VideoAngle[] = [];

  // Jours 1 à 6 : uniquement ce qui se tourne sans utilisateurs.
  for (let jour = 0; jour < 6; jour += 1) {
    const angle = ANGLES_SANS_UTILISATEURS[jour % ANGLES_SANS_UTILISATEURS.length]!;
    suite.push(angle);
    restant[angle] -= 1;
  }

  // Jours 7 à 30 : le plus fourni d'abord, en évitant deux fois de suite.
  while (suite.length < TOTAL_SCRIPTS) {
    const candidats = (Object.keys(restant) as VideoAngle[])
      .filter((angle) => restant[angle] > 0)
      .sort((a, b) => restant[b] - restant[a] || a.localeCompare(b));

    const precedent = suite.at(-1);
    const choisi = candidats.find((angle) => angle !== precedent) ?? candidats[0];
    if (!choisi) break;

    suite.push(choisi);
    restant[choisi] -= 1;
  }

  return suite;
}

/**
 * Mention obligatoire sur chaque script exporté (garde-fou n° 7, loi du
 * 9 juin 2023 sur l'influence commerciale).
 */
export const MENTION_PARTENARIAT =
  'Rappel : si cette vidéo est publiée dans le cadre d’une collaboration rémunérée, ou si tu y fais la promotion d’un produit contre une contrepartie, tu dois le signaler de façon claire, lisible et pendant toute la durée de la vidéo. Loi du 9 juin 2023.';
