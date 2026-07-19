import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const COLUMN_TYPES = ["numeric", "categorical", "date", "boolean"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];

export const datasets = sqliteTable("datasets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  fileName: text("file_name"),
  uploadedAt: text("uploaded_at").notNull(),
  rowCount: integer("row_count").notNull(),
  columnCount: integer("column_count").notNull(),
  // JSON-encoded ColumnStats[] — SQLite has no array columns.
  columns: text("columns").notNull(),
  // JSON-encoded array of row objects (Record<string, string | number | null>).
  rows: text("rows").notNull(),
});

export type Dataset = typeof datasets.$inferSelect;

// --- Shapes stored inside the `columns` / `rows` JSON blobs ---

export const numericStatsSchema = z.object({
  count: z.number(),
  missing: z.number(),
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  median: z.number(),
  std: z.number(),
  histogram: z.array(z.object({ bucket: z.string(), count: z.number() })),
});
export type NumericStats = z.infer<typeof numericStatsSchema>;

export const categoricalStatsSchema = z.object({
  count: z.number(),
  missing: z.number(),
  uniqueCount: z.number(),
  topValues: z.array(z.object({ value: z.string(), count: z.number() })),
});
export type CategoricalStats = z.infer<typeof categoricalStatsSchema>;

export const columnMetaSchema = z.object({
  name: z.string(),
  type: z.enum(COLUMN_TYPES),
  numeric: numericStatsSchema.nullable(),
  categorical: categoricalStatsSchema.nullable(),
});
export type ColumnMeta = z.infer<typeof columnMetaSchema>;

export type DatasetRow = Record<string, string | number | null>;

// --- API-facing schemas (not 1:1 with the DB row — parsing happens server-side) ---

export const uploadDatasetSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  fileName: z.string().optional(),
  csvText: z.string().min(1, "CSV content is required"),
});
export type UploadDataset = z.infer<typeof uploadDatasetSchema>;

// What the client actually receives for a dataset (columns/rows parsed back out of JSON).
export interface DatasetDetail {
  id: number;
  name: string;
  fileName: string | null;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnMeta[];
  rows: DatasetRow[];
}

export interface DatasetSummary {
  id: number;
  name: string;
  fileName: string | null;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  numericColumnCount: number;
  categoricalColumnCount: number;
}
