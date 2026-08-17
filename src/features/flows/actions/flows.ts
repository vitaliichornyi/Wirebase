'use server';

import { z } from 'zod';

import { createSafeAction } from '@/shared/lib/create-safe-action';
import {
  createFlowSchema,
  updateFlowStatusSchema,
} from '@/features/flows/schemas/flows';
import * as flowsService from '@/features/flows/services/flows';

export const createFlow = createSafeAction(createFlowSchema, flowsService.createFlow);

export const updateFlowStatus = createSafeAction(
  updateFlowStatusSchema,
  flowsService.updateFlowStatus,
);

export const listFlows = createSafeAction(z.void(), flowsService.listFlows);
