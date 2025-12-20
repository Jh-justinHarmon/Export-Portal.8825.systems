
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

  // GET /api/jobs/pending - Fetch pending jobs for the worker
  app.get(api.jobs.pending.path, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const validLimit = Math.min(Math.max(1, limit), 100);
      const jobs = await storage.getPendingJobs(validLimit);
      res.json({ jobs });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PATCH /api/jobs/:id - Update job status (for worker)
  app.patch(api.jobs.update.path, async (req, res) => {
    try {
      const input = api.jobs.update.input.parse(req.body);
      
      // Check if job exists first
      const existingJob = await storage.getJob(req.params.id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Build updates object, converting completedAt string to Date if provided
      const updates: Record<string, unknown> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.artifactUrl !== undefined) updates.artifactUrl = input.artifactUrl;
      if (input.error !== undefined) updates.error = input.error;
      if (input.completedAt !== undefined) updates.completedAt = new Date(input.completedAt);

      const updatedJob = await storage.updateJob(req.params.id, updates);
      res.json(updatedJob);
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

  return httpServer;
}
