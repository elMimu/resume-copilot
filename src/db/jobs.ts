import { db } from "./databse";

import {
  jobSchema,
  type Job,
} from "@/schemas/job";

export async function createJob(
  input: Pick<
    Job,
    | "company"
    | "title"
    | "description"
    | "url"
  >,
): Promise<Job> {
  const now =
    new Date().toISOString();

  const job =
    jobSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

  await db.jobs.add(job);

  return job;
}

export async function deleteJob(
  id: string,
): Promise<void> {
  await db.transaction(
    "rw",
    db.jobs,
    db.jobResults,
    async () => {
      await db.jobResults.delete(
        id,
      );

      await db.jobs.delete(id);
    },
  );
}

export async function getJob(
  id: string,
): Promise<
  Job | undefined
> {
  return db.jobs.get(id);
}
