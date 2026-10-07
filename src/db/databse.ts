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
