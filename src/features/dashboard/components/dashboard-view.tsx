'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildClickStatsSearchParams } from '@/features/dashboard/lib/build-click-stats-search-params';
import type { GetClickStatsInput } from '@/features/dashboard/schemas/click-stats';
import type {
  ClickFilterOptions,
  ClickStats,
} from '@/features/dashboard/types/click-stats';

import { PageHeader } from '@/shared/ui/page-header';
import { DashboardToolbar } from '@/features/dashboard/components/dashboard-toolbar';
import { StatTile } from '@/shared/ui/charts/stat-tile';
import { RankedBarChart } from '@/shared/ui/charts/bar-chart';
import { cn } from '@/shared/lib/utils';

interface DashboardViewProps {
  filterOptions: ClickFilterOptions;
  filterValues: GetClickStatsInput;
  stats: ClickStats;
}

export function DashboardView({
  filterOptions,
  filterValues,
  stats,
}: DashboardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleFiltersChange = (nextFilterValues: GetClickStatsInput) => {
    const queryString =
      buildClickStatsSearchParams(nextFilterValues).toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="flex flex-col gap-4 px-6 pb-6">
        <DashboardToolbar
          options={filterOptions}
          values={filterValues}
          onChange={handleFiltersChange}
        />
        <div
          className={cn(
            'flex flex-col gap-4 transition-opacity',
            isPending && 'opacity-40',
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Total clicks"
              value={stats.totalClicks.toLocaleString()}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankedBarChart title="Clicks by country" data={stats.byCountry} />
            <RankedBarChart title="Clicks by link" data={stats.byLink} />
            <RankedBarChart
              title="Clicks by referrer"
              data={stats.byReferrer}
            />
            <RankedBarChart
              title="Clicks by campaign"
              data={stats.byCampaign}
            />
          </div>
        </div>
      </div>
    </>
  );
}
