export default function VerifyRequestPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <h1 className="text-2xl">Regarde ta boîte mail.</h1>
      <p className="prose-nexteo mt-3 text-base text-beton-600">
        On vient de t’envoyer un lien de connexion. Il est valable 24 heures. Tu peux fermer cet onglet.
      </p>
    </div>
  );
}
