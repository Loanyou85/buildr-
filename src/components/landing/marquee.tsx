/**
 * Bandeau défilant infini (pattern 3) : la ligne est dupliquée pour la
 * continuité, et l'animation se met en pause au survol. Pure CSS, donc pas de
 * JavaScript qui tourne en permanence.
 */
const BADGES = [
  'Diagnostic gratuit',
  'Aucune promesse de revenu',
  'Parcours étape par étape',
  'Tes données exportables',
  'Aucune carte bancaire',
  'Chaque action est exécutable',
  'Hébergé dans l’Union européenne',
  'Tu choisis ce que tu partages',
];

export function Marquee() {
  return (
    <div className="marquee overflow-hidden border-y border-white/10 bg-plan-900 py-4">
      <div className="marquee-track flex w-max gap-3">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3" aria-hidden={copy === 1}>
            {BADGES.map((badge) => (
              <span
                key={badge}
                className="whitespace-nowrap rounded-full border border-white/10 px-4 py-1.5 text-sm text-white/60"
              >
                {badge}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
