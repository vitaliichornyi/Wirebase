import { z } from 'zod';

import { INPUT_NODE_STATUSES } from '@/types/nodes';

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

export const updateInputNodeStatusSchema = z.object({
  nodeId: z.uuid(),
  status: z.enum(INPUT_NODE_STATUSES),
});

export type UpdateInputNodeStatusInput = z.infer<typeof updateInputNodeStatusSchema>;

export const deleteNodeSchema = z.object({
  nodeId: z.uuid(),
});

export type DeleteNodeInput = z.infer<typeof deleteNodeSchema>;

// Every field is required (though nullable) rather than optional: this is a
// full-replace action, matching the canvas properties form's explicit-save
// model (spec.md: one form submitting all UTM fields at once). An optional
// field here would silently invite partial updates that would wipe the
// fields left out of the call.
const utmFieldSchema = z.string().trim().max(255).nullable();

export const updateInputNodeUtmSchema = z.object({
  nodeId: z.uuid(),
  utmSource: utmFieldSchema,
  utmMedium: utmFieldSchema,
  utmCampaign: utmFieldSchema,
  utmTerm: utmFieldSchema,
  utmContent: utmFieldSchema,
});

export type UpdateInputNodeUtmInput = z.infer<typeof updateInputNodeUtmSchema>;
