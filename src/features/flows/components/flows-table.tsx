'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { FlowListItem, FlowStatus } from '@/features/flows/types/flows';
import { createFlow, updateFlowStatus } from '@/features/flows/actions/flows';
import { DEMO_ACCOUNT_RESTRICTION_MESSAGE } from '@/shared/lib/demo-account';
import { formatDate } from '@/shared/lib/utils';

import { PageHeader } from '@/shared/ui/page-header';
import { Empty } from '@/shared/ui/empty';
import {
  DataTableToolbar,
  type ListView,
} from '@/shared/ui/data-table/data-table-toolbar';
import {
  DataTable,
  type DataTableColumn,
} from '@/shared/ui/data-table/data-table';

import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { DropdownMenu } from '@/shared/ui/dropdown-menu';
import { toast } from '@/shared/ui/toast';

import { ChartIcon } from '@/shared/ui/icons/chart-icon';
import { PencilIcon } from '@/shared/ui/icons/pencil-icon';
import { ArchiveIcon } from '@/shared/ui/icons/archive-icon';
import { ArchiveRestoreIcon } from '@/shared/ui/icons/archive-restore-icon';

const STATUS_CONFIG: Record<
  FlowStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  active: { label: 'Active', variant: 'default' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'outline' },
};

function byMostRecentlyEdited(a: FlowListItem, b: FlowListItem): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

interface FlowsTableProps {
  initialFlows: FlowListItem[];
}

export function FlowsTable({ initialFlows }: FlowsTableProps) {
  const router = useRouter();

  const [flows, setFlows] = useState<FlowListItem[]>(initialFlows);
  const [view, setView] = useState<ListView>('active');
  const [search, setSearch] = useState('');

  const [isCreating, startCreating] = useTransition();
  const [pendingFlowId, setPendingFlowId] = useState<string | null>(null);

  const handleCreateFlow = () => {
    startCreating(async () => {
      const { data, error } = await createFlow({});
      if (error || !data) {
        toast({
          title: 'Failed to create flow',
          description:
            error === DEMO_ACCOUNT_RESTRICTION_MESSAGE
              ? error
              : 'Please try again.',
          type: 'error',
        });
        return;
      }
      router.push(`/dashboard/flows/${data.flow.id}`);
    });
  };

  const handleStatusChange = async (flowId: string, status: FlowStatus) => {
    setPendingFlowId(flowId);

    const { data, error } = await updateFlowStatus({ flowId, status });

    setPendingFlowId(null);
    if (error || !data) {
      toast({
        title: 'Failed to update flow status',
        description:
          error === DEMO_ACCOUNT_RESTRICTION_MESSAGE ? error : 'Please try again.',
        type: 'error',
      });
      return;
    }

    const updatedFlow = data;
    setFlows((previous) =>
      previous
        .map((flow) =>
          flow.id === updatedFlow.id ? { ...flow, ...updatedFlow } : flow,
        )
        .sort(byMostRecentlyEdited),
    );
  };

  const visibleFlows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flows
      .filter((flow) =>
        view === 'archived'
          ? flow.status === 'archived'
          : flow.status !== 'archived',
      )
      .filter((flow) => !query || flow.name.toLowerCase().includes(query));
  }, [flows, search, view]);

  const columns: DataTableColumn<FlowListItem>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (flow) => flow.name,
    },
    {
      key: 'status',
      header: 'Status',
      render: (flow) => (
        <Badge variant={STATUS_CONFIG[flow.status].variant}>
          {STATUS_CONFIG[flow.status].label}
        </Badge>
      ),
    },
    {
      key: 'links',
      header: 'Links',
      render: (flow) => flow.linkCount,
    },
    {
      key: 'created',
      header: 'Created',
      render: (flow) => formatDate(flow.createdAt),
    },
    {
      key: 'edited',
      header: 'Edited',
      render: (flow) => formatDate(flow.updatedAt),
    },
    {
      key: 'actions',
      header: '',
      render: (flow) => (
        <div className="flex items-center justify-end gap-4">
          {flow.status !== 'archived' && (
            <Switch
              checked={flow.status === 'active'}
              disabled={pendingFlowId === flow.id}
              onCheckedChange={(checked) =>
                handleStatusChange(flow.id, checked ? 'active' : 'inactive')
              }
              aria-label={
                flow.status === 'active'
                  ? 'Set flow inactive'
                  : 'Set flow active'
              }
            />
          )}
          <IconButton
            label="View dashboard"
            onClick={() => router.push(`/dashboard?flowId=${flow.id}`)}
          >
            <ChartIcon />
          </IconButton>
          <DropdownMenu
            actions={
              flow.status === 'archived'
                ? [
                    {
                      key: 'unarchive',
                      label: 'Unarchive',
                      icon: <ArchiveRestoreIcon />,
                      disabled: pendingFlowId === flow.id,
                      onClick: () => handleStatusChange(flow.id, 'active'),
                    },
                  ]
                : [
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: <PencilIcon />,
                      href: `/dashboard/flows/${flow.id}`,
                    },
                    {
                      key: 'archive',
                      label: 'Archive',
                      icon: <ArchiveIcon />,
                      disabled: pendingFlowId === flow.id,
                      onClick: () => handleStatusChange(flow.id, 'archived'),
                    },
                  ]
            }
          />
        </div>
      ),
    },
  ];

  if (flows.length === 0) {
    return (
      <Empty
        type="no-data"
        title="No flows yet"
        description="Create your first flow to start routing traffic through a shareable link."
        actionLabel="New flow"
        onAction={handleCreateFlow}
        isActionSubmitting={isCreating}
      />
    );
  }

  return (
    <>
      <PageHeader title="Flows">
        <Button onClick={handleCreateFlow} isSubmitting={isCreating}>
          New flow
        </Button>
      </PageHeader>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <DataTableToolbar
          search={search}
          onSearchChange={setSearch}
          view={view}
          onViewChange={setView}
        />
        <DataTable
          columns={columns}
          data={visibleFlows}
          getRowKey={(flow) => flow.id}
          emptyMessage="No flows found."
        />
      </div>
    </>
  );
}
