import { datasets } from "@shared/schema";
import type { ColumnMeta, Dataset, DatasetDetail, DatasetRow, DatasetSummary } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc, eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    file_name TEXT,
    uploaded_at TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    column_count INTEGER NOT NULL,
    columns TEXT NOT NULL,
    rows TEXT NOT NULL
  );
`);

function toDetail(row: Dataset): DatasetDetail {
  return {
    id: row.id,
    name: row.name,
    fileName: row.fileName,
    uploadedAt: row.uploadedAt,
    rowCount: row.rowCount,
    columnCount: row.columnCount,
    columns: JSON.parse(row.columns) as ColumnMeta[],
    rows: JSON.parse(row.rows) as DatasetRow[],
  };
}

function toSummary(row: Dataset): DatasetSummary {
  const columns = JSON.parse(row.columns) as ColumnMeta[];
  return {
    id: row.id,
    name: row.name,
    fileName: row.fileName,
    uploadedAt: row.uploadedAt,
    rowCount: row.rowCount,
    columnCount: row.columnCount,
    numericColumnCount: columns.filter((c) => c.type === "numeric").length,
    categoricalColumnCount: columns.filter((c) => c.type !== "numeric").length,
  };
}

export interface CreateDatasetInput {
  name: string;
  fileName: string | null;
  rowCount: number;
  columnCount: number;
  columns: ColumnMeta[];
  rows: DatasetRow[];
}

export interface IStorage {
  listDatasets(): Promise<DatasetSummary[]>;
  getDataset(id: number): Promise<DatasetDetail | undefined>;
  createDataset(input: CreateDatasetInput): Promise<DatasetDetail>;
  deleteDataset(id: number): Promise<{ changes: number }>;
}

export class DatabaseStorage implements IStorage {
  async listDatasets(): Promise<DatasetSummary[]> {
    const rows = db.select().from(datasets).orderBy(desc(datasets.id)).all();
    return rows.map(toSummary);
  }

  async getDataset(id: number): Promise<DatasetDetail | undefined> {
    const row = db.select().from(datasets).where(eq(datasets.id, id)).get();
    return row ? toDetail(row) : undefined;
  }

  async createDataset(input: CreateDatasetInput): Promise<DatasetDetail> {
    const row = db
      .insert(datasets)
      .values({
        name: input.name,
        fileName: input.fileName,
        uploadedAt: new Date().toISOString(),
        rowCount: input.rowCount,
        columnCount: input.columnCount,
        columns: JSON.stringify(input.columns),
        rows: JSON.stringify(input.rows),
      })
      .returning()
      .get();
    return toDetail(row);
  }

  async deleteDataset(id: number): Promise<{ changes: number }> {
    return db.delete(datasets).where(eq(datasets.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
