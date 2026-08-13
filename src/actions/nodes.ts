'use server';

import { getUser } from '@/actions/auth';
import { generateSlug } from '@/lib/slug';
import { createClient } from '@/lib/supabase/server';
import {
  addInputNodeSchema,
  addOutputNodeSchema,
  type AddInputNodeInput,
  type AddOutputNodeInput,
} from '@/schemas/nodes';
import type { ActionResponse } from '@/types/action-response';
import type { InputNode, NodeRow, OutputNode } from '@/types/nodes';

const MAX_SLUG_ATTEMPTS = 5;
const UNIQUE_VIOLATION = '23505';

function mapInputNodeRow(row: NodeRow): InputNode {
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

function mapOutputNodeRow(row: NodeRow): OutputNode {
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
  values: AddInputNodeInput,
): Promise<ActionResponse<InputNode>> {
  try {
    const parsed = addInputNodeSchema.safeParse(values);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' };
    }

    const { data: user, error: userError } = await getUser();
    if (userError || !user) {
      return { data: null, error: userError || 'Unauthorized' };
    }

    const supabase = await createClient();

    const ownershipError = await assertOwnsFlow(supabase, parsed.data.flowId, user.id);
    if (ownershipError) {
      return { data: null, error: ownershipError };
    }

    let lastError: string | null = null;

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const { data: nodeRow, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          flow_id: parsed.data.flowId,
          user_id: user.id,
          type: 'input',
          name: parsed.data.name?.trim() || 'Untitled link',
          position_x: parsed.data.positionX ?? 0,
          position_y: parsed.data.positionY ?? 0,
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
  values: AddOutputNodeInput,
): Promise<ActionResponse<OutputNode>> {
  try {
    const parsed = addOutputNodeSchema.safeParse(values);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' };
    }

    const { data: user, error: userError } = await getUser();
    if (userError || !user) {
      return { data: null, error: userError || 'Unauthorized' };
    }

    const supabase = await createClient();

    const ownershipError = await assertOwnsFlow(supabase, parsed.data.flowId, user.id);
    if (ownershipError) {
      return { data: null, error: ownershipError };
    }

    const { data: nodeRow, error: nodeError } = await supabase
      .from('nodes')
      .insert({
        flow_id: parsed.data.flowId,
        user_id: user.id,
        type: 'output',
        name: parsed.data.name?.trim() || 'Untitled destination',
        position_x: parsed.data.positionX ?? 0,
        position_y: parsed.data.positionY ?? 0,
        destination_url: parsed.data.destinationUrl,
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
