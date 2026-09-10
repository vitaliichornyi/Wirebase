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

  if (filterOptionsResult.error || statsResult.error) {
    return <Empty type="error" />;
  }

  if (!filterOptionsResult.data || !statsResult.data) {
    return (
      <Empty
        type="no-data"
        title="No data yet"
        description="Create your first flow to start seeing data here."
      />
    );
  }

  return (
    <DashboardView
      filterOptions={filterOptionsResult.data}
      filterValues={filterValues}
      stats={statsResult.data}
    />
  );
}
