import { z } from 'zod';

export const createFlowSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
});

export type CreateFlowInput = z.infer<typeof createFlowSchema>;
