import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Columns3, Moon, Rows3, Sun, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ColumnStatsCard } from "@/components/ColumnStatsCard";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { ScatterExplorer } from "@/components/ScatterExplorer";
import { useDataset, useDeleteDataset } from "@/lib/hooks";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="font-mono text-lg font-semibold tabular-nums leading-none" data-testid={`text-kpi-${label}`}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { data: dataset, isLoading } = useDataset(Number(id));
  const deleteDataset = useDeleteDataset();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    if (!dataset) return;
    deleteDataset.mutate(dataset.id, {
      onSuccess: () => {
        toast({ title: "Dataset removed" });
        navigate("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Link href="/" data-testid="link-back">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Logo className="h-6 w-6 shrink-0 text-primary" />
            <h1 className="truncate text-sm font-semibold" data-testid="text-dataset-title">
              {dataset?.name ?? "Loading…"}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="icon" onClick={toggleTheme} data-testid="button-toggle-theme" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setConfirmOpen(true)} data-testid="button-delete-dataset">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {isLoading || !dataset ? (
          <div className="space-y-6" data-testid="skeleton-dataset-detail">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="grid-kpis">
              <Kpi icon={<Rows3 className="h-4 w-4" />} label="Rows" value={dataset.rowCount.toLocaleString()} />
              <Kpi icon={<Columns3 className="h-4 w-4" />} label="Columns" value={String(dataset.columnCount)} />
              <Kpi
                icon={<span className="font-mono text-xs font-bold">#</span>}
                label="Numeric"
                value={String(dataset.columns.filter((c) => c.type === "numeric").length)}
              />
              <Kpi
                icon={<TriangleAlert className="h-4 w-4" />}
                label="Missing values"
                value={`${dataset.columns
                  .reduce((sum, c) => sum + (c.numeric?.missing ?? c.categorical?.missing ?? 0), 0)
                  .toLocaleString()}`}
              />
            </div>

            <ScatterExplorer columns={dataset.columns} rows={dataset.rows} />

            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Column statistics</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid-column-stats">
                {dataset.columns.map((col) => (
                  <ColumnStatsCard key={col.name} column={col} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Data preview</h2>
              <DataPreviewTable columns={dataset.columns} rows={dataset.rows} />
            </div>
          </>
        )}
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-testid="dialog-confirm-delete-detail">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the uploaded data and all computed statistics. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-detail">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete-detail">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
