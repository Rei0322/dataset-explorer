import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Plus, Database, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DatasetCard } from "@/components/DatasetCard";
import { UploadDatasetDialog } from "@/components/UploadDatasetDialog";
import { useDatasets, useDeleteDataset } from "@/lib/hooks";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

export default function Datasets() {
  const { data: datasets, isLoading } = useDatasets();
  const deleteDataset = useDeleteDataset();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const confirmDelete = () => {
    if (pendingDeleteId === null) return;
    deleteDataset.mutate(pendingDeleteId, {
      onSuccess: () => toast({ title: "Dataset removed" }),
    });
    setPendingDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-base font-semibold leading-tight" data-testid="text-app-title">
                Dataset Explorer
              </h1>
              <p className="text-xs text-muted-foreground">Upload a CSV, get instant stats and charts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setUploadOpen(true)} data-testid="button-open-upload">
              <Plus className="mr-1.5 h-4 w-4" /> Add dataset
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="skeleton-datasets">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : datasets && datasets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid-datasets">
            {datasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} onDelete={setPendingDeleteId} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center"
            data-testid="empty-state-datasets"
          >
            <Database className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No datasets yet</p>
            <p className="mb-4 mt-1 max-w-xs text-sm text-muted-foreground">
              Upload a CSV to see column types, summary statistics, and charts generated automatically.
            </p>
            <Button onClick={() => setUploadOpen(true)} data-testid="button-empty-upload">
              <Plus className="mr-1.5 h-4 w-4" /> Add your first dataset
            </Button>
          </div>
        )}
      </main>

      <UploadDatasetDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the uploaded data and all computed statistics. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
