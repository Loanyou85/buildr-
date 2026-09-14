/**
 * Grille bento (pattern 6) : quatre cartes de tailles inégales.
 * Survol : élévation de 4 px, bordure qui passe à --acier, 180 ms.
 */
const PILLARS = [
  {
    title: 'Une activité choisie, pas devinée',
    body: 'Un moteur croise tes compétences, tes goûts, ton budget, ton temps et ce que tu refuses de faire. Le classement est calculé, reproductible, et t’est expliqué dimension par dimension.',
    className: 'sm:col-span-2 sm:row-span-1',
  },
  {
    title: 'Le niveau de détail d’un mode d’emploi',
    body: 'Jamais « crée ton Instagram ». Toujours : ouvre l’application, choisis un nom selon cette règle, utilise cette structure de bio, publie ce contenu, reviens valider.',
    className: 'sm:row-span-2',
  },
  {
    title: 'Une seule question à l’écran',
    body: 'Qu’est-ce que je dois faire maintenant ? L’app y répond en permanence. Le reste est rangé.',
    className: '',
  },
  {
    title: 'Un parcours qui s’ajuste',
    body: 'Si ta prospection ne répond pas, Nexteo le détecte et te ramène sur ton offre. Présenté comme une amélioration, jamais comme un retour en arrière.',
    className: '',
  },
];

export function Bento() {
  return (
    <section className="bg-plan-900 py-24 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.02em]">
          Ce qui tient le produit
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className={`group rounded-card border border-white/10 bg-white/[0.03] p-6 transition-[transform,border-color] duration-[180ms] hover:-translate-y-1 hover:border-acier ${pillar.className}`}
            >
              <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-white">{pillar.title}</h3>
              <p className="prose-nexteo mt-3 text-sm text-white/60">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
