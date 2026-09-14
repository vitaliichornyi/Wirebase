import type { User } from '@supabase/supabase-js';

import { createClient } from '@/shared/lib/supabase/server';
import { withSupabaseRetry } from '@/shared/lib/supabase/with-retry';
import * as nodesService from '@/features/flows/services/nodes';
import type {
  CreateFlowInput,
  GetFlowInput,
  RenameFlowInput,
  UpdateFlowStatusInput,
} from '@/features/flows/schemas/flows';
import type { ActionResponse } from '@/shared/types/action-response';
import type {
  CreateFlowResult,
  Flow,
  FlowListItem,
  FlowRow,
  FlowWithGraph,
} from '@/features/flows/types/flows';
import type { EdgeRow } from '@/features/flows/types/edges';
import { mapEdgeRow } from '@/features/flows/services/edges';
import type { NodeRow } from '@/features/flows/types/nodes';
import {
  mapInputNodeRow,
  mapOutputNodeRow,
} from '@/features/flows/services/nodes';

function mapFlowRow(row: FlowRow): Flow {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createFlow(
  input: CreateFlowInput,
  user: User,
): Promise<ActionResponse<CreateFlowResult>> {
  try {
    const supabase = await createClient();

    const { data: flowRow, error: flowError } = await withSupabaseRetry(() =>
      supabase
        .from('flows')
        .insert({
          user_id: user.id,
          name: input.name?.trim() || 'Untitled flow',
        })
        .select()
        .single(),
    );

    if (flowError || !flowRow) {
      return {
        data: null,
        error: flowError?.message ?? 'Unknown server error',
      };
    }

    const inputNodeResult = await nodesService.addInputNode(
      { flowId: flowRow.id, name: 'Untitled link' },
      user,
    );

    if (inputNodeResult.error || !inputNodeResult.data) {
      await supabase.from('flows').delete().eq('id', flowRow.id);
      return {
        data: null,
        error: inputNodeResult.error ?? 'Unknown server error',
      };
    }

    return {
      data: {
        flow: mapFlowRow(flowRow),
        inputNode: inputNodeResult.data,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function updateFlowStatus(
  input: UpdateFlowStatusInput,
  user: User,
): Promise<ActionResponse<Flow>> {
  try {
    const supabase = await createClient();

    const { data: flowRow, error: flowError } = await withSupabaseRetry(() =>
      supabase
        .from('flows')
        .update({ status: input.status })
        .eq('id', input.flowId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle(),
    );

    if (flowError) {
      return { data: null, error: flowError.message };
    }

    if (!flowRow) {
      return { data: null, error: 'Flow not found' };
    }

    return { data: mapFlowRow(flowRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function renameFlow(
  input: RenameFlowInput,
  user: User,
): Promise<ActionResponse<Flow>> {
  try {
    const supabase = await createClient();

    const { data: flowRow, error: flowError } = await withSupabaseRetry(() =>
      supabase
        .from('flows')
        .update({ name: input.name })
        .eq('id', input.flowId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle(),
    );

    if (flowError) {
      return { data: null, error: flowError.message };
    }

    if (!flowRow) {
      return { data: null, error: 'Flow not found' };
    }

    return { data: mapFlowRow(flowRow), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function getFlow(
  input: GetFlowInput,
  user: User,
): Promise<ActionResponse<FlowWithGraph>> {
  try {
    const supabase = await createClient();

    const { data: flowRow, error: flowError } = await withSupabaseRetry(() =>
      supabase
        .from('flows')
        .select('*')
        .eq('id', input.flowId)
        .eq('user_id', user.id)
        .maybeSingle(),
    );

    if (flowError) {
      return { data: null, error: flowError.message };
    }

    if (!flowRow) {
      return { data: null, error: 'Flow not found' };
    }

    const { data: nodeRows, error: nodesError } = await withSupabaseRetry(() =>
      supabase
        .from('nodes')
        .select('*')
        .eq('flow_id', input.flowId)
        .eq('user_id', user.id)
        .is('deleted_at', null),
    );

    if (nodesError) {
      return { data: null, error: nodesError.message };
    }

    const { data: edgeRows, error: edgesError } = await withSupabaseRetry(() =>
      supabase
        .from('edges')
        .select('*')
        .eq('flow_id', input.flowId)
        .eq('user_id', user.id),
    );

    if (edgesError) {
      return { data: null, error: edgesError.message };
    }

    const nodes = ((nodeRows ?? []) as NodeRow[]).map((row) =>
      row.type === 'input' ? mapInputNodeRow(row) : mapOutputNodeRow(row),
    );
    const edges = ((edgeRows ?? []) as EdgeRow[]).map(mapEdgeRow);

    return {
      data: { flow: mapFlowRow(flowRow), nodes, edges },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function listFlows(
  _input: void,
  user: User,
): Promise<ActionResponse<FlowListItem[]>> {
  try {
    const supabase = await createClient();

    const { data: flowRows, error: flowsError } = await withSupabaseRetry(() =>
      supabase
        .from('flows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
    );

    if (flowsError) {
      return { data: null, error: flowsError.message };
    }

    const { data: inputNodeRows, error: nodesError } = await withSupabaseRetry(
      () =>
        supabase
          .from('nodes')
          .select('flow_id')
          .eq('user_id', user.id)
          .eq('type', 'input')
          .is('deleted_at', null),
    );

    if (nodesError) {
      return { data: null, error: nodesError.message };
    }

    const linkCountsByFlowId = new Map<string, number>();
    for (const { flow_id: flowId } of inputNodeRows ?? []) {
      linkCountsByFlowId.set(flowId, (linkCountsByFlowId.get(flowId) ?? 0) + 1);
    }

    const flows = (flowRows ?? []).map((row) => ({
      ...mapFlowRow(row),
      linkCount: linkCountsByFlowId.get(row.id) ?? 0,
    }));

    return { data: flows, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}
