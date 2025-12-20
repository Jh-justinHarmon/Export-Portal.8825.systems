
import { storage } from "../server/storage";
import { db } from "../server/db";

async function seed() {
  console.log("Seeding database...");

  const jobs = await storage.listJobs();
  if (jobs.length > 0) {
    console.log("Database already seeded");
    process.exit(0);
  }

  await storage.createJob({
    markdown: "# Hello World\nThis is a test export.",
    target: "pdf",
    templateId: "generic",
    userId: "user_123",
  });

  await storage.createJob({
    markdown: "# Monthly Report\n## Sales\n- Q1: $100k\n- Q2: $150k",
    target: "email",
    templateId: "report",
    userId: "user_123",
  });

  console.log("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
