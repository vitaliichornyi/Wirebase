import { generateSlug } from '@/features/flows';
import { createAdminClient } from '@/test-utils/supabase';

// Row-seeding helpers shared by every test that needs a Flow/Node/Edge/Click
// already in the database, inserted directly via the service-role client to
// bypass RLS (see route.test.ts and features/dashboard/actions/click-stats.test.ts).
const admin = createAdminClient();

export interface TestFlowRow {
  id: string;
  status: string;
}

export interface TestNodeRow {
  id: string;
  slug: string;
}

export async function createFlowRow(
  userId: string,
  status: 'active' | 'inactive' | 'archived' = 'active',
): Promise<TestFlowRow> {
  const { data, error } = await admin
    .from('flows')
    .insert({ user_id: userId, name: 'Test flow', status })
    .select()
    .single();
  if (error || !data) throw error;
  return data;
}

export async function createInputNodeRow(
  userId: string,
  flowId: string,
  overrides: Record<string, unknown> = {},
): Promise<TestNodeRow> {
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

export async function createOutputNodeRow(
  userId: string,
  flowId: string,
  destinationUrl: string,
): Promise<TestNodeRow> {
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

export async function connectRow(
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

export async function insertClickRows(rows: Record<string, unknown>[]): Promise<void> {
  const { error } = await admin.from('clicks').insert(rows);
  if (error) throw error;
}
