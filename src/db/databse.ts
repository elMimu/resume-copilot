import Dexie, { type EntityTable } from "dexie";

import type { Job } from "@/schemas/job";

export const db = new Dexie("ResumeCopilot") as Dexie & {
  jobs: EntityTable<Job, "id">;
};

db.version(1).stores({
  jobs: "id, company, title, status, createdAt",
});
