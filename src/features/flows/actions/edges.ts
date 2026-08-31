'use server';

import { createSafeAction } from '@/shared/lib/create-safe-action';
import {
  connectEdgeSchema,
  disconnectEdgeSchema,
} from '@/features/flows/schemas/edges';
import * as edgesService from '@/features/flows/services/edges';

export const connectEdge = createSafeAction(connectEdgeSchema, edgesService.connectEdge);

export const disconnectEdge = createSafeAction(
  disconnectEdgeSchema,
  edgesService.disconnectEdge,
);
