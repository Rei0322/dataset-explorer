import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rows3, Columns3, Trash2 } from "lucide-react";
import type { DatasetSummary } from "@shared/schema";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DatasetCard({
  dataset,
  onDelete,
}: {
  dataset: DatasetSummary;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="group relative overflow-hidden" data-testid={`card-dataset-${dataset.id}`}>
      <Link href={`/datasets/${dataset.id}`} data-testid={`link-dataset-${dataset.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-tight" data-testid={`text-dataset-name-${dataset.id}`}>
              {dataset.name}
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground" data-testid={`text-uploaded-at-${dataset.id}`}>
            Uploaded {timeAgo(dataset.uploadedAt)}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 tabular-nums">
              <Rows3 className="h-3.5 w-3.5" /> {dataset.rowCount.toLocaleString()} rows
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Columns3 className="h-3.5 w-3.5" /> {dataset.columnCount} columns
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="tabular-nums">
              {dataset.numericColumnCount} numeric
            </Badge>
            <Badge variant="secondary" className="tabular-nums">
              {dataset.categoricalColumnCount} categorical
            </Badge>
          </div>
        </CardContent>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
        onClick={(e) => {
          e.preventDefault();
          onDelete(dataset.id);
        }}
        data-testid={`button-delete-${dataset.id}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}
