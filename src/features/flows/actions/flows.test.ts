import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createFlow,
  getFlow,
  listFlows,
  renameFlow,
  updateFlowStatus,
} from '@/features/flows/actions/flows';
import { addInputNode, addOutputNode, deleteNode } from '@/features/flows/actions/nodes';
import { connectEdge } from '@/features/flows/actions/edges';
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

describe('updateFlowStatus', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let flowId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Status flow' });
    flowId = flowResult.data!.flow.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('pauses an Active Flow by setting it Inactive', async () => {
    activeClientHolder.client = owner.client;

    const result = await updateFlowStatus({ flowId, status: 'inactive' });

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('inactive');
  });

  it('reactivates an Inactive Flow back to Active', async () => {
    activeClientHolder.client = owner.client;

    const result = await updateFlowStatus({ flowId, status: 'active' });

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('active');
  });

  it('archives a Flow and can unarchive it again', async () => {
    activeClientHolder.client = owner.client;

    const archived = await updateFlowStatus({ flowId, status: 'archived' });
    expect(archived.error).toBeNull();
    expect(archived.data?.status).toBe('archived');

    const unarchived = await updateFlowStatus({ flowId, status: 'active' });
    expect(unarchived.error).toBeNull();
    expect(unarchived.data?.status).toBe('active');
  });

  it('does not let another user change the Flow status', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await updateFlowStatus({ flowId, status: 'archived' });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Flow not found');
  });
});

describe('listFlows', () => {
  let owner: TestUser;
  let otherUser: TestUser;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('lists only the authenticated user\'s Flows, most-recently-edited first', async () => {
    activeClientHolder.client = owner.client;
    const first = (await createFlow({ name: 'First flow' })).data!.flow;
    const second = (await createFlow({ name: 'Second flow' })).data!.flow;

    activeClientHolder.client = otherUser.client;
    await createFlow({ name: 'Someone else\'s flow' });

    activeClientHolder.client = owner.client;
    await updateFlowStatus({ flowId: first.id, status: 'inactive' });

    const result = await listFlows();

    expect(result.error).toBeNull();
    const names = result.data!.map((flow) => flow.name);
    expect(names).toContain('First flow');
    expect(names).toContain('Second flow');
    expect(names).not.toContain('Someone else\'s flow');

    const firstIndex = result.data!.findIndex((flow) => flow.id === first.id);
    const secondIndex = result.data!.findIndex((flow) => flow.id === second.id);
    expect(firstIndex).toBeLessThan(secondIndex);
  });

  it('counts only non-deleted Input nodes as the link count, excluding Output nodes', async () => {
    activeClientHolder.client = owner.client;
    const flow = (await createFlow({ name: 'Counted flow' })).data!.flow;

    const secondInput = (
      await addInputNode({ flowId: flow.id, name: 'Second link' })
    ).data!;
    await addInputNode({ flowId: flow.id, name: 'Third link' });
    await addOutputNode({
      flowId: flow.id,
      name: 'Destination',
      destinationUrl: 'https://example.com',
    });
    await deleteNode({ nodeId: secondInput.id });

    const result = await listFlows();

    const listedFlow = result.data!.find((item) => item.id === flow.id);
    expect(listedFlow?.linkCount).toBe(2);
  });
});

describe('renameFlow', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let flowId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Original name' });
    flowId = flowResult.data!.flow.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('renames a Flow inline from the canvas header', async () => {
    activeClientHolder.client = owner.client;

    const result = await renameFlow({ flowId, name: 'Renamed flow' });

    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('Renamed flow');
  });

  it('does not let another user rename a Flow they do not own', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await renameFlow({ flowId, name: 'Hijacked name' });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Flow not found');
  });
});

describe('getFlow', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let flowId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Graph flow' });
    flowId = flowResult.data!.flow.id;

    const output = (
      await addOutputNode({
        flowId,
        name: 'Destination',
        destinationUrl: 'https://example.com',
      })
    ).data!;
    await connectEdge({
      flowId,
      fromNodeId: flowResult.data!.inputNode.id,
      toNodeId: output.id,
    });

    const deletableInput = (
      await addInputNode({ flowId, name: 'Deletable link' })
    ).data!;
    await deleteNode({ nodeId: deletableInput.id });
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('returns the Flow with its non-deleted nodes and edges for the canvas to render', async () => {
    activeClientHolder.client = owner.client;

    const result = await getFlow({ flowId });

    expect(result.error).toBeNull();
    expect(result.data?.flow.id).toBe(flowId);
    expect(result.data?.nodes).toHaveLength(2);
    expect(result.data?.edges).toHaveLength(1);
  });

  it('does not let another user fetch a Flow they do not own', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await getFlow({ flowId });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Flow not found');
  });
});
