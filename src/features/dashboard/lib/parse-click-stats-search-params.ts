import { getClickStatsSchema } from '@/features/dashboard/schemas/click-stats';

import type { GetClickStatsInput } from '@/features/dashboard/schemas/click-stats';
import type { z } from 'zod';

export type ClickStatsSearchParams = {
  [Key in keyof GetClickStatsInput]?: string | string[];
};

function parseField<TSchema extends z.ZodType>(
  schema: TSchema,
  rawValue: string | string[] | undefined,
  fallback: z.infer<TSchema>,
): z.infer<TSchema> {
  const parsed = schema.safeParse(rawValue);
  return parsed.success ? parsed.data : fallback;
}

export function parseClickStatsSearchParams(
  searchParams: ClickStatsSearchParams,
): GetClickStatsInput {
  const { shape } = getClickStatsSchema;

  return {
    timeRange: parseField(shape.timeRange, searchParams.timeRange, '7d'),
    flowId: parseField(shape.flowId, searchParams.flowId, undefined),
    inputNodeId: parseField(
      shape.inputNodeId,
      searchParams.inputNodeId,
      undefined,
    ),
    country: parseField(shape.country, searchParams.country, undefined),
  };
}
