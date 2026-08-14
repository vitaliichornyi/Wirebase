import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataTableColumn<TRow> {
  key: string;
  header: React.ReactNode;
  render: (row: TRow) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  getRowKey: (row: TRow) => string;
  emptyMessage?: string;
}

export function DataTable<TRow>({
  columns,
  data,
  getRowKey,
  emptyMessage = 'No results found.',
}: DataTableProps<TRow>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.headerClassName}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.cellClassName}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
