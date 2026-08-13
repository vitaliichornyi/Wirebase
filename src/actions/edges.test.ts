import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';
import type { InputNode, OutputNode } from '@/types/nodes';

let activeClient: SupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => activeClient,
}));

const { createFlow } = await import('@/actions/flows');
const { addInputNode, addOutputNode } = await import('@/actions/nodes');
const { connectEdge } = await import('@/actions/edges');

describe('connectEdge', () => {
  let user: TestUser;
  let flowId: string;
  let inputA: InputNode;
  let inputB: InputNode;
  let output: OutputNode;

  beforeAll(async () => {
    user = await createTestUser();
    activeClient = user.client;

    const flowResult = await createFlow({ name: 'Edges flow' });
    flowId = flowResult.data!.flow.id;
    inputA = flowResult.data!.inputNode;

    inputB = (await addInputNode({ flowId, name: 'Second link' })).data!;
    output = (await addOutputNode({
      flowId,
      name: 'Destination',
      destinationUrl: 'https://example.com',
    })).data!;
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
  });

  it('connects an Input node to an Output node', async () => {
    const result = await connectEdge({
      flowId,
      fromNodeId: inputA.id,
      toNodeId: output.id,
    });

    expect(result.error).toBeNull();
    expect(result.data?.fromNodeId).toBe(inputA.id);
    expect(result.data?.toNodeId).toBe(output.id);
    expect(result.data?.fromSlot).toBe('out');
    expect(result.data?.toSlot).toBe('in');
  });

  it('allows multiple Input nodes to connect to the same Output node', async () => {
    const result = await connectEdge({
      flowId,
      fromNodeId: inputB.id,
      toNodeId: output.id,
    });

    expect(result.error).toBeNull();

    const { data: edges } = await activeClient
      .from('edges')
      .select('*')
      .eq('to_node_id', output.id);

    expect(edges).toHaveLength(2);
  });

  it('rejects connecting an Output node as the source', async () => {
    const result = await connectEdge({
      flowId,
      fromNodeId: output.id,
      toNodeId: inputA.id,
    });

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/Input node to an Output node/);
  });
});
