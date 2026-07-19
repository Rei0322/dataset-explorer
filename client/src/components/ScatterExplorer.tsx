import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import type { ColumnMeta, DatasetRow } from "@shared/schema";

export function ScatterExplorer({ columns, rows }: { columns: ColumnMeta[]; rows: DatasetRow[] }) {
  const numericColumns = useMemo(() => columns.filter((c) => c.type === "numeric"), [columns]);
  const [xCol, setXCol] = useState(numericColumns[0]?.name);
  const [yCol, setYCol] = useState(numericColumns[1]?.name ?? numericColumns[0]?.name);

  if (numericColumns.length < 2) {
    return (
      <Card data-testid="card-scatter-explorer">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Correlation explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Needs at least two numeric columns to plot a correlation. This dataset has {numericColumns.length}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const points = xCol && yCol
    ? rows
        .filter((r) => typeof r[xCol] === "number" && typeof r[yCol] === "number")
        .map((r) => ({ x: r[xCol] as number, y: r[yCol] as number }))
    : [];

  return (
    <Card data-testid="card-scatter-explorer">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-semibold">Correlation explorer</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={xCol} onValueChange={setXCol}>
            <SelectTrigger className="h-8 w-32 text-xs" data-testid="select-scatter-x">
              <SelectValue placeholder="X axis" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">vs</span>
          <Select value={yCol} onValueChange={setYCol}>
            <SelectTrigger className="h-8 w-32 text-xs" data-testid="select-scatter-y">
              <SelectValue placeholder="Y axis" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                name={xCol}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: xCol, position: "insideBottom", offset: -6, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={yCol}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={40}
                label={{ value: yCol, angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--popover-border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Scatter data={points} fill="hsl(var(--chart-1))" fillOpacity={0.7} data-testid="scatter-points" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground tabular-nums">{points.length.toLocaleString()} points plotted</p>
      </CardContent>
    </Card>
  );
}
