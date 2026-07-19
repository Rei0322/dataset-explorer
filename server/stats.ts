import type { ColumnMeta, ColumnType, DatasetRow } from "@shared/schema";

/** Minimal RFC4180-ish CSV parser: handles quoted fields, embedded commas/newlines, "" escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const next = normalized[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function isMissing(value: string | undefined): boolean {
  if (value === undefined) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed.toLowerCase() === "na" || trimmed.toLowerCase() === "null" || trimmed === "-";
}

function isNumericToken(value: string): boolean {
  const trimmed = value.trim().replace(/,/g, "");
  if (trimmed === "") return false;
  return /^-?\d+(\.\d+)?$/.test(trimmed);
}

const BOOLISH = new Set(["true", "false", "yes", "no", "y", "n"]);
const DATEISH = /^\d{4}-\d{2}-\d{2}(t.*)?$|^\d{1,2}\/\d{1,2}\/\d{2,4}$/i;

function inferType(values: string[]): ColumnType {
  const present = values.filter((v) => !isMissing(v));
  if (present.length === 0) return "categorical";

  const numericRatio = present.filter(isNumericToken).length / present.length;
  if (numericRatio >= 0.9) return "numeric";

  const uniqueLower = new Set(present.map((v) => v.trim().toLowerCase()));
  if (uniqueLower.size <= 2 && Array.from(uniqueLower).every((v) => BOOLISH.has(v))) return "boolean";

  const dateRatio = present.filter((v) => DATEISH.test(v.trim()) && !Number.isNaN(Date.parse(v.trim()))).length / present.length;
  if (dateRatio >= 0.85) return "date";

  return "categorical";
}

function computeNumericStats(values: string[]) {
  const missing = values.filter(isMissing).length;
  const nums = values.filter((v) => !isMissing(v) && isNumericToken(v)).map((v) => parseFloat(v.replace(/,/g, "")));
  const count = nums.length;
  if (count === 0) {
    return { count: 0, missing, min: 0, max: 0, mean: 0, median: 0, std: 0, histogram: [] };
  }
  const sorted = [...nums].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = nums.reduce((s, n) => s + n, 0) / count;
  const mid = Math.floor(count / 2);
  const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / count;
  const std = Math.sqrt(variance);

  const bucketCount = Math.min(10, Math.max(1, new Set(nums).size));
  const range = max - min;
  const width = range === 0 ? 1 : range / bucketCount;
  const buckets = Array.from({ length: bucketCount }, () => 0);
  for (const n of nums) {
    let idx = width === 0 ? 0 : Math.floor((n - min) / width);
    if (idx >= bucketCount) idx = bucketCount - 1;
    if (idx < 0) idx = 0;
    buckets[idx]++;
  }
  const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  const histogram = buckets.map((c, i) => {
    const lo = min + i * width;
    return { bucket: i === 0 ? compactFmt.format(lo) : `${compactFmt.format(lo)}+`, count: c };
  });

  return { count, missing, min, max, mean, median, std, histogram };
}

function computeCategoricalStats(values: string[]) {
  const missing = values.filter(isMissing).length;
  const present = values.filter((v) => !isMissing(v)).map((v) => v.trim());
  const freq = new Map<string, number>();
  for (const v of present) freq.set(v, (freq.get(v) ?? 0) + 1);
  const topValues = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({ value, count }));
  return { count: present.length, missing, uniqueCount: freq.size, topValues };
}

export interface ParsedCsv {
  columns: ColumnMeta[];
  rows: DatasetRow[];
  rowCount: number;
  columnCount: number;
}

export function analyzeCsv(text: string): ParsedCsv {
  const table = parseCsv(text);
  if (table.length === 0) {
    throw new Error("The CSV appears to be empty.");
  }
  const header = table[0].map((h) => h.trim() || "Column");
  const dataRows = table.slice(1);
  if (dataRows.length === 0) {
    throw new Error("The CSV has a header row but no data rows.");
  }

  const columnValues: string[][] = header.map((_, colIdx) => dataRows.map((r) => r[colIdx] ?? ""));

  const columns: ColumnMeta[] = header.map((name, colIdx) => {
    const values = columnValues[colIdx];
    const type = inferType(values);
    if (type === "numeric") {
      return { name, type, numeric: computeNumericStats(values), categorical: null };
    }
    return { name, type, numeric: null, categorical: computeCategoricalStats(values) };
  });

  const rows: DatasetRow[] = dataRows.map((r) => {
    const row: DatasetRow = {};
    header.forEach((name, colIdx) => {
      const raw = r[colIdx];
      const col = columns[colIdx];
      if (raw === undefined || isMissing(raw)) {
        row[name] = null;
      } else if (col.type === "numeric" && isNumericToken(raw)) {
        row[name] = parseFloat(raw.replace(/,/g, ""));
      } else {
        row[name] = raw.trim();
      }
    });
    return row;
  });

  return { columns, rows, rowCount: rows.length, columnCount: header.length };
}
