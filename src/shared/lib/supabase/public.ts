import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Used only by the anonymous redirect route: no cookies, no session, just the
// anon key calling public RPCs (see public-data-isolation rule).
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
