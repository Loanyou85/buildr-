import { Reveal } from './reveal';

const LIGNES = [
  { sujet: 'Trouver une idée', seul: 'Tu tournes en rond pendant des semaines', nexteo: 'Trois idées tirées de ce que tu connais déjà' },
  { sujet: 'Savoir par où commencer', seul: 'Trente onglets ouverts, aucun ordre', nexteo: 'Une seule action à l’écran, toujours la suivante' },
  { sujet: 'Parler à Claude', seul: 'Tu improvises, il part dans tous les sens', nexteo: 'Les prompts écrits pour toi, dans le bon ordre' },
  { sujet: 'Quand ça casse', seul: 'Tu cherches, tu abandonnes', nexteo: 'Tu colles l’erreur, tu reçois le prompt qui répare' },
  { sujet: 'Mettre en ligne', seul: 'Une doc en anglais que tu ne comprends pas', nexteo: 'Onze clics, décrits un par un' },
  { sujet: 'Encaisser', seul: 'Le paiement passe, l’accès ne s’ouvre pas', nexteo: 'Le branchement Stripe expliqué, test compris' },
  { sujet: 'Se faire connaître', seul: 'Tu publies trois fois puis tu arrêtes', nexteo: 'Trente scripts écrits pour ton produit' },
];

/** Comparatif (section 5.1.7), révélé ligne par ligne au défilement. */
export function Comparison() {
  return (
    <div className="overflow-hidden rounded-[--radius-card] border border-gris-700">
      <div className="grid grid-cols-[1fr_1fr] gap-px bg-gris-700 text-xs sm:grid-cols-[1fr_1fr_1fr]">
        <div className="hidden bg-nuit-800 px-4 py-3 text-gris-300 sm:block" />
        <div className="bg-nuit-800 px-4 py-3 font-medium text-gris-300">Se débrouiller seul</div>
        <div className="bg-nuit-800 px-4 py-3 font-medium text-white">Avec Nexteo</div>

        {LIGNES.map((ligne, index) => (
          <Reveal key={ligne.sujet} delay={index * 40} className="contents">
            <div className="hidden bg-nuit-900 px-4 py-4 text-gris-300 sm:block">{ligne.sujet}</div>
            <div className="bg-nuit-900 px-4 py-4 text-gris-300">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-gris-300 sm:hidden">
                {ligne.sujet}
              </span>
              {ligne.seul}
            </div>
            <div className="bg-nuit-900 px-4 py-4 text-white">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-gris-300 sm:hidden">
                &nbsp;
              </span>
              {ligne.nexteo}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
