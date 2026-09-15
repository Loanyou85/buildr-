'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { VideoStatus } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { assertCan, FEATURES } from '@/server/features';
import { genererTrenteScripts, regenererScript } from '@/server/videos';

export async function genererScripts(): Promise<void> {
  const user = await requireUser();
  await assertCan(user.id, FEATURES.videoScripts);

  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) redirect('/mes-idees');

  await genererTrenteScripts(user.id, idea.id);
  revalidatePath('/app/videos');
  redirect('/app/videos');
}

export async function regenererUnScript(formData: FormData): Promise<void> {
  const user = await requireUser();
  await assertCan(user.id, FEATURES.videoScripts);
  await regenererScript(user.id, String(formData.get('scriptId') ?? ''));
  revalidatePath('/app/videos');
}

export async function marquerScript(formData: FormData): Promise<void> {
  const user = await requireUser();
  const scriptId = String(formData.get('scriptId') ?? '');
  const statut = String(formData.get('status') ?? 'todo') as VideoStatus;
  await db.videoScript.updateMany({ where: { id: scriptId, userId: user.id }, data: { status: statut } });
  revalidatePath('/app/videos');
}
