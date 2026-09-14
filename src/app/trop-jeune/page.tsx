import Link from 'next/link';

/**
 * Garde-fou n° 5 : en dessous de 16 ans, le service n'est pas accessible et
 * aucun compte n'est conservé. Le ton reste respectueux, jamais culpabilisant.
 */
export default function TooYoungPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <h1 className="text-2xl">Nexteo n’est pas accessible avant 16 ans.</h1>
      <p className="prose-nexteo mt-4 text-base text-beton-600">
        Le service collecte des informations sur ta situation personnelle et financière, ce qui demande un
        âge minimum. Ton compte et les réponses que tu avais données ont été supprimés.
      </p>
      <p className="prose-nexteo mt-4 text-base text-beton-600">
        Reviens quand tu auras 16 ans : d’ici là, rien ne t’empêche d’apprendre à filmer, écrire ou
        construire quelque chose.
      </p>
      <Link href="/" className="mt-8 text-base text-acier underline-offset-4 hover:underline">
        Retour à l’accueil
      </Link>
    </div>
  );
}
