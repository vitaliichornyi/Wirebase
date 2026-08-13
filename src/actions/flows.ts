'use server';

import type { User } from '@supabase/supabase-js';
import type { z } from 'zod';

import { addInputNode } from '@/actions/nodes';
import { getUser } from '@/actions/auth';
import { createClient } from '@/lib/supabase/server';
import {
  createFlowSchema,
  updateFlowStatusSchema,
  type CreateFlowInput,
  type UpdateFlowStatusInput,
} from '@/schemas/flows';
import type { ActionResponse } from '@/types/action-response';
import type { Flow, FlowRow } from '@/types/flows';
import type { InputNode } from '@/types/nodes';

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

interface FlowActionContext<T> {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  input: T;
}

// Shared validate -> auth sequence for this file's actions (CLAUDE.md: Data
// Layer > Authentication & Authorization).
async function validateAndAuthenticate<TSchema extends z.ZodType>(
  schema: TSchema,
  values: z.input<TSchema>,
): Promise<{ context: FlowActionContext<z.infer<TSchema>> | null; error: string | null }> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { context: null, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const { data: user, error: userError } = await getUser();
  if (userError || !user) {
    return { context: null, error: userError || 'Unauthorized' };
  }

  const supabase = await createClient();

  return { context: { supabase, user, input: parsed.data }, error: null };
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
    const { context, error } = await validateAndAuthenticate(createFlowSchema, values);
    if (error || !context) {
      return { data: null, error };
    }

    const { supabase, user, input } = context;

    const { data: flowRow, error: flowError } = await supabase
      .from('flows')
      .insert({
        user_id: user.id,
        name: input.name?.trim() || 'Untitled flow',
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

// One action covers all three transitions (ADR 0012) — reactivating from
// Inactive and unarchiving from Archived are both just setting status back
// to 'active'.
export async function updateFlowStatus(
  values: UpdateFlowStatusInput,
): Promise<ActionResponse<Flow>> {
  try {
    const { context, error } = await validateAndAuthenticate(updateFlowStatusSchema, values);
    if (error || !context) {
      return { data: null, error };
    }

    const { supabase, user, input } = context;

    const { data: flowRow, error: flowError } = await supabase
      .from('flows')
      .update({ status: input.status })
      .eq('id', input.flowId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

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
