import type { User } from '@supabase/supabase-js';
import type { z } from 'zod';

import { getUser } from '@/shared/lib/get-user';
import type { ActionResponse } from '@/shared/types/action-response';

export function createSafeAction<TSchema extends z.ZodType, TOutput = void>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>, user: User) => Promise<ActionResponse<TOutput>>,
) {
  return async (values?: z.input<TSchema>): Promise<ActionResponse<TOutput>> => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues[0]?.message || 'Validation error',
      } as ActionResponse<TOutput>;
    }

    const { data: user, error: userError } = await getUser();
    if (userError || !user) {
      return { data: null, error: userError || 'Unauthorized' } as ActionResponse<TOutput>;
    }

    return handler(parsed.data, user);
  };
}
