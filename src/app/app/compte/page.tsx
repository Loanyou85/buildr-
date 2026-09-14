import { redirect } from 'next/navigation';
import { auth, signOut } from '@/server/auth';
import { db } from '@/server/db';
import { AppShell } from '@/components/app/app-shell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteMyAccount, updateNotificationPrefs } from '@/server/actions/account';
import { toggleAdventureVisibility } from '@/server/actions/journey';
import { ageGate } from '@/lib/guardrails';
import { formatDateFr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const { erreur } = await searchParams;

  const [user, profile, adventure, prefs] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.adventure.findUnique({ where: { userId: session.user.id } }),
    db.notificationPref.findUnique({ where: { userId: session.user.id } }),
  ]);

  const gate = ageGate(profile?.age);

  return (
    <AppShell active="/app/compte">
      <h1 className="text-2xl">Ton compte</h1>
      <p className="mt-2 text-sm text-beton-600">{user.email}</p>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Rappels</h2>
        <form action={updateNotificationPrefs} className="mt-4 space-y-4 rounded-card border border-beton-300 bg-blanc p-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="dailyReminder"
              defaultChecked={prefs?.dailyReminder ?? true}
              className="size-4 accent-[#3E7BFA]"
            />
            <span className="text-sm text-encre">Me rappeler ce que j’ai à faire chaque jour</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="inactivityReminder"
              defaultChecked={prefs?.inactivityReminder ?? true}
              className="size-4 accent-[#3E7BFA]"
            />
            <span className="text-sm text-encre">Me relancer si je décroche plusieurs jours</span>
          </label>
          <label className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-encre">À quelle heure</span>
            <Input
              type="number"
              name="reminderHour"
              min={0}
              max={23}
              defaultValue={prefs?.reminderHour ?? 9}
              className="tabular w-24"
            />
            <span className="text-sm text-beton-600">h</span>
          </label>
          <Button type="submit" variant="outline" size="sm">
            Enregistrer
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Ton aventure publique</h2>
        <p className="prose-buildr mt-2 text-sm text-beton-600">
          Tu choisis librement ce que tu partages. Rien n’est publié tant que tu ne l’actives pas, et tu
          peux retirer la publication à tout moment.
        </p>

        {gate === 'restricted' ? (
          <p className="mt-4 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
            Le partage public s’ouvre à 18 ans. Tout le reste du produit fonctionne normalement.
          </p>
        ) : (
          <form action={toggleAdventureVisibility} className="mt-4 space-y-4 rounded-card border border-beton-300 bg-blanc p-5">
            <Textarea
              name="story"
              rows={4}
              placeholder="D’où tu pars, ce que tu construis, ce qui a été difficile…"
              defaultValue={adventure?.story ?? ''}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublic"
                  value="true"
                  defaultChecked={adventure?.isPublic ?? false}
                  className="size-4 accent-[#3E7BFA]"
                />
                <span className="text-sm text-encre">Rendre mon aventure publique</span>
              </label>
              <Button type="submit" variant="outline" size="sm">
                Enregistrer
              </Button>
            </div>
            {adventure?.isPublic ? (
              <p className="text-xs text-beton-600">
                Publiée à l’adresse /aventure/{adventure.slug}
              </p>
            ) : null}
          </form>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Tes données</h2>
        <div className="mt-4 rounded-card border border-beton-300 bg-blanc p-5">
          <p className="prose-buildr text-sm text-beton-600">
            Consentement donné le {user.consentAcceptedAt ? formatDateFr(user.consentAcceptedAt) : '—'}
            {user.consentVersion ? ` (version ${user.consentVersion})` : ''}. Données hébergées dans
            l’Union européenne, conservées {user.dataRetentionMonths} mois après ta dernière activité.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <a href="/api/compte/export">Exporter mes données</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Supprimer le compte</h2>
        <p className="prose-buildr mt-2 text-sm text-beton-600">
          Tout est effacé : profil, réponses, parcours, progression, jalons. C’est définitif et immédiat.
        </p>
        {erreur === 'confirmation' ? (
          <p className="mt-3 text-sm text-encre">Écris exactement « supprimer » pour confirmer.</p>
        ) : null}
        {erreur === 'partage-mineur' ? (
          <p className="mt-3 text-sm text-encre">Le partage public n’est pas disponible avant 18 ans.</p>
        ) : null}
        <form action={deleteMyAccount} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-beton-600">Écris « supprimer »</span>
            <Input type="text" name="confirmation" required className="w-48" />
          </label>
          <Button type="submit" variant="outline" size="sm">
            Supprimer définitivement
          </Button>
        </form>
      </section>

      <section className="mt-12 border-t border-beton-300 pt-6">
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            Se déconnecter
          </Button>
        </form>
        <Badge variant="outline" className="mt-4">
          Plan {session.user.role === 'admin' ? 'administrateur' : 'gratuit'}
        </Badge>
      </section>
    </AppShell>
  );
}
