'use client';

import { SearchField } from '@/shared/ui/fields/search-field';
import { SelectField, SelectFieldOption } from '../fields/select-field';

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
  const viewOptions: SelectFieldOption[] = [
    {
      value: 'active',
      label: 'Active',
    },
    {
      value: 'archived',
      label: 'Archived',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Search"
        aria-label="Search by name"
      />

      <SelectField
        options={viewOptions}
        value={view}
        onValueChange={(value) => onViewChange(value as ListView)}
        aria-label="Table view"
      />
    </div>
  );
}
