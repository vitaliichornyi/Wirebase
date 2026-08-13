import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { connectEdge } from '@/actions/edges';
import { createFlow } from '@/actions/flows';
import {
  addInputNode,
  addOutputNode,
  deleteNode,
  updateInputNodeStatus,
  updateInputNodeUtm,
} from '@/actions/nodes';
import { updateInputNodeUtmSchema } from '@/schemas/nodes';
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

describe('updateInputNodeStatus', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let inputNodeId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Status flow' });
    inputNodeId = flowResult.data!.inputNode.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('disables an Input node independently of its Flow status', async () => {
    activeClientHolder.client = owner.client;

    const result = await updateInputNodeStatus({ nodeId: inputNodeId, status: 'disabled' });

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('disabled');
  });

  it('re-enables a previously disabled Input node', async () => {
    activeClientHolder.client = owner.client;

    const result = await updateInputNodeStatus({ nodeId: inputNodeId, status: 'enabled' });

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('enabled');
  });

  it('does not let another user change the Input node status', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await updateInputNodeStatus({ nodeId: inputNodeId, status: 'disabled' });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Input node not found');
  });
});

describe('updateInputNodeUtm', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let inputNodeId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'UTM flow' });
    inputNodeId = flowResult.data!.inputNode.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('stores the five optional UTM fields on an Input node', async () => {
    activeClientHolder.client = owner.client;

    const result = await updateInputNodeUtm({
      nodeId: inputNodeId,
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'launch',
      utmTerm: 'wirebase',
      utmContent: 'header-link',
    });

    expect(result.error).toBeNull();
    expect(result.data?.utmSource).toBe('newsletter');
    expect(result.data?.utmMedium).toBe('email');
    expect(result.data?.utmCampaign).toBe('launch');
    expect(result.data?.utmTerm).toBe('wirebase');
    expect(result.data?.utmContent).toBe('header-link');
  });

  it('clears a UTM field back to null when given an empty string', async () => {
    activeClientHolder.client = owner.client;

    const result = await updateInputNodeUtm({
      nodeId: inputNodeId,
      utmSource: '',
      utmMedium: 'email',
      utmCampaign: 'launch',
      utmTerm: 'wirebase',
      utmContent: 'header-link',
    });

    expect(result.error).toBeNull();
    expect(result.data?.utmSource).toBeNull();
    expect(result.data?.utmMedium).toBe('email');
  });

  it('does not let another user configure UTM values on a node they do not own', async () => {
    activeClientHolder.client = otherUser.client;

    const result = await updateInputNodeUtm({
      nodeId: inputNodeId,
      utmSource: 'not-mine',
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe('Input node not found');

    const { data: nodeRow } = await owner.client
      .from('nodes')
      .select('*')
      .eq('id', inputNodeId)
      .single();

    expect(nodeRow?.utm_medium).toBe('email');
  });

  it('requires every UTM field to be present, so a call cannot silently wipe the fields it omits', async () => {
    const parseResult = updateInputNodeUtmSchema.safeParse({
      nodeId: inputNodeId,
      utmSource: 'newsletter',
    });

    expect(parseResult.success).toBe(false);
  });
});

describe('deleteNode', () => {
  let owner: TestUser;
  let otherUser: TestUser;
  let flowId: string;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();

    activeClientHolder.client = owner.client;
    const flowResult = await createFlow({ name: 'Delete flow' });
    flowId = flowResult.data!.flow.id;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('soft-deletes a node and keeps the row and its Click history', async () => {
    activeClientHolder.client = owner.client;

    const inputResult = await addInputNode({ flowId, name: 'Deletable link' });
    const nodeId = inputResult.data!.id;

    const result = await deleteNode({ nodeId });
    expect(result.error).toBeNull();

    const { data: nodeRow } = await activeClientHolder.client!
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    expect(nodeRow).not.toBeNull();
    expect(nodeRow?.deleted_at).not.toBeNull();
  });

  it('soft-deletes an Output node the same way as an Input node', async () => {
    activeClientHolder.client = owner.client;

    const outputResult = await addOutputNode({
      flowId,
      name: 'Deletable destination',
      destinationUrl: 'https://example.com/deletable',
    });
    const nodeId = outputResult.data!.id;

    const result = await deleteNode({ nodeId });
    expect(result.error).toBeNull();

    const { data: nodeRow } = await activeClientHolder.client!
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    expect(nodeRow).not.toBeNull();
    expect(nodeRow?.deleted_at).not.toBeNull();
  });

  it('removes only the deleted node\'s own edges, leaving a shared Output intact for other Input nodes', async () => {
    activeClientHolder.client = owner.client;

    const output = (
      await addOutputNode({ flowId, name: 'Shared destination', destinationUrl: 'https://example.com' })
    ).data!;
    const inputA = (await addInputNode({ flowId, name: 'Link A' })).data!;
    const inputB = (await addInputNode({ flowId, name: 'Link B' })).data!;

    await connectEdge({ flowId, fromNodeId: inputA.id, toNodeId: output.id });
    await connectEdge({ flowId, fromNodeId: inputB.id, toNodeId: output.id });

    const result = await deleteNode({ nodeId: inputA.id });
    expect(result.error).toBeNull();

    const { data: remainingEdges } = await activeClientHolder.client!
      .from('edges')
      .select('*')
      .eq('to_node_id', output.id);

    expect(remainingEdges).toHaveLength(1);
    expect(remainingEdges?.[0]?.from_node_id).toBe(inputB.id);

    const { data: outputRow } = await activeClientHolder.client!
      .from('nodes')
      .select('*')
      .eq('id', output.id)
      .single();

    expect(outputRow?.deleted_at).toBeNull();
  });

  it('does not let another user delete a node they do not own', async () => {
    activeClientHolder.client = owner.client;
    const inputResult = await addInputNode({ flowId, name: 'Owner-only link' });
    const nodeId = inputResult.data!.id;

    activeClientHolder.client = otherUser.client;
    const result = await deleteNode({ nodeId });

    expect(result.error).toBe('Node not found');
  });
});
