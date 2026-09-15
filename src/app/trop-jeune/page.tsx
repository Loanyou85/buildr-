import Link from 'next/link';
import { TopBar } from '@/components/shell/top-bar';
import { Button } from '@/components/ui/button';
import { MIN_AGE } from '@/lib/guardrails';

export const metadata = { title: 'Reviens nous voir — Nexteo' };

/** Garde-fou n° 6 : moins de seize ans, pas de compte. */
export default function TropJeunePage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-xl font-extrabold text-white">On ne peut pas te créer de compte.</h1>
        <div className="mt-4 space-y-4 text-sm text-gris-300">
          <p>
            Nexteo demande d’avoir {MIN_AGE} ans au minimum. Ce n’est pas une règle qu’on a choisie :
            ouvrir un compte suppose de traiter des données personnelles, et en dessous de cet âge
            il faut l’accord d’un parent, ce qu’on ne sait pas vérifier correctement.
          </p>
          <p>
            Ça ne t’empêche de rien. Tout ce que le parcours utilise — GitHub, Claude, un éditeur
            dans le navigateur — est accessible et gratuit. Tu peux construire quelque chose dès
            aujourd’hui. C’est seulement l’encaissement qui attendra ta majorité, ou un compte ouvert
            par un adulte.
          </p>
          <p>Reviens nous voir. On efface ce que tu as commencé à répondre.</p>
        </div>
        <div className="mt-8">
          <Button asChild taille="bloc" variant="secondaire">
            <Link href="/">Revenir à l’accueil</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
