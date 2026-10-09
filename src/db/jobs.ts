import { db } from "./database";

import { jobSchema, type Job } from "@/schemas/job";

type CreateJobInput = Pick<
  Job,
  "company" | "title" | "description" | "url" | "resumeLanguage"
>;

export async function createJob(input: CreateJobInput): Promise<Job> {
  const now = new Date().toISOString();

  const job = jobSchema.parse({
    ...input,

    id: crypto.randomUUID(),

    status: "draft",

    generationStatus: "queued",

    generationError: null,

    generationCompletedAt: null,

    createdAt: now,
    updatedAt: now,
  });

  await db.jobs.add(job);

  return job;
}

export async function claimQueuedJob(id: string): Promise<Job | null> {
  return db.transaction("rw", db.jobs, async () => {
    const job = await db.jobs.get(id);

    if (!job || job.generationStatus !== "queued") {
      return null;
    }

    const now = new Date().toISOString();

    const updated = jobSchema.parse({
      ...job,

      generationStatus: "processing",

      generationError: null,

      generationCompletedAt: null,

      updatedAt: now,
    });

    await db.jobs.put(updated);

    return updated;
  });
}

export async function markJobGenerationError(
  id: string,
  message: string,
): Promise<void> {
  await db.jobs.update(id, {
    generationStatus: "error",

    generationError: message,

    generationCompletedAt: null,

    updatedAt: new Date().toISOString(),
  });
}

export async function deleteJob(id: string): Promise<void> {
  await db.transaction("rw", db.jobs, db.jobResults, async () => {
    const job = await db.jobs.get(id);

    if (!job) {
      return;
    }

    if (
      job.generationStatus === "queued" ||
      job.generationStatus === "processing"
    ) {
      throw new Error(
        "A job cannot be deleted while resume generation is in progress.",
      );
    }

    await db.jobResults.delete(id);

    await db.jobs.delete(id);
  });
}

export async function getJob(id: string): Promise<Job | undefined> {
  return db.jobs.get(id);
}
