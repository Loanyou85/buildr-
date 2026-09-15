import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { CustomPromptForm } from '@/components/app/custom-prompt-form';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { can, FEATURES, FREE_CUSTOM_PROMPTS_PER_MONTH } from '@/server/features';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajouter à mon SaaS — Nexteo' };

export default async function AjouterPage() {
  const user = await requireUser();
  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) redirect('/mes-idees');

  const illimite = await can(user.id, FEATURES.promptsCustomUnlimited);
  const mois = new Date().toISOString().slice(0, 7);
  const abonnement = await db.subscription.findUnique({ where: { userId: user.id } });
  const utilises = abonnement?.customPromptsMonth === mois ? abonnement.customPromptsUsed : 0;

  return (
    <AppShell actif="/app/prompts">
      <h1 className="text-xl font-extrabold text-white">Ajouter quelque chose à mon SaaS.</h1>
      <p className="mt-2 text-sm text-gris-300">
        Écris-le comme tu le dirais à quelqu’un. On s’occupe de le traduire en prompt, cohérent avec
        ce que tu as déjà construit.
      </p>

      <p className="mt-4 text-xs text-gris-300">
        {illimite
          ? 'Sans limite avec ton offre.'
          : `${Math.max(0, FREE_CUSTOM_PROMPTS_PER_MONTH - utilises)} sur ${FREE_CUSTOM_PROMPTS_PER_MONTH} restants ce mois-ci.`}
      </p>

      <div className="mt-6">
        <CustomPromptForm />
      </div>

      <p className="mt-8 text-xs text-gris-300">
        Chaque prompt généré est conservé dans ton pack. Tu peux le noter d’un pouce haut ou bas :
        ces retours servent à corriger les gabarits.
      </p>
    </AppShell>
  );
}
