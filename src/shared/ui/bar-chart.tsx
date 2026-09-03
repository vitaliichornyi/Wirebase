'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/primitives/chart';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives/card';

export interface BarChartDatum {
  label: string;
  value: number;
}

interface RankedBarChartProps {
  title: string;
  data: BarChartDatum[];
  emptyMessage?: string;
}

const chartConfig = {
  value: { label: 'Clicks' },
} satisfies ChartConfig;

const CATEGORY_LABEL_MAX_LENGTH = 16;

// Recharts doesn't ellipsize overflowing tick text on its own — a long
// category (a full referrer hostname, a long link/campaign name) would
// otherwise silently draw off the left edge of the card. The full value
// still reaches the reader via the tooltip on hover.
function truncateCategoryLabel(label: string): string {
  return label.length > CATEGORY_LABEL_MAX_LENGTH
    ? `${label.slice(0, CATEGORY_LABEL_MAX_LENGTH - 1)}…`
    : label;
}

// Recharts clones this with real x/y/payload props at render time — all
// optional here so `<CategoryTick />` is valid where the prop is declared.
function CategoryTick({
  x = 0,
  y = 0,
  payload = { value: '' },
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      fill="var(--color-muted-foreground)"
    >
      {truncateCategoryLabel(payload.value)}
    </text>
  );
}

// A single-series ranked breakdown: one flat bar color (this app has no
// accent hue to spare — see globals.css), sorted by the caller, longest bar
// first. Not a multi-series comparison, so no categorical palette is needed.
export function RankedBarChart({
  title,
  data,
  emptyMessage = 'No data yet',
}: RankedBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={110}
                tick={<CategoryTick />}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--color-accent)' }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-primary)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
