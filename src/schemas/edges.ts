import { z } from 'zod';

export const connectEdgeSchema = z.object({
  flowId: z.uuid(),
  fromNodeId: z.uuid(),
  toNodeId: z.uuid(),
});

export type ConnectEdgeInput = z.infer<typeof connectEdgeSchema>;
