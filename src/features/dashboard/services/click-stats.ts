import { createClient } from '@/shared/lib/supabase/server';
import { formatLinkStatusMarker } from '@/features/dashboard/lib/format-link-status-marker';

import type { GetClickStatsInput } from '@/features/dashboard/schemas/click-stats';
import type { User } from '@supabase/supabase-js';
import type { ActionResponse } from '@/shared/types/action-response';
import type {
  TimeRange,
  ClickRow,
  NodeRow,
  FlowFilterOption,
  LinkFilterOption,
  CountryFilterOption,
  ClickFilterOptions,
  RankedBucket,
  ClickStats,
} from '@/features/dashboard/types/click-stats';

const DIRECT_REFERRER_LABEL = '(Direct)';
const UNKNOWN_COUNTRY_LABEL = '(Unknown)';
const TOP_BUCKET_COUNT = 6;
const OTHER_BUCKET_LABEL = 'Other';
const NO_CAMPAIGN_BUCKET_LABEL = '(No campaign)';

const TIME_RANGE_MS: Record<Exclude<TimeRange, 'all'>, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

function incrementCount(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function resolveReferrerLabel(referrer: string | null): string {
  if (!referrer) {
    return DIRECT_REFERRER_LABEL;
  }
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

function bucketTop(counts: Map<string, number>): RankedBucket[] {
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  const top = sorted
    .slice(0, TOP_BUCKET_COUNT)
    .map(([label, value]) => ({ label, value }));

  const rest = sorted.slice(TOP_BUCKET_COUNT);

  if (rest.length > 0) {
    const restTotal = rest.reduce((sum, [, value]) => sum + value, 0);
    top.push({ label: OTHER_BUCKET_LABEL, value: restTotal });
  }

  return top;
}

async function resolveLinkBuckets(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  buckets: RankedBucket[],
): Promise<RankedBucket[]> {
  const inputNodeIds = buckets
    .map((bucket) => bucket.label)
    .filter((label) => label !== OTHER_BUCKET_LABEL);

  if (inputNodeIds.length === 0) {
    return buckets;
  }

  const { data: nodeRows } = await supabase
    .from('nodes')
    .select('id, name, input_status, flow:flows(status)')
    .eq('user_id', userId)
    .in('id', inputNodeIds);

  const labelById = new Map<string, string>();
  for (const node of (nodeRows ?? []) as unknown as NodeRow[]) {
    const suffix = formatLinkStatusMarker(
      node.flow?.status === 'archived',
      node.input_status === 'disabled',
    );
    labelById.set(node.id, `${node.name}${suffix}`);
  }

  return buckets.map((bucket) =>
    bucket.label === OTHER_BUCKET_LABEL
      ? bucket
      : { ...bucket, label: labelById.get(bucket.label) ?? 'Deleted link' },
  );
}

export async function getClickStats(
  input: GetClickStatsInput,
  user: User,
): Promise<ActionResponse<ClickStats>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('clicks').select('*').eq('user_id', user.id);

    if (input.timeRange !== 'all') {
      const cutoff = new Date(
        Date.now() - TIME_RANGE_MS[input.timeRange],
      ).toISOString();
      query = query.gte('created_at', cutoff);
    }
    if (input.flowId) {
      query = query.eq('flow_id', input.flowId);
    }
    if (input.inputNodeId) {
      query = query.eq('input_node_id', input.inputNodeId);
    }
    if (input.country) {
      query = query.eq('country', input.country);
    }

    const { data: clickRows, error: clicksError } = await query;
    if (clicksError) {
      return { data: null, error: clicksError.message };
    }

    const clicks: ClickRow[] = clickRows ?? [];

    const countryCounts = new Map<string, number>();
    const referrerCounts = new Map<string, number>();
    const linkCounts = new Map<string, number>();
    const namedCampaignCounts = new Map<string, number>();

    let noCampaignCount = 0;
    for (const click of clicks) {
      incrementCount(countryCounts, click.country ?? UNKNOWN_COUNTRY_LABEL);
      incrementCount(referrerCounts, resolveReferrerLabel(click.referrer));
      incrementCount(linkCounts, click.input_node_id);

      if (click.utm_campaign) {
        incrementCount(namedCampaignCounts, click.utm_campaign);
      } else {
        noCampaignCount += 1;
      }
    }

    const byCampaign = bucketTop(namedCampaignCounts);
    if (noCampaignCount > 0) {
      byCampaign.push({
        label: NO_CAMPAIGN_BUCKET_LABEL,
        value: noCampaignCount,
      });
    }

    const byLink = await resolveLinkBuckets(
      supabase,
      user.id,
      bucketTop(linkCounts),
    );

    return {
      data: {
        totalClicks: clicks.length,
        byCountry: bucketTop(countryCounts),
        byLink,
        byReferrer: bucketTop(referrerCounts),
        byCampaign,
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

export async function getClickFilterOptions(
  _input: void,
  user: User,
): Promise<ActionResponse<ClickFilterOptions>> {
  try {
    const supabase = await createClient();

    const { data: flowRows, error: flowsError } = await supabase
      .from('flows')
      .select('id, name, status')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (flowsError) {
      return { data: null, error: flowsError.message };
    }

    const flows: FlowFilterOption[] = flowRows ?? [];

    const { data: nodeRows, error: nodesError } = await supabase
      .from('nodes')
      .select('id, name, input_status, flow:flows(name, status)')
      .eq('user_id', user.id)
      .eq('type', 'input')
      .is('deleted_at', null)
      .order('name');

    if (nodesError) {
      return { data: null, error: nodesError.message };
    }

    const links: LinkFilterOption[] = (
      (nodeRows ?? []) as unknown as NodeRow[]
    ).map((row) => ({
      id: row.id,
      name: row.name,
      flowName: row.flow?.name ?? '',
      isArchived: row.flow?.status === 'archived',
      isDisabled: row.input_status === 'disabled',
    }));

    const { data: countryRows, error: countriesError } = await supabase
      .from('clicks')
      .select('country')
      .eq('user_id', user.id)
      .not('country', 'is', null);

    if (countriesError) {
      return { data: null, error: countriesError.message };
    }

    const countries: CountryFilterOption[] = [
      ...new Set((countryRows ?? []).map((row) => row.country)),
    ].sort();

    return {
      data: { flows, links, countries },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}
