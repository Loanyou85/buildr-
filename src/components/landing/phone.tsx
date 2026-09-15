import { existsSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';

/**
 * Le téléphone de la page d'accueil (section 6.2).
 *
 * Le cadre est dessiné ici, en SVG — aucune image de téléphone téléchargée.
 * L'écran accueille la capture réelle du tableau de bord Stripe du fondateur.
 * Tant qu'elle n'est pas déposée dans /public/proof, on affiche un visuel
 * d'attente qui dit qu'il en est un : surtout pas une fausse capture crédible.
 */
const EXTENSIONS = ['avif', 'webp', 'png', 'jpg', 'jpeg'] as const;

function capture(): string | null {
  const dossier = path.join(process.cwd(), 'public', 'proof');
  for (const extension of EXTENSIONS) {
    if (existsSync(path.join(dossier, `stripe-revenue.${extension}`))) {
      return `/proof/stripe-revenue.${extension}`;
    }
  }
  return null;
}

export function Phone() {
  const preuve = capture();

  return (
    <figure className="relative mx-auto w-[260px] md:w-[320px]">
      <div aria-hidden className="halo-neo absolute -inset-16 -z-10 rounded-full" />

      <div className="leviter relative">
        <svg viewBox="0 0 280 583" className="w-full" aria-hidden>
          <rect x="1" y="1" width="278" height="581" rx="40" fill="#10101C" stroke="#2A2A3E" strokeWidth="2" />
          <rect x="10" y="10" width="260" height="563" rx="32" fill="#08080F" />
          <rect x="102" y="18" width="76" height="20" rx="10" fill="#08080F" stroke="#2A2A3E" />
        </svg>

        <div className="absolute inset-0 p-[10px]">
          <div className="relative h-full w-full overflow-hidden rounded-[32px]">
            {preuve ? (
              <Image
                src={preuve}
                alt="Capture du tableau de bord Stripe du fondateur"
                width={260}
                height={563}
                priority
                sizes="(min-width: 768px) 320px, 260px"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              // Le visuel d'attente est un SVG : il passe par une balise
              // ordinaire plutôt que par l'optimiseur d'images.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/proof/placeholder.svg"
                alt="Emplacement réservé à la capture du tableau de bord Stripe"
                width={260}
                height={563}
                className="h-full w-full object-cover"
                decoding="async"
              />
            )}
          </div>
        </div>
      </div>

      {/*
        Mention obligatoire, visible sans scroll supplémentaire (section 6.2).
        Elle n'est pas optionnelle et ne doit jamais être retirée : une
        allégation chiffrée présentée comme un résultat typique relève de la
        pratique commerciale trompeuse.
      */}
      <figcaption className="mt-4 text-center text-xs text-gris-300">
        Résultats du fondateur. Aucun résultat n’est garanti.
      </figcaption>
    </figure>
  );
}
