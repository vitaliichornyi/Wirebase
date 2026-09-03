import {
  getClickFilterOptions,
  getClickStats,
  DashboardView,
} from '@/features/dashboard';

import { EmptyState } from '@/shared/ui/empty-state';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ flowId?: string }>;
}) {
  const { flowId } = await searchParams;
  const initialFilterValues = { timeRange: '7d' as const, flowId };

  const [filterOptionsResult, statsResult] = await Promise.all([
    getClickFilterOptions(),
    getClickStats(initialFilterValues),
  ]);

  if (
    filterOptionsResult.error ||
    !filterOptionsResult.data ||
    statsResult.error ||
    !statsResult.data
  ) {
    return <EmptyState type="error" />;
  }

  return (
    <DashboardView
      filterOptions={filterOptionsResult.data}
      initialFilterValues={initialFilterValues}
      initialStats={statsResult.data}
    />
  );
}
