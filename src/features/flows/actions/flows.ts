'use server';

import { z } from 'zod';

import { createSafeAction } from '@/shared/lib/create-safe-action';
import {
  createFlowSchema,
  getFlowSchema,
  renameFlowSchema,
  updateFlowStatusSchema,
} from '@/features/flows/schemas/flows';
import * as flowsService from '@/features/flows/services/flows';

export const createFlow = createSafeAction(createFlowSchema, flowsService.createFlow);

export const updateFlowStatus = createSafeAction(
  updateFlowStatusSchema,
  flowsService.updateFlowStatus,
);

export const renameFlow = createSafeAction(renameFlowSchema, flowsService.renameFlow);

export const getFlow = createSafeAction(getFlowSchema, flowsService.getFlow);

export const listFlows = createSafeAction(z.void(), flowsService.listFlows);
