const QUESTIONS = [
  {
    q: 'Je ne sais pas coder du tout. C’est vraiment pour moi ?',
    r: 'Oui. Le parcours ne te demande jamais d’écrire du code. Il te dit quoi cliquer, et il te donne les phrases exactes à coller dans Claude, dans l’ordre. Une seule étape demande d’ouvrir un terminal, et elle est facultative : l’autre chemin se fait entièrement dans un onglet.',
  },
  {
    q: 'Combien ça va me coûter, en plus de l’abonnement ?',
    r: 'GitHub, Vercel et Claude ont des offres gratuites qui suffisent pour construire et mettre en ligne. Stripe ne prend une commission que si tu encaisses. Un nom de domaine coûte une douzaine d’euros par an, et c’est facultatif au départ.',
  },
  {
    q: 'Vous me garantissez que je vais gagner de l’argent ?',
    r: 'Non, et personne ne peut le garantir. Nexteo te donne un chemin, des prompts et un plan de contenu. Ce que ça donne dépend de ton idée, de ton marché et du travail que tu y mets. La capture Stripe de cette page est un résultat du fondateur, pas une moyenne.',
  },
  {
    q: 'Combien de temps ça prend ?',
    r: 'Le diagnostic prend une dizaine de minutes. Mettre un site en ligne prend quelques jours en y passant quelques heures par semaine. Encaisser un premier paiement dépend surtout du temps que tu mets à parler à de vraies personnes du métier visé.',
  },
  {
    q: 'L’idée qu’on me propose m’appartient ?',
    r: 'Une idée ne s’approprie pas, et de toute façon ce n’est pas elle qui a de la valeur. Ce que tu construis — le code, le produit, les clients, le nom de domaine — est à toi, sur tes comptes, et reste à toi si tu arrêtes ton abonnement.',
  },
  {
    q: 'Et si ça casse et que je ne comprends rien ?',
    r: 'C’est prévu. À chaque étape, un bouton « Ça ne marche pas » : tu colles le message d’erreur, le système le reconnaît et te rend un prompt de réparation contextualisé avec ton projet. C’est la partie que la plupart des formations oublient.',
  },
  {
    q: 'Je peux arrêter quand je veux ?',
    r: 'Oui, depuis ton compte, en deux clics, sans motif et sans frais. Ton accès reste ouvert jusqu’à la fin de la période déjà payée.',
  },
];

/** Accordéon (section 5.1.9) : transition de hauteur native, zéro JavaScript. */
export function Faq() {
  return (
    <div className="space-y-2">
      {QUESTIONS.map((item) => (
        <details
          key={item.q}
          className="group rounded-[--radius-card] border border-gris-700 bg-nuit-800 px-4"
        >
          <summary className="tactile flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-white">
            {item.q}
            <span
              aria-hidden
              className="shrink-0 text-gris-300 transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-4 text-sm text-gris-300">{item.r}</p>
        </details>
      ))}
    </div>
  );
}
