import {
  getClickFilterOptions,
  getClickStats,
  parseClickStatsSearchParams,
  DashboardView,
} from '@/features/dashboard';

import type { ClickStatsSearchParams } from '@/features/dashboard';

import { Empty } from '@/shared/ui/empty';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<ClickStatsSearchParams>;
}) {
  const filterValues = parseClickStatsSearchParams(await searchParams);

  const [filterOptionsResult, statsResult] = await Promise.all([
    getClickFilterOptions(),
    getClickStats(filterValues),
  ]);

  if (
    filterOptionsResult.error ||
    !filterOptionsResult.data ||
    statsResult.error ||
    !statsResult.data
  ) {
    return <Empty type="error" />;
  }

  return (
    <DashboardView
      filterOptions={filterOptionsResult.data}
      filterValues={filterValues}
      stats={statsResult.data}
    />
  );
}
