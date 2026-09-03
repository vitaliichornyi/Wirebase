'use client';

import { formatLinkStatusMarker } from '@/features/dashboard/lib/format-link-status-marker';

import type { GetClickStatsInput } from '@/features/dashboard/schemas/click-stats';
import type { FlowStatus } from '@/features/flows';
import {
  type ClickFilterOptions,
  type TimeRange,
} from '@/features/dashboard/types/click-stats';
import { SelectField, type SelectFieldOption } from '@/shared/ui/select';

import { TIME_RANGES } from '@/features/dashboard/types/click-stats';

const ALL_FILTER_VALUE = 'all';

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  all: 'All time',
};

const FLOW_STATUS_MARKER: Partial<Record<FlowStatus, string>> = {
  inactive: ' (Inactive)',
  archived: ' (Archived)',
};

function toFilterValue(selected: string): string | undefined {
  return selected === ALL_FILTER_VALUE ? undefined : selected;
}

interface DashboardToolbarProps {
  options: ClickFilterOptions;
  values: GetClickStatsInput;
  onChange: (value: GetClickStatsInput) => void;
}

export function DashboardToolbar({
  options,
  values,
  onChange,
}: DashboardToolbarProps) {
  const timeRangeOptions: SelectFieldOption[] = TIME_RANGES.map((range) => ({
    value: range,
    label: TIME_RANGE_LABELS[range],
  }));

  const flowOptions: SelectFieldOption[] = [
    { value: ALL_FILTER_VALUE, label: 'All flows' },
    ...options.flows.map((flow) => ({
      value: flow.id,
      label: `${flow.name}${FLOW_STATUS_MARKER[flow.status] ?? ''}`,
    })),
  ];

  const linkOptions: SelectFieldOption[] = [
    { value: ALL_FILTER_VALUE, label: 'All links' },
    ...options.links.map((link) => ({
      value: link.id,
      label: `${link.name} - ${link.flowName}${formatLinkStatusMarker(link.isArchived, link.isDisabled)}`,
    })),
  ];

  const countryOptions: SelectFieldOption[] = [
    { value: ALL_FILTER_VALUE, label: 'All countries' },
    ...options.countries.map((country) => ({
      value: country,
      label: country,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center h-14 w-full gap-2">
      <SelectField
        options={timeRangeOptions}
        value={values.timeRange}
        onValueChange={(timeRange) =>
          onChange({ ...values, timeRange: timeRange as TimeRange })
        }
        aria-label="Time range"
      />

      <SelectField
        placeholder="All flows"
        options={flowOptions}
        value={values.flowId ?? ALL_FILTER_VALUE}
        onValueChange={(flowId) =>
          onChange({ ...values, flowId: toFilterValue(flowId) })
        }
        aria-label="Flow"
      />

      <SelectField
        placeholder="All links"
        options={linkOptions}
        value={values.inputNodeId ?? ALL_FILTER_VALUE}
        onValueChange={(inputNodeId) =>
          onChange({ ...values, inputNodeId: toFilterValue(inputNodeId) })
        }
        aria-label="Link"
      />

      <SelectField
        placeholder="All countries"
        options={countryOptions}
        value={values.country ?? ALL_FILTER_VALUE}
        onValueChange={(country) =>
          onChange({ ...values, country: toFilterValue(country) })
        }
        aria-label="Country"
      />
    </div>
  );
}
