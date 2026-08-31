import type { User } from '@supabase/supabase-js';

import { generateSlug } from '@/features/flows/lib/generate-slug';
import { createClient } from '@/shared/lib/supabase/server';
import type {
  AddInputNodeInput,
  AddOutputNodeInput,
  DeleteNodeInput,
  RenameNodeInput,
  RepositionNodeInput,
  UpdateInputNodeStatusInput,
  UpdateInputNodeUtmInput,
  UpdateOutputDestinationUrlInput,
} from '@/features/flows/schemas/nodes';
import type { ActionResponse } from '@/shared/types/action-response';
import type {
  FlowNode,
  InputNode,
  NodeRow,
  OutputNode,
} from '@/features/flows/types/nodes';

function mapNodeRow(row: NodeRow): FlowNode {
  return row.type === 'input' ? mapInputNodeRow(row) : mapOutputNodeRow(row);
}

const MAX_SLUG_ATTEMPTS = 5;
const UNIQUE_VIOLATION = '23505';

export function mapInputNodeRow(row: NodeRow): InputNode {
  return {
    id: row.id,
    flowId: row.flow_id,
    userId: row.user_id,
    type: 'input',
    name: row.name,
    positionX: row.position_x,
    positionY: row.position_y,
    slug: row.slug!,
    status: row.input_status!,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmTerm: row.utm_term,
    utmContent: row.utm_content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOutputNodeRow(row: NodeRow): OutputNode {
  return {
    id: row.id,
    flowId: row.flow_id,
    userId: row.user_id,
    type: 'output',
    name: row.name,
    positionX: row.position_x,
    positionY: row.position_y,
    destinationUrl: row.destination_url!,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Ownership boilerplate (CLAUDE.md: Data Layer > Authentication &
// authorization) — extracted once a second function in this file needed the
// identical flow-ownership check.
async function assertOwnsFlow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  flowId: string,
  userId: string,
): Promise<string | null> {
  const { data: flowRow, error: flowError } = await supabase
    .from('flows')
    .select('id')
    .eq('id', flowId)
    .eq('user_id', userId)
    .maybeSingle();

  if (flowError) return flowError.message;
  if (!flowRow) return 'Flow not found';
  return null;
}

export async function addInputNode(
  input: AddInputNodeInput,
  user: User,
): Promise<ActionResponse<InputNode>> {
  try {
    const supabase = await createClient();

    const ownershipError = await assertOwnsFlow(supabase, input.flowId, user.id);
    if (ownershipError) {
      return { data: null, error: ownershipError };
    }

    let lastError: string | null = null;

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const { data: nodeRow, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          flow_id: input.flowId,
          user_id: user.id,
          type: 'input',
          name: input.name?.trim() || 'Untitled link',
          position_x: input.positionX ?? 0,
          position_y: input.positionY ?? 0,
          slug: generateSlug(),
          input_status: 'enabled',
        })
        .select()
        .single();

      if (!nodeError && nodeRow) {
        return { data: mapInputNodeRow(nodeRow), error: null };
      }

      if (nodeError?.code === UNIQUE_VIOLATION) {
        lastError = nodeError.message;
        continue;
      }

      return { data: null, error: nodeError?.message ?? 'Unknown server error' };
    }

    return { data: null, error: lastError ?? 'Could not generate a unique slug' };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function addOutputNode(
  input: AddOutputNodeInput,
  user: User,
): Promise<ActionResponse<OutputNode>> {
  try {
    const supabase = await createClient();

    const ownershipError = await assertOwnsFlow(supabase, input.flowId, user.id);
    if (ownershipError) {
      return { data: null, error: ownershipError };
    }

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .insert({
        flow_id: input.flowId,
        user_id: user.id,
        type: 'output',
        name: input.name?.trim() || 'Untitled destination',
        position_x: input.positionX ?? 0,
        position_y: input.positionY ?? 0,
        destination_url: input.destinationUrl,
      })
      .select()
      .single();

    if (nodeError || !nodeRow) {
      return { data: null, error: nodeError?.message ?? 'Unknown server error' };
    }

    return { data: mapOutputNodeRow(nodeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

// Independent of Flow status (ADR 0012's Q9 discussion) — a single Input
// node can be Disabled inside an otherwise Active Flow.
export async function updateInputNodeStatus(
  input: UpdateInputNodeStatusInput,
  user: User,
): Promise<ActionResponse<InputNode>> {
  try {
    const supabase = await createClient();

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .update({ input_status: input.status })
      .eq('id', input.nodeId)
      .eq('user_id', user.id)
      .eq('type', 'input')
      .is('deleted_at', null)
      .select()
      .maybeSingle();

    if (nodeError) {
      return { data: null, error: nodeError.message };
    }

    if (!nodeRow) {
      return { data: null, error: 'Input node not found' };
    }

    return { data: mapInputNodeRow(nodeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

// UTM values are per-Input-node with no Flow-level inheritance (ADR 0014).
// Forwarded to the destination on redirect (ADR 0013) and captured on each
// Click at the time it's recorded.
export async function updateInputNodeUtm(
  input: UpdateInputNodeUtmInput,
  user: User,
): Promise<ActionResponse<InputNode>> {
  try {
    const supabase = await createClient();

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .update({
        utm_source: input.utmSource || null,
        utm_medium: input.utmMedium || null,
        utm_campaign: input.utmCampaign || null,
        utm_term: input.utmTerm || null,
        utm_content: input.utmContent || null,
      })
      .eq('id', input.nodeId)
      .eq('user_id', user.id)
      .eq('type', 'input')
      .is('deleted_at', null)
      .select()
      .maybeSingle();

    if (nodeError) {
      return { data: null, error: nodeError.message };
    }

    if (!nodeRow) {
      return { data: null, error: 'Input node not found' };
    }

    return { data: mapInputNodeRow(nodeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

// Renaming an Input or Output node is one of the changes gated behind the
// canvas's explicit Save (ADR 0010) — the client only calls this once the
// user clicks Save. The row's own `type` decides which mapper applies, so
// one action covers both node kinds.
export async function renameNode(
  input: RenameNodeInput,
  user: User,
): Promise<ActionResponse<FlowNode>> {
  try {
    const supabase = await createClient();

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .update({ name: input.name })
      .eq('id', input.nodeId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .maybeSingle();

    if (nodeError) {
      return { data: null, error: nodeError.message };
    }

    if (!nodeRow) {
      return { data: null, error: 'Node not found' };
    }

    return { data: mapNodeRow(nodeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

// Canvas position is likewise only persisted on explicit Save (ADR 0010) —
// dragging a node around before Save never reaches this action.
export async function repositionNode(
  input: RepositionNodeInput,
  user: User,
): Promise<ActionResponse<FlowNode>> {
  try {
    const supabase = await createClient();

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .update({ position_x: input.positionX, position_y: input.positionY })
      .eq('id', input.nodeId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .maybeSingle();

    if (nodeError) {
      return { data: null, error: nodeError.message };
    }

    if (!nodeRow) {
      return { data: null, error: 'Node not found' };
    }

    return { data: mapNodeRow(nodeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function updateOutputDestinationUrl(
  input: UpdateOutputDestinationUrlInput,
  user: User,
): Promise<ActionResponse<OutputNode>> {
  try {
    const supabase = await createClient();

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .update({ destination_url: input.destinationUrl })
      .eq('id', input.nodeId)
      .eq('user_id', user.id)
      .eq('type', 'output')
      .is('deleted_at', null)
      .select()
      .maybeSingle();

    if (nodeError) {
      return { data: null, error: nodeError.message };
    }

    if (!nodeRow) {
      return { data: null, error: 'Output node not found' };
    }

    return { data: mapOutputNodeRow(nodeRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

// Soft-delete (ADR 0006, ADR 0011): the row and its Click history persist —
// only marked deleted_at and hidden from the owner-facing UI, which treats
// it as permanently gone. Removes only this node's own edges, never
// cascading into a shared Output that other Input nodes still depend on.
export async function deleteNode(
  input: DeleteNodeInput,
  user: User,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', input.nodeId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle();

    if (nodeError) {
      return { error: nodeError.message };
    }

    if (!nodeRow) {
      return { error: 'Node not found' };
    }

    const { error: edgesError } = await supabase
      .from('edges')
      .delete()
      .eq('user_id', user.id)
      .or(`from_node_id.eq.${input.nodeId},to_node_id.eq.${input.nodeId}`);

    if (edgesError) {
      return { error: edgesError.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}
