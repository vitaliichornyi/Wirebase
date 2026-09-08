import type { GetClickStatsInput } from '@/features/dashboard/schemas/click-stats';

const DEFAULT_TIME_RANGE: GetClickStatsInput['timeRange'] = '7d';

export function buildClickStatsSearchParams(
  filterValues: GetClickStatsInput,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filterValues.timeRange !== DEFAULT_TIME_RANGE) {
    searchParams.set('timeRange', filterValues.timeRange);
  }
  if (filterValues.flowId) {
    searchParams.set('flowId', filterValues.flowId);
  }
  if (filterValues.inputNodeId) {
    searchParams.set('inputNodeId', filterValues.inputNodeId);
  }
  if (filterValues.country) {
    searchParams.set('country', filterValues.country);
  }

  return searchParams;
}
