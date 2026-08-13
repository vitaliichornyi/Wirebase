import { randomUUID } from 'node:crypto';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient(): SupabaseClient {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface TestUser {
  id: string;
  email: string;
  client: SupabaseClient;
}

// Creates a real, throwaway auth user and returns a Supabase client
// authenticated as that user (via bearer token) — used to stand in for the
// cookie-based server client, which only works inside a real Next.js request.
export async function createTestUser(): Promise<TestUser> {
  const admin = createAdminClient();
  const email = `test-${randomUUID()}@wirebase.test`;
  const password = randomUUID();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? 'Failed to create test user');
  }

  const anon = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signedIn.session) {
    throw new Error(signInError?.message ?? 'Failed to sign in test user');
  }

  const client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${signedIn.session.access_token}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { id: created.user.id, email, client };
}

// Deleting the auth user cascades through flows -> nodes/edges -> clicks.
export async function deleteTestUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
}
