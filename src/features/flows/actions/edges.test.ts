import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createFlow } from '@/features/flows/actions/flows';
import { addInputNode, addOutputNode } from '@/features/flows/actions/nodes';
import { connectEdge, disconnectEdge } from '@/features/flows/actions/edges';
import { activeClientHolder } from '@/test-utils/mock-supabase-server';
import { createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';
import type { InputNode, OutputNode } from '@/features/flows/types/nodes';

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

describe('disconnectEdge', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let edgeId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Disconnect flow' });
    const output = (
      await addOutputNode({
        flowId: flowResult.data!.flow.id,
        name: 'Destination',
        destinationUrl: 'https://example.com',
      })
    ).data!;

    const edge = (
      await connectEdge({
        flowId: flowResult.data!.flow.id,
        fromNodeId: flowResult.data!.inputNode.id,
        toNodeId: output.id,
      })
    ).data!;
    edgeId = edge.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('does not let another user disconnect an edge they do not own', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await disconnectEdge({ edgeId });

    expect(result.error).toBe('Edge not found');
  });

  it('removes the edge, freeing the Input node to be reconnected', async () => {
    activeClientHolder.client = owner.client;

    const result = await disconnectEdge({ edgeId });

    expect(result.error).toBeNull();

    const { data: remaining } = await activeClientHolder.client!
      .from('edges')
      .select('*')
      .eq('id', edgeId);

    expect(remaining).toHaveLength(0);
  });
});
