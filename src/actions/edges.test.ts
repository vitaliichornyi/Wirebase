import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createFlow } from '@/actions/flows';
import { addInputNode, addOutputNode } from '@/actions/nodes';
import { connectEdge } from '@/actions/edges';
import { activeClientHolder } from '@/test-utils/mock-supabase-server';
import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';
import type { InputNode, OutputNode } from '@/types/nodes';

describe('connectEdge', () => {
  let user: TestUser;
  let flowId: string;
  let inputA: InputNode;
  let inputB: InputNode;
  let output: OutputNode;

  beforeAll(async () => {
    user = await createTestUser();
    activeClientHolder.client = user.client;

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

  it('rejects reconnecting an Input node that is already wired', async () => {
    const result = await connectEdge({
      flowId,
      fromNodeId: inputA.id,
      toNodeId: output.id,
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('This node is already connected to a destination');
  });

  it('allows multiple Input nodes to connect to the same Output node', async () => {
    const result = await connectEdge({
      flowId,
      fromNodeId: inputB.id,
      toNodeId: output.id,
    });

    expect(result.error).toBeNull();

    const { data: edges } = await activeClientHolder.client!
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
