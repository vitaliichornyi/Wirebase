'use server';

import { createSafeAction } from '@/shared/lib/create-safe-action';
import {
  addInputNodeSchema,
  addOutputNodeSchema,
  deleteNodeSchema,
  renameNodeSchema,
  repositionNodeSchema,
  updateInputNodeStatusSchema,
  updateInputNodeUtmSchema,
  updateOutputDestinationUrlSchema,
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

export const renameNode = createSafeAction(renameNodeSchema, nodesService.renameNode);

export const repositionNode = createSafeAction(
  repositionNodeSchema,
  nodesService.repositionNode,
);

export const updateOutputDestinationUrl = createSafeAction(
  updateOutputDestinationUrlSchema,
  nodesService.updateOutputDestinationUrl,
);
