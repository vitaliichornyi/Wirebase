import type { User } from '@supabase/supabase-js';

import { createClient } from '@/shared/lib/supabase/server';
import type { ActionResponse } from '@/shared/types/action-response';

export async function getUser(): Promise<ActionResponse<User>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { data: null, error: error?.message ?? 'Unauthorized' };
    }

    return { data: user, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}
