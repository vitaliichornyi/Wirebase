import { z } from 'zod';

import { TIME_RANGES } from '@/features/dashboard/types/click-stats';

export const getClickStatsSchema = z.object({
  timeRange: z.enum(TIME_RANGES).default('7d'),
  flowId: z.uuid().optional(),
  inputNodeId: z.uuid().optional(),
  country: z.string().trim().min(1).optional(),
});

export type GetClickStatsInput = z.infer<typeof getClickStatsSchema>;
