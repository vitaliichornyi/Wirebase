import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createSafeAction } from './create-safe-action';
import { activeClientHolder } from '@/test-utils/mock-supabase-server';
import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';

const testSchema = z.object({ value: z.string().min(1) });

describe('createSafeAction', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
  });

  it('short-circuits on validation failure without calling the handler', async () => {
    activeClientHolder.client = user.client;
    const handler = vi.fn();
    const action = createSafeAction(testSchema, handler);

    const result = await action({ value: '' });

    expect(result.error).toBeTruthy();
    expect(handler).not.toHaveBeenCalled();
  });

  it('short-circuits as Unauthorized when there is no authenticated session', async () => {
    activeClientHolder.client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const handler = vi.fn();
    const action = createSafeAction(testSchema, handler);

    const result = await action({ value: 'ok' });

    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler with the parsed input and the authenticated user on success', async () => {
    activeClientHolder.client = user.client;
    const handler = vi.fn().mockResolvedValue({ data: 'done', error: null });
    const action = createSafeAction(testSchema, handler);

    const result = await action({ value: 'ok' });

    expect(handler).toHaveBeenCalledWith(
      { value: 'ok' },
      expect.objectContaining({ id: user.id }),
    );
    expect(result).toEqual({ data: 'done', error: null });
  });
});
