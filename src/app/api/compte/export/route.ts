import { exportMyData } from '@/server/actions/account';

/** Téléchargement de l'export RGPD, en JSON, sous le contrôle de l'utilisateur. */
export async function GET() {
  try {
    const json = await exportMyData();
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="nexteo-mes-donnees-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    return new Response('Connexion requise', { status: 401 });
  }
}
