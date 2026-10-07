import { db } from "./databse";
import { jobSchema, type Job } from "@/schemas/job";

export async function createJob(
  input: Pick<Job, "company" | "title" | "description" | "url">,
): Promise<Job> {
  const now = new Date().toISOString();

  const job = jobSchema.parse({
    ...input,
    id: crypto.randomUUID(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  await db.jobs.add(job);

  return job;
}

export async function deleteJob(id: string): Promise<void> {
  await db.jobs.delete(id);
}
