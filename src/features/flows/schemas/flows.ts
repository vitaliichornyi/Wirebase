import { z } from 'zod';

import { FLOW_STATUSES } from '@/features/flows/types/flows';

export const createFlowSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
});

export type CreateFlowInput = z.infer<typeof createFlowSchema>;

export const updateFlowStatusSchema = z.object({
  flowId: z.uuid(),
  status: z.enum(FLOW_STATUSES),
});

export type UpdateFlowStatusInput = z.infer<typeof updateFlowStatusSchema>;

export const renameFlowSchema = z.object({
  flowId: z.uuid(),
  name: z.string().trim().min(1).max(120),
});

export type RenameFlowInput = z.infer<typeof renameFlowSchema>;

export const getFlowSchema = z.object({
  flowId: z.uuid(),
});

export type GetFlowInput = z.infer<typeof getFlowSchema>;
