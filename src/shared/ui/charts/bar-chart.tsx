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
import { Empty } from '../empty';

interface BarChartData {
  label: string;
  value: number;
}

interface RankedBarChartProps {
  title: string;
  data: BarChartData[];
}

const chartConfig = {
  value: { label: 'Clicks' },
} satisfies ChartConfig;

const CATEGORY_LABEL_MAX_LENGTH = 16;

function truncateCategoryLabel(label: string): string {
  return label.length > CATEGORY_LABEL_MAX_LENGTH
    ? `${label.slice(0, CATEGORY_LABEL_MAX_LENGTH - 1)}…`
    : label;
}

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

export function RankedBarChart({ title, data }: RankedBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-50">
            <Empty
              type="no-data"
              title="No results found"
              description="Try adjusting your filters."
            />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-50 w-full">
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
