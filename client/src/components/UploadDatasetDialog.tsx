import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUploadDataset } from "@/lib/hooks";
import { uploadDatasetSchema } from "@shared/schema";

const formSchema = uploadDatasetSchema;
type FormValues = z.infer<typeof formSchema>;

export function UploadDatasetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const upload = useUploadDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "paste">("file");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", fileName: "", csvText: "" },
  });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      form.setValue("csvText", text, { shouldValidate: true });
      form.setValue("fileName", file.name);
      if (!form.getValues("name")) {
        form.setValue("name", file.name.replace(/\.csv$/i, ""));
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = (values: FormValues) => {
    upload.mutate(values, {
      onSuccess: (dataset) => {
        toast({
          title: "Dataset uploaded",
          description: `${dataset.rowCount.toLocaleString()} rows · ${dataset.columnCount} columns analyzed.`,
        });
        form.reset({ name: "", fileName: "", csvText: "" });
        onOpenChange(false);
        navigate(`/datasets/${dataset.id}`);
      },
      onError: (err) => {
        toast({
          title: "Upload failed",
          description: err instanceof Error ? err.message : "Could not parse this CSV.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset({ name: "", fileName: "", csvText: "" });
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg" data-testid="dialog-upload-dataset">
        <DialogHeader>
          <DialogTitle>Add a dataset</DialogTitle>
          <DialogDescription>Upload a CSV file or paste CSV text to analyze it.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. customer_churn" data-testid="input-dataset-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={mode} onValueChange={(v) => setMode(v as "file" | "paste")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" data-testid="tab-upload-file">
                  Upload file
                </TabsTrigger>
                <TabsTrigger value="paste" data-testid="tab-paste-csv">
                  Paste CSV
                </TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-choose-file"
                  className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  <UploadCloud className="h-6 w-6" />
                  <span>{form.watch("fileName") || "Click to choose a .csv file"}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  data-testid="input-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </TabsContent>
              <TabsContent value="paste" className="mt-3">
                <FormField
                  control={form.control}
                  name="csvText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={"name,age,city\nAlice,29,Portland\nBob,34,Seattle"}
                          rows={8}
                          className="font-mono text-xs"
                          data-testid="textarea-csv-paste"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            {mode === "file" && form.formState.errors.csvText && (
              <p className="text-sm text-destructive">{form.formState.errors.csvText.message}</p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={upload.isPending} data-testid="button-submit-upload">
                {upload.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
                  </>
                ) : (
                  "Analyze dataset"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
