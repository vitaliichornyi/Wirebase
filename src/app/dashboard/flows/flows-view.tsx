'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, BarChart3, MoreVertical } from 'lucide-react';

import type { FlowListItem } from '@/actions/flows';
import { createFlow, updateFlowStatus } from '@/actions/flows';
import { Alert } from '@/components/common/alert';
import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { IconButton } from '@/components/common/icon-button';
import { SearchField } from '@/components/common/search-field';
import { Switch } from '@/components/common/switch';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import type { FlowStatus } from '@/types/flows';

interface FlowsViewProps {
  initialFlows: FlowListItem[];
}

type FlowsListView = 'active' | 'archived';

const STATUS_CONFIG: Record<FlowStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'outline' },
};

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function byMostRecentlyEdited(a: FlowListItem, b: FlowListItem): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function FlowsView({ initialFlows }: FlowsViewProps) {
  const router = useRouter();
  const [flows, setFlows] = useState(initialFlows);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<FlowsListView>('active');
  const [pendingFlowId, setPendingFlowId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();

  const visibleFlows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flows
      .filter((flow) =>
        view === 'archived' ? flow.status === 'archived' : flow.status !== 'archived',
      )
      .filter((flow) => !query || flow.name.toLowerCase().includes(query));
  }, [flows, search, view]);

  const handleNewFlow = () => {
    startCreating(async () => {
      setErrorMessage(null);
      const result = await createFlow({});

      if (result.error || !result.data) {
        console.error(result.error);
        setErrorMessage(GENERIC_ERROR_MESSAGE);
        return;
      }

      router.push(`/dashboard/flows/${result.data.flow.id}`);
    });
  };

  const handleStatusChange = async (flowId: string, status: FlowStatus) => {
    setErrorMessage(null);
    setPendingFlowId(flowId);
    const result = await updateFlowStatus({ flowId, status });
    setPendingFlowId(null);

    if (result.error || !result.data) {
      console.error(result.error);
      setErrorMessage(GENERIC_ERROR_MESSAGE);
      return;
    }

    const updatedFlow = result.data;
    setFlows((previous) =>
      previous
        .map((flow) => (flow.id === updatedFlow.id ? { ...flow, ...updatedFlow } : flow))
        .sort(byMostRecentlyEdited),
    );
  };

  const columns: DataTableColumn<FlowListItem>[] = [
    {
      key: 'name',
      header: 'Name',
      cellClassName: 'font-medium',
      render: (flow) => flow.name,
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
      key: 'links',
      header: 'Links',
      render: (flow) => flow.linkCount,
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
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      render: (flow) => (
        <div className="flex items-center justify-end gap-1">
          {flow.status !== 'archived' && (
            <Switch
              checked={flow.status === 'active'}
              disabled={pendingFlowId === flow.id}
              onCheckedChange={(checked) =>
                handleStatusChange(flow.id, checked ? 'active' : 'inactive')
              }
              aria-label={flow.status === 'active' ? 'Set flow inactive' : 'Set flow active'}
            />
          )}

          <IconButton
            label="View dashboard"
            nativeButton={false}
            render={<Link href={`/dashboard?flowId=${flow.id}`} />}
          >
            <BarChart3 />
          </IconButton>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="More options"
              className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            >
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {flow.status === 'archived' ? (
                <DropdownMenuItem
                  disabled={pendingFlowId === flow.id}
                  onClick={() => handleStatusChange(flow.id, 'active')}
                >
                  <ArchiveRestore />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={pendingFlowId === flow.id}
                  onClick={() => handleStatusChange(flow.id, 'archived')}
                >
                  <Archive />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (flows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div>
          <h1 className="text-2xl font-bold">Flows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your first Flow to start routing traffic through a shareable link.
          </p>
        </div>
        {errorMessage && <Alert message={errorMessage} />}
        <Button onClick={handleNewFlow} isSubmitting={isCreating}>
          New flow
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flows</h1>
        <Button onClick={handleNewFlow} isSubmitting={isCreating}>
          New flow
        </Button>
      </div>

      {errorMessage && <Alert message={errorMessage} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={view} onValueChange={(value) => setView(value as FlowsListView)}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full max-w-xs">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search flows"
            aria-label="Search flows by name"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={visibleFlows}
        getRowKey={(flow) => flow.id}
        emptyMessage="No flows found."
      />
    </div>
  );
}
