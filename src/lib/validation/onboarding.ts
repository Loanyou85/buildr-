import { z } from 'zod';

/** Schémas partagés client/serveur (section 3). */
export const answerSchema = z.object({
  key: z.string().min(1),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.object({ slug: z.string(), level: z.number().int().min(0).max(5) })),
  ]),
});

export type AnswerInput = z.infer<typeof answerSchema>;

export const ageSchema = z.number().int().min(10).max(99);

export const rejectionSchema = z.object({
  recommendationId: z.string().min(1),
  reason: z.string().min(10, 'Dis-nous en une phrase ce qui ne va pas : c’est ce qui améliore la proposition suivante.').max(500),
});

export const milestoneSchema = z.object({
  key: z.string().min(1),
  declaredValue: z.number().int().min(0).max(1_000_000).optional(),
});

export const assistantMessageSchema = z.object({
  stepId: z.string().min(1),
  message: z.string().min(3).max(2000),
});

export const outreachSchema = z.object({
  stepId: z.string().min(1),
  sent: z.number().int().min(0).max(10_000),
  replies: z.number().int().min(0).max(10_000),
});
