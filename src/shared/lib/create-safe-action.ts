import type { User } from '@supabase/supabase-js';
import type { z } from 'zod';

import {
  DEMO_ACCOUNT_RESTRICTION_MESSAGE,
  DEMO_ACCOUNT_USER_ID,
} from '@/shared/lib/demo-account';
import { getUser } from '@/shared/lib/get-user';
import type { ActionResponse } from '@/shared/types/action-response';

interface CreateSafeActionOptions {
  skipDemoGuard?: boolean;
}

export function createSafeAction<TSchema extends z.ZodType, TOutput = void>(
  schema: TSchema,
  handler: (
    input: z.infer<TSchema>,
    user: User,
  ) => Promise<ActionResponse<TOutput>>,
  options?: CreateSafeActionOptions,
) {
  return async (
    values?: z.input<TSchema>,
  ): Promise<ActionResponse<TOutput>> => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues[0]?.message || 'Validation error',
      } as ActionResponse<TOutput>;
    }

    const { data: user, error: userError } = await getUser();
    if (userError || !user) {
      return {
        data: null,
        error: userError || 'Unauthorized',
      } as ActionResponse<TOutput>;
    }

    if (!options?.skipDemoGuard && user.id === DEMO_ACCOUNT_USER_ID) {
      return {
        data: null,
        error: DEMO_ACCOUNT_RESTRICTION_MESSAGE,
      } as ActionResponse<TOutput>;
    }

    return handler(parsed.data, user);
  };
}
