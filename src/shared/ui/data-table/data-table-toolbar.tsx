'use client';

import { SearchField } from '@/shared/ui/search-field';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';

export type ListView = 'active' | 'archived';

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  view: ListView;
  onViewChange: (view: ListView) => void;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center h-14 w-full gap-2">
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Search"
        aria-label="Search by name"
      />

      <Tabs
        value={view}
        onValueChange={(value) => onViewChange(value as ListView)}
      >
        <TabsList className="label-medium rounded-full bg-muted">
          <TabsTrigger value="active" className="rounded-full">
            Active
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-full">
            Archived
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
