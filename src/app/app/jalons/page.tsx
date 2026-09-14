import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { AppShell } from '@/components/app/app-shell';
import { AssistantLauncher } from '@/components/app/assistant-launcher';
import { MilestoneList } from '@/components/app/milestone-list';

export const dynamic = 'force-dynamic';

/**
 * Jalons (section 6.6 et 8.4). Ce que l'utilisateur déclare est affiché comme
 * déclaré par lui — jamais comme vérifié (garde-fou n° 3).
 */
export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: Promise<{ franchi?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const { franchi } = await searchParams;

  const [milestones, reached, userJourney, profile] = await Promise.all([
    db.milestone.findMany({ orderBy: { order: 'asc' } }),
    db.userMilestone.findMany({ where: { userId: session.user.id } }),
    db.userJourney.findFirst({
      where: { userId: session.user.id },
      include: { journey: { include: { businessModel: true } } },
    }),
    db.profile.findUnique({ where: { userId: session.user.id }, select: { age: true } }),
  ]);

  const reachedByMilestoneId = new Map(reached.map((r) => [r.milestoneId, r]));

  return (
    <AppShell active="/app/jalons" aside={<AssistantLauncher stepId={userJourney?.currentStepId ?? null} />}>
      <h1 className="text-2xl">Tes jalons</h1>
      <p className="prose-buildr mt-3 text-base text-beton-600">
        Quatre moments comptent vraiment. Tu les enregistres quand ils arrivent, avec ou sans montant. Ce
        que tu notes reste privé tant que tu ne publies pas ton aventure.
      </p>

      <MilestoneList
        milestones={milestones.map((milestone) => {
          const record = reachedByMilestoneId.get(milestone.id);
          return {
            id: milestone.id,
            key: milestone.key,
            label: milestone.label,
            reachedAt: record?.reachedAt.toISOString() ?? null,
            declaredValue: record?.declaredValue ?? null,
            verificationStatus: record?.verificationStatus ?? null,
          };
        })}
        businessName={userJourney?.journey.businessModel.name ?? null}
        justReachedKey={franchi ?? null}
        canSharePublicly={(profile?.age ?? 18) >= 18}
      />
    </AppShell>
  );
}
