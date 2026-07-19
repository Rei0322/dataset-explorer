import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { ColumnMeta, DatasetRow } from "@shared/schema";

export function DataPreviewTable({
  columns,
  rows,
  limit = 25,
}: {
  columns: ColumnMeta[];
  rows: DatasetRow[];
  limit?: number;
}) {
  const preview = rows.slice(0, limit);

  return (
    <div className="rounded-md border border-border" data-testid="table-data-preview">
      <ScrollArea className="h-[420px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.name} className="whitespace-nowrap text-xs" data-testid={`header-col-${col.name}`}>
                  {col.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((row, i) => (
              <TableRow key={i} data-testid={`row-preview-${i}`}>
                {columns.map((col) => {
                  const value = row[col.name];
                  return (
                    <TableCell
                      key={col.name}
                      className={`whitespace-nowrap text-xs ${col.type === "numeric" ? "font-mono tabular-nums" : ""}`}
                    >
                      {value === null || value === undefined ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        String(value)
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground" data-testid="text-preview-count">
        Showing {preview.length.toLocaleString()} of {rows.length.toLocaleString()} rows
      </p>
    </div>
  );
}
