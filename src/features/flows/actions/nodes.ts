'use server';

import { createSafeAction } from '@/shared/lib/create-safe-action';
import {
  addInputNodeSchema,
  addOutputNodeSchema,
  deleteNodeSchema,
  updateInputNodeStatusSchema,
  updateInputNodeUtmSchema,
} from '@/features/flows/schemas/nodes';
import * as nodesService from '@/features/flows/services/nodes';

export const addInputNode = createSafeAction(
  addInputNodeSchema,
  nodesService.addInputNode,
);

export const addOutputNode = createSafeAction(
  addOutputNodeSchema,
  nodesService.addOutputNode,
);

export const updateInputNodeStatus = createSafeAction(
  updateInputNodeStatusSchema,
  nodesService.updateInputNodeStatus,
);

export const updateInputNodeUtm = createSafeAction(
  updateInputNodeUtmSchema,
  nodesService.updateInputNodeUtm,
);

export const deleteNode = createSafeAction(deleteNodeSchema, nodesService.deleteNode);
