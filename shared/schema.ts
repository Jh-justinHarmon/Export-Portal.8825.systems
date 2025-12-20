
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exportJobs = pgTable("export_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  markdown: text("markdown").notNull(),
  target: text("target").notNull(),
  templateId: text("template_id").notNull(),
  status: text("status").notNull().default("pending"),
  artifactUrl: text("artifact_url"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertExportJobSchema = createInsertSchema(exportJobs).pick({
  markdown: true,
  target: true,
  templateId: true,
  userId: true,
});

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = z.infer<typeof insertExportJobSchema>;

export type CreateJobRequest = {
  markdown: string;
  target: string;
  templateId?: string;
};
