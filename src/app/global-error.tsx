'use client';

/**
 * Dernier filet : une erreur survenue dans la mise en page racine, là où même
 * les styles ne sont pas garantis. Tout est écrit en ligne pour cette raison.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#08080F',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <main style={{ maxWidth: '380px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Le site n’a pas réussi à se charger.
          </h1>
          <p style={{ marginTop: '12px', fontSize: '15px', color: '#A0A0B8', lineHeight: 1.55 }}>
            Ça vient de nous, pas de toi. Réessaie dans un instant.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '28px',
              minHeight: '56px',
              width: '100%',
              borderRadius: '12px',
              border: 'none',
              background: '#6E56F8',
              color: '#FFFFFF',
              fontSize: '17px',
              fontWeight: 500,
            }}
          >
            Réessayer
          </button>
          {error.digest ? (
            <p style={{ marginTop: '28px', fontSize: '13px', color: '#A0A0B8', fontFamily: 'monospace' }}>
              Incident {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
