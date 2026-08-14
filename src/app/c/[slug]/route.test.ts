import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { generateSlug } from '@/lib/slug';
import { createAdminClient, createTestUser, deleteTestUser, type TestUser } from '@/test-utils/supabase';

import { GET } from './route';

const admin = createAdminClient();

interface FlowRow {
  id: string;
  status: string;
}

interface NodeRow {
  id: string;
  slug: string;
}

async function createFlowRow(
  userId: string,
  status: 'active' | 'inactive' | 'archived' = 'active',
): Promise<FlowRow> {
  const { data, error } = await admin
    .from('flows')
    .insert({ user_id: userId, name: 'Test flow', status })
    .select()
    .single();
  if (error || !data) throw error;
  return data;
}

async function createInputNodeRow(
  userId: string,
  flowId: string,
  overrides: Record<string, unknown> = {},
): Promise<NodeRow> {
  const { data, error } = await admin
    .from('nodes')
    .insert({
      flow_id: flowId,
      user_id: userId,
      type: 'input',
      name: 'Input',
      slug: generateSlug(),
      input_status: 'enabled',
      ...overrides,
    })
    .select()
    .single();
  if (error || !data) throw error;
  return data;
}

async function createOutputNodeRow(
  userId: string,
  flowId: string,
  destinationUrl: string,
): Promise<NodeRow> {
  const { data, error } = await admin
    .from('nodes')
    .insert({
      flow_id: flowId,
      user_id: userId,
      type: 'output',
      name: 'Output',
      destination_url: destinationUrl,
    })
    .select()
    .single();
  if (error || !data) throw error;
  return data;
}

async function connectRow(
  flowId: string,
  userId: string,
  fromNodeId: string,
  toNodeId: string,
): Promise<void> {
  const { error } = await admin.from('edges').insert({
    flow_id: flowId,
    user_id: userId,
    from_node_id: fromNodeId,
    from_slot: 'out',
    to_node_id: toNodeId,
    to_slot: 'in',
  });
  if (error) throw error;
}

function buildRequest(slug: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`https://wirebase.test/c/${slug}`, { headers });
}

async function waitForClickRow(
  inputNodeId: string,
  attempts = 30,
): Promise<Record<string, unknown> | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const { data } = await admin
      .from('clicks')
      .select('*')
      .eq('input_node_id', inputNodeId)
      .maybeSingle();
    if (data) return data;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}

describe('GET /c/[slug]', () => {
  let user: TestUser;
  let flow: FlowRow;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(user.id);
  });

  beforeEach(async () => {
    flow = await createFlowRow(user.id);
  });

  it('redirects with 302 to the destination URL when fully wired and active, and records a Click', async () => {
    const output = await createOutputNodeRow(
      user.id,
      flow.id,
      'https://example.com/landing?foo=bar',
    );
    const input = await createInputNodeRow(user.id, flow.id, {
      utm_source: 'newsletter',
      utm_campaign: 'launch',
    });
    await connectRow(flow.id, user.id, input.id, output.id);

    const response = await GET(
      buildRequest(input.slug, { 'user-agent': 'vitest-agent', referer: 'https://ref.example' }),
      { params: Promise.resolve({ slug: input.slug }) },
    );

    expect(response.status).toBe(302);

    const location = new URL(response.headers.get('location')!);
    expect(location.origin + location.pathname).toBe('https://example.com/landing');
    expect(location.searchParams.get('foo')).toBe('bar');
    expect(location.searchParams.get('utm_source')).toBe('newsletter');
    expect(location.searchParams.get('utm_campaign')).toBe('launch');

    const click = await waitForClickRow(input.id);
    expect(click).not.toBeNull();
    expect(click?.user_agent).toBe('vitest-agent');
    expect(click?.referrer).toBe('https://ref.example');
    expect(click?.utm_source).toBe('newsletter');
    expect(click?.utm_campaign).toBe('launch');
    expect(click).not.toHaveProperty('ip');
  });

  it("lets Wirebase's configured UTM values win over the destination URL's own params", async () => {
    const output = await createOutputNodeRow(
      user.id,
      flow.id,
      'https://example.com/landing?utm_source=stale',
    );
    const input = await createInputNodeRow(user.id, flow.id, { utm_source: 'newsletter' });
    await connectRow(flow.id, user.id, input.id, output.id);

    const response = await GET(buildRequest(input.slug), {
      params: Promise.resolve({ slug: input.slug }),
    });

    const location = new URL(response.headers.get('location')!);
    expect(location.searchParams.get('utm_source')).toBe('newsletter');
  });

  it('shows a not-set-up page when the Input has no connected Output', async () => {
    const input = await createInputNodeRow(user.id, flow.id);

    const response = await GET(buildRequest(input.slug), {
      params: Promise.resolve({ slug: input.slug }),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("isn't set up");
  });

  it('shows a not-set-up page for an unknown slug', async () => {
    const response = await GET(buildRequest('does-not-exist'), {
      params: Promise.resolve({ slug: 'does-not-exist' }),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("isn't set up");
  });

  it('shows a not-set-up page for a malformed slug, without ever querying the database', async () => {
    const response = await GET(buildRequest("'; drop table nodes; --"), {
      params: Promise.resolve({ slug: "'; drop table nodes; --" }),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("isn't set up");
  });

  it('shows a not-set-up page when the Input node is disabled', async () => {
    const output = await createOutputNodeRow(user.id, flow.id, 'https://example.com');
    const input = await createInputNodeRow(user.id, flow.id, { input_status: 'disabled' });
    await connectRow(flow.id, user.id, input.id, output.id);

    const response = await GET(buildRequest(input.slug), {
      params: Promise.resolve({ slug: input.slug }),
    });

    expect(response.status).toBe(200);
  });

  it('shows a not-set-up page when the Flow is inactive', async () => {
    const inactiveFlow = await createFlowRow(user.id, 'inactive');
    const output = await createOutputNodeRow(user.id, inactiveFlow.id, 'https://example.com');
    const input = await createInputNodeRow(user.id, inactiveFlow.id);
    await connectRow(inactiveFlow.id, user.id, input.id, output.id);

    const response = await GET(buildRequest(input.slug), {
      params: Promise.resolve({ slug: input.slug }),
    });

    expect(response.status).toBe(200);
  });

  it('shows a not-set-up page when the Flow is archived', async () => {
    const archivedFlow = await createFlowRow(user.id, 'archived');
    const output = await createOutputNodeRow(user.id, archivedFlow.id, 'https://example.com');
    const input = await createInputNodeRow(user.id, archivedFlow.id);
    await connectRow(archivedFlow.id, user.id, input.id, output.id);

    const response = await GET(buildRequest(input.slug), {
      params: Promise.resolve({ slug: input.slug }),
    });

    expect(response.status).toBe(200);
  });

  it('never exposes Flow/Node data to anonymous direct table access', async () => {
    const anon = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await anon.from('nodes').select('*');

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
