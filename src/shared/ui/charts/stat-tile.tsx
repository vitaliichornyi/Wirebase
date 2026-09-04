import { Card, CardContent } from '@/shared/ui/primitives/card';

interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <span className="body-medium text-muted-foreground">{label}</span>
        <span className="display-small">{value}</span>
      </CardContent>
    </Card>
  );
}
