'use server';

import { z } from 'zod';

import { createSafeAction } from '@/shared/lib/create-safe-action';
import { getClickStatsSchema } from '@/features/dashboard/schemas/click-stats';
import * as clickStatsService from '@/features/dashboard/services/click-stats';

export const getClickStats = createSafeAction(
  getClickStatsSchema,
  clickStatsService.getClickStats,
);

export const getClickFilterOptions = createSafeAction(
  z.void(),
  clickStatsService.getClickFilterOptions,
);
