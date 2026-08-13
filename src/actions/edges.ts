'use server';

import { getUser } from '@/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { connectEdgeSchema, type ConnectEdgeInput } from '@/schemas/edges';
import type { ActionResponse } from '@/types/action-response';
import type { Edge, EdgeRow } from '@/types/edges';

const UNIQUE_VIOLATION = '23505';

function mapEdgeRow(row: EdgeRow): Edge {
  return {
    id: row.id,
    flowId: row.flow_id,
    userId: row.user_id,
    fromNodeId: row.from_node_id,
    fromSlot: row.from_slot,
    toNodeId: row.to_node_id,
    toSlot: row.to_slot,
    createdAt: row.created_at,
  };
}

// Every node has exactly one slot per direction today ("out"/"in") — see
// ADR 0002, so an "out" slot can only ever point at one destination.
export async function connectEdge(
  values: ConnectEdgeInput,
): Promise<ActionResponse<Edge>> {
  try {
    const parsed = connectEdgeSchema.safeParse(values);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' };
    }

    const { data: user, error: userError } = await getUser();
    if (userError || !user) {
      return { data: null, error: userError || 'Unauthorized' };
    }

    const supabase = await createClient();

    const { data: nodeRows, error: nodesError } = await supabase
      .from('nodes')
      .select('id, type')
      .eq('flow_id', parsed.data.flowId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .in('id', [parsed.data.fromNodeId, parsed.data.toNodeId]);

    if (nodesError) {
      return { data: null, error: nodesError.message };
    }

    const fromNode = nodeRows?.find((node) => node.id === parsed.data.fromNodeId);
    const toNode = nodeRows?.find((node) => node.id === parsed.data.toNodeId);

    if (!fromNode || !toNode) {
      return { data: null, error: 'Node not found' };
    }

    if (fromNode.type !== 'input' || toNode.type !== 'output') {
      return { data: null, error: 'An edge must connect an Input node to an Output node' };
    }

    const { data: edgeRow, error: edgeError } = await supabase
      .from('edges')
      .insert({
        flow_id: parsed.data.flowId,
        user_id: user.id,
        from_node_id: parsed.data.fromNodeId,
        from_slot: 'out',
        to_node_id: parsed.data.toNodeId,
        to_slot: 'in',
      })
      .select()
      .single();

    if (edgeError?.code === UNIQUE_VIOLATION) {
      return { data: null, error: 'This node is already connected to a destination' };
    }

    if (edgeError || !edgeRow) {
      return { data: null, error: edgeError?.message ?? 'Unknown server error' };
    }

    return { data: mapEdgeRow(edgeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}
