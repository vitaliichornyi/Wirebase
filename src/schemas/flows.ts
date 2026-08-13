import { z } from 'zod';

import { FLOW_STATUSES } from '@/types/flows';

export const createFlowSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
});

export type CreateFlowInput = z.infer<typeof createFlowSchema>;

export const updateFlowStatusSchema = z.object({
  flowId: z.uuid(),
  status: z.enum(FLOW_STATUSES),
});

export type UpdateFlowStatusInput = z.infer<typeof updateFlowStatusSchema>;
