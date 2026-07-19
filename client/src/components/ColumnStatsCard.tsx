import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ColumnMeta } from "@shared/schema";

const TYPE_LABEL: Record<ColumnMeta["type"], string> = {
  numeric: "Numeric",
  categorical: "Categorical",
  date: "Date",
  boolean: "Boolean",
};

const TYPE_COLOR: Record<ColumnMeta["type"], string> = {
  numeric: "hsl(var(--chart-1))",
  categorical: "hsl(var(--chart-2))",
  date: "hsl(var(--chart-3))",
  boolean: "hsl(var(--chart-4))",
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-sm tabular-nums">{value}</p>
    </div>
  );
}

function fmtNum(n: number) {
  return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function ColumnStatsCard({ column }: { column: ColumnMeta }) {
  const color = TYPE_COLOR[column.type];

  return (
    <Card data-testid={`card-column-${column.name}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <p className="truncate text-sm font-semibold" title={column.name} data-testid={`text-column-name-${column.name}`}>
          {column.name}
        </p>
        <Badge variant="outline" style={{ borderColor: color, color }} className="shrink-0">
          {TYPE_LABEL[column.type]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {column.type === "numeric" && column.numeric ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatItem label="Mean" value={fmtNum(column.numeric.mean)} />
              <StatItem label="Median" value={fmtNum(column.numeric.median)} />
              <StatItem label="Std dev" value={fmtNum(column.numeric.std)} />
              <StatItem label="Min" value={fmtNum(column.numeric.min)} />
              <StatItem label="Max" value={fmtNum(column.numeric.max)} />
              <StatItem label="Missing" value={`${column.numeric.missing}`} />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={column.numeric.histogram} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={"preserveStartEnd"} angle={-30} textAnchor="end" height={32} minTickGap={2} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={28} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--popover-border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : column.categorical ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatItem label="Unique" value={`${column.categorical.uniqueCount}`} />
              <StatItem label="Present" value={`${column.categorical.count}`} />
              <StatItem label="Missing" value={`${column.categorical.missing}`} />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={column.categorical.topValues}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="value"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    width={72}
                    tickFormatter={(v: string) => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--popover-border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill={color} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
