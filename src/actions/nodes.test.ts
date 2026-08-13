import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';

let activeClient: SupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => activeClient,
}));

const { createFlow } = await import('@/actions/flows');
const { addInputNode, addOutputNode } = await import('@/actions/nodes');

describe('node actions', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let flowId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClient = owner.client;
    const flowResult = await createFlow({ name: 'Owner flow' });
    flowId = flowResult.data!.flow.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('adds an Output node with a destination URL', async () => {
    activeClient = owner.client;

    const result = await addOutputNode({
      flowId,
      name: 'My destination',
      destinationUrl: 'https://example.com/landing',
    });

    expect(result.error).toBeNull();
    expect(result.data?.type).toBe('output');
    expect(result.data?.destinationUrl).toBe('https://example.com/landing');
    expect(result.data?.flowId).toBe(flowId);
  });

  it('adds a second Input node to an existing Flow', async () => {
    activeClient = owner.client;

    const result = await addInputNode({ flowId, name: 'Second link' });

    expect(result.error).toBeNull();
    expect(result.data?.type).toBe('input');
    expect(result.data?.flowId).toBe(flowId);

    const { data: inputNodes } = await activeClient
      .from('nodes')
      .select('*')
      .eq('flow_id', flowId)
      .eq('type', 'input');

    expect(inputNodes).toHaveLength(2);
  });

  it('scopes node mutations to the authenticated owner', async () => {
    activeClient = otherUser.client;

    const result = await addOutputNode({
      flowId,
      name: 'Not mine',
      destinationUrl: 'https://example.com/nope',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Flow not found');
  });
});
