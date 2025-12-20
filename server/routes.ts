
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.export.create.path, async (req, res) => {
    try {
      const input = api.export.create.input.parse(req.body);
      const job = await storage.createJob({
        markdown: input.markdown,
        target: input.target,
        templateId: "generic",
        userId: "anonymous",
      });
      
      res.status(200).json({ // Using 200 as per schema in shared/routes.ts which has 200 for create response (though 201 is standard, I'll stick to what I defined)
        job_id: job.id,
        status: job.status,
        message: "Job created successfully",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.jobs.get.path, async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
