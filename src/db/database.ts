import Dexie, { type EntityTable } from "dexie";

import type { Job } from "@/schemas/job";
import type { JobResult } from "@/schemas/job-result";

export const db = new Dexie("ResumeCopilot") as Dexie & {
  jobs: EntityTable<Job, "id">;

  jobResults: EntityTable<JobResult, "jobId">;
};

db.version(1).stores({
  jobs: "id, company, title, status, createdAt",
});

db.version(2).stores({
  jobs: "id, company, title, status, createdAt",

  jobResults: "&jobId, generatedAt, schemaVersion",
});

db.version(3)
  .stores({
    jobs: "id, company, title, status, generationStatus, createdAt",

    jobResults: "&jobId, generatedAt, schemaVersion",
  })
  .upgrade(async (transaction) => {
    const jobs = await transaction.table("jobs").toArray();

    const results = await transaction.table("jobResults").toArray();

    const generatedJobIds = new Set(results.map((result) => result.jobId));

    for (const job of jobs) {
      await transaction.table("jobs").update(job.id, {
        resumeLanguage: job.resumeLanguage ?? "en",

        generationStatus: generatedJobIds.has(job.id) ? "ready" : "idle",

        generationError: null,

        generationCompletedAt: null,
      });
    }
  });
