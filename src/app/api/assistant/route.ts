import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { answerWithContext, type AssistantContext } from '@/lib/ai/assistant';
import { assistantMessageSchema } from '@/lib/validation/onboarding';
import { can, FEATURES } from '@/server/features';
import { formatEuros } from '@/lib/utils';

/**
 * Assistance contextuelle (section 8.7). L'assistant reçoit systématiquement :
 * le business choisi, l'étape actuelle et son contenu intégral, les étapes
 * précédentes et leurs validations, le profil, le budget, l'objectif.
 * L'appel IA est fait ici, côté serveur : aucune clé ne passe au client.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Connexion requise' }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = assistantMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Question invalide' }, { status: 400 });
  }

  const allowed = await can(session.user.id, FEATURES.assistant);
  if (!allowed) {
    return Response.json({
      answer:
        'L’assistance sur chaque étape fait partie de Nexteo Pro. En attendant, tout ce qu’il te faut est écrit dans l’étape : les actions sont numérotées et exécutables telles quelles.',
    });
  }

  const step = await db.step.findUnique({
    where: { id: parsed.data.stepId },
    include: {
      phase: { include: { journey: { include: { businessModel: true, phases: { include: { steps: true } } } } } },
      subSteps: { orderBy: { order: 'asc' }, include: { actions: { orderBy: { order: 'asc' } } } },
      checkpoints: { orderBy: { order: 'asc' } },
      resources: true,
    },
  });
  if (!step) return Response.json({ error: 'Étape introuvable' }, { status: 404 });

  const progress = await db.stepProgress.findFirst({
    where: { stepId: step.id, userJourney: { userId: session.user.id } },
    include: { checkpoints: true, userJourney: { include: { steps: true } } },
  });
  if (!progress) return Response.json({ error: 'Étape hors de ton parcours' }, { status: 403 });

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  const checkedIds = new Set(progress.checkpoints.map((c) => c.checkpointId));

  const allSteps = step.phase.journey.phases.flatMap((phase) => phase.steps);
  const statusByStepId = new Map(progress.userJourney.steps.map((p) => [p.stepId, p.status]));

  const context: AssistantContext = {
    businessName: step.phase.journey.businessModel.name,
    budgetLabel:
      profile?.initialBudget != null ? `${formatEuros(profile.initialBudget)} au démarrage` : 'non précisé',
    goalLabel:
      profile?.financialGoal != null && profile.timeHorizon != null
        ? `${formatEuros(profile.financialGoal)} par mois d’ici ${profile.timeHorizon} mois`
        : 'non précisé',
    stepNumber: step.number,
    stepTitle: step.title,
    stepGoal: step.goal,
    stepWhy: step.why,
    subSteps: step.subSteps.map((sub) => ({
      title: sub.title,
      body: sub.body,
      actions: sub.actions.map((a) => ({
        instruction: a.instruction,
        example: a.example,
        externalUrl: a.externalUrl,
      })),
    })),
    checkpoints: step.checkpoints.map((c) => ({ label: c.label, checked: checkedIds.has(c.id) })),
    resources: step.resources.map((r) => ({ type: r.type, title: r.title, body: r.body, url: r.url })),
    previousSteps: allSteps
      .filter((s) => s.number < step.number)
      .sort((a, b) => a.number - b.number)
      .map((s) => ({ number: s.number, title: s.title, done: statusByStepId.get(s.id) === 'done' })),
  };

  const answer = await answerWithContext(context, parsed.data.message);

  // Le fil est conservé : il fait partie de l'historique du parcours.
  const thread = await db.assistantThread.upsert({
    where: { userId_stepId: { userId: session.user.id, stepId: step.id } },
    update: {},
    create: { userId: session.user.id, userJourneyId: progress.userJourneyId, stepId: step.id },
  });

  await db.assistantMessage.createMany({
    data: [
      { threadId: thread.id, role: 'user', content: parsed.data.message },
      {
        threadId: thread.id,
        role: 'assistant',
        content: answer,
        contextSnapshot: { stepNumber: step.number, stepTitle: step.title },
      },
    ],
  });

  return Response.json({ answer });
}
