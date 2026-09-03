'use client';

import { useState, useTransition } from 'react';
import { getClickStats } from '@/features/dashboard/actions/click-stats';
import type { GetClickStatsInput } from '@/features/dashboard/schemas/click-stats';
import type {
  ClickFilterOptions,
  ClickStats,
} from '@/features/dashboard/types/click-stats';

import { PageHeader } from '@/shared/ui/page-header';
import { DashboardToolbar } from '@/features/dashboard/components/dashboard-toolbar';
import { StatTile } from '@/shared/ui/stat-tile';
import { RankedBarChart } from '@/shared/ui/bar-chart';
import { toast } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/utils';

interface DashboardViewProps {
  filterOptions: ClickFilterOptions;
  initialFilterValues: GetClickStatsInput;
  initialStats: ClickStats;
}

export function DashboardView({
  filterOptions,
  initialFilterValues,
  initialStats,
}: DashboardViewProps) {
  const [filterValues, setFilterValues] =
    useState<GetClickStatsInput>(initialFilterValues);
  const [stats, setStats] = useState<ClickStats>(initialStats);
  const [isPending, startTransition] = useTransition();

  const handleFiltersChange = (nextFilterValues: GetClickStatsInput) => {
    setFilterValues(nextFilterValues);
    startTransition(async () => {
      const { data, error } = await getClickStats(nextFilterValues);
      if (error || !data) {
        toast({
          title: 'Failed to load dashboard data',
          description: 'Please try again.',
          type: 'error',
        });
        return;
      }
      setStats(data);
    });
  };

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="flex flex-col gap-1 px-6 pb-6">
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
