'use server';

import { addInputNode } from '@/actions/nodes';
import { getUser } from '@/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { createFlowSchema, type CreateFlowInput } from '@/schemas/flows';
import type { ActionResponse } from '@/types/action-response';
import type { Flow, FlowStatus } from '@/types/flows';
import type { InputNode } from '@/types/nodes';

interface FlowRow {
  id: string;
  user_id: string;
  name: string;
  status: FlowStatus;
  created_at: string;
  updated_at: string;
}

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

export interface CreateFlowResult {
  flow: Flow;
  inputNode: InputNode;
}

// A new Flow is seeded with exactly one auto-generated Input node and no
// Output node (ADR 0009).
export async function createFlow(
  values: CreateFlowInput,
): Promise<ActionResponse<CreateFlowResult>> {
  try {
    const parsed = createFlowSchema.safeParse(values);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' };
    }

    const { data: user, error: userError } = await getUser();
    if (userError || !user) {
      return { data: null, error: userError || 'Unauthorized' };
    }

    const supabase = await createClient();

    const { data: flowRow, error: flowError } = await supabase
      .from('flows')
      .insert({
        user_id: user.id,
        name: parsed.data.name?.trim() || 'Untitled flow',
      })
      .select()
      .single();

    if (flowError || !flowRow) {
      return { data: null, error: flowError?.message ?? 'Unknown server error' };
    }

    const inputNodeResult = await addInputNode({
      flowId: flowRow.id,
      name: 'Untitled link',
    });

    if (inputNodeResult.error || !inputNodeResult.data) {
      await supabase.from('flows').delete().eq('id', flowRow.id);
      return { data: null, error: inputNodeResult.error ?? 'Unknown server error' };
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
