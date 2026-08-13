import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

// Server Actions call the cookie-based createClient() from lib/supabase/server,
// which only works inside a real Next.js request. Tests stand in an
// authenticated-as-test-user client instead, set per test file via
// activeClientHolder.client.
export const activeClientHolder: { client: SupabaseClient | null } = { client: null };

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => activeClientHolder.client,
}));
