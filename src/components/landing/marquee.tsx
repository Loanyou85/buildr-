const BADGES = [
  'Sans coder',
  'Sans équipe',
  'Sans budget de départ',
  'Ton idée, pas une idée générique',
  'Des prompts prêts à coller',
  'Un plan de contenu sur 30 jours',
  'Tu gardes tout ce que tu construis',
];

/** Bandeau défilant (section 5.1.3), dupliqué pour la continuité. */
export function Marquee() {
  return (
    <div className="marquee overflow-hidden border-y border-gris-700/60 py-4">
      <div className="bandeau-piste flex w-max gap-3">
        {[...BADGES, ...BADGES].map((badge, index) => (
          <span
            key={index}
            className="whitespace-nowrap rounded-full border border-gris-700 px-4 py-1.5 text-xs text-gris-300"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
