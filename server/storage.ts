
import { exportJobs, type ExportJob, type InsertExportJob } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createJob(job: InsertExportJob): Promise<ExportJob>;
  getJob(id: string): Promise<ExportJob | undefined>;
  listJobs(limit?: number): Promise<ExportJob[]>;
  getPendingJobs(limit?: number): Promise<ExportJob[]>;
  updateJob(id: string, updates: Partial<ExportJob>): Promise<ExportJob | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createJob(insertJob: InsertExportJob): Promise<ExportJob> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [job] = await db
      .insert(exportJobs)
      .values({ ...insertJob, id })
      .returning();
    return job;
  }

  async getJob(id: string): Promise<ExportJob | undefined> {
    const [job] = await db.select().from(exportJobs).where(eq(exportJobs.id, id));
    return job;
  }

  async listJobs(limit: number = 20): Promise<ExportJob[]> {
    return await db.select().from(exportJobs).orderBy(desc(exportJobs.createdAt)).limit(limit);
  }

  async getPendingJobs(limit: number = 10): Promise<ExportJob[]> {
    return await db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.status, "pending"))
      .orderBy(desc(exportJobs.createdAt))
      .limit(limit);
  }

  async updateJob(id: string, updates: Partial<ExportJob>): Promise<ExportJob | undefined> {
    const [updated] = await db
      .update(exportJobs)
      .set(updates)
      .where(eq(exportJobs.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
