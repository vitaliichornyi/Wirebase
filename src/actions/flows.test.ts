import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createFlow } from '@/actions/flows';
import { activeClientHolder } from '@/test-utils/mock-supabase-server';
import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';

describe('createFlow', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
    activeClientHolder.client = user.client;
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
  });

  it('creates a Flow seeded with exactly one auto-generated Input node', async () => {
    const result = await createFlow({ name: 'My flow' });

    expect(result.error).toBeNull();
    expect(result.data?.flow.name).toBe('My flow');
    expect(result.data?.flow.status).toBe('active');
    expect(result.data?.flow.userId).toBe(user.id);

    const inputNode = result.data!.inputNode;
    expect(inputNode.type).toBe('input');
    expect(inputNode.flowId).toBe(result.data!.flow.id);
    expect(inputNode.status).toBe('enabled');
    expect(inputNode.slug).toMatch(/^[a-zA-Z0-9]{8}$/);

    const { data: nodes } = await activeClientHolder.client!
      .from('nodes')
      .select('*')
      .eq('flow_id', result.data!.flow.id);

    expect(nodes).toHaveLength(1);
    expect(nodes?.[0]?.type).toBe('input');
  });

  it('defaults the name to "Untitled flow" when none is given', async () => {
    const result = await createFlow({});

    expect(result.error).toBeNull();
    expect(result.data?.flow.name).toBe('Untitled flow');
  });
});
