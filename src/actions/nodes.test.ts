import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createFlow } from '@/actions/flows';
import { addInputNode, addOutputNode } from '@/actions/nodes';
import { activeClientHolder } from '@/test-utils/mock-supabase-server';
import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';

describe('node actions', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let flowId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Owner flow' });
    flowId = flowResult.data!.flow.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('adds an Output node with a destination URL', async () => {
    activeClientHolder.client = owner.client;

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
    activeClientHolder.client = owner.client;

    const result = await addInputNode({ flowId, name: 'Second link' });

    expect(result.error).toBeNull();
    expect(result.data?.type).toBe('input');
    expect(result.data?.flowId).toBe(flowId);

    const { data: inputNodes } = await activeClientHolder.client
      .from('nodes')
      .select('*')
      .eq('flow_id', flowId)
      .eq('type', 'input');

    expect(inputNodes).toHaveLength(2);
  });

  it('scopes node mutations to the authenticated owner', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await addOutputNode({
      flowId,
      name: 'Not mine',
      destinationUrl: 'https://example.com/nope',
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Flow not found');
  });
});
