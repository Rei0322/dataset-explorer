import type { Express } from "express";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { storage } from "./storage";
import { analyzeCsv } from "./stats";
import { uploadDatasetSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/datasets", async (_req, res) => {
    const list = await storage.listDatasets();
    res.json(list);
  });

  app.get("/api/datasets/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid dataset id" });
    const dataset = await storage.getDataset(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    res.json(dataset);
  });

  app.post("/api/datasets", async (req, res) => {
    const parsed = uploadDatasetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid request" });
    }
    try {
      const analysis = analyzeCsv(parsed.data.csvText);
      const dataset = await storage.createDataset({
        name: parsed.data.name,
        fileName: parsed.data.fileName ?? null,
        rowCount: analysis.rowCount,
        columnCount: analysis.columnCount,
        columns: analysis.columns,
        rows: analysis.rows,
      });
      res.status(201).json(dataset);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Could not parse CSV" });
    }
  });

  app.delete("/api/datasets/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid dataset id" });
    const result = await storage.deleteDataset(id);
    if (result.changes === 0) return res.status(404).json({ message: "Dataset not found" });
    res.status(204).end();
  });

  return httpServer;
}
