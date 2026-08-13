import { z } from 'zod';

export const addInputNodeSchema = z.object({
  flowId: z.uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export type AddInputNodeInput = z.infer<typeof addInputNodeSchema>;

export const addOutputNodeSchema = z.object({
  flowId: z.uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  destinationUrl: z.url(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export type AddOutputNodeInput = z.infer<typeof addOutputNodeSchema>;
