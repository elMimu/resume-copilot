import { db } from "./databse";

import {
  generatedJobPayloadSchema,
  jobResultSchema,
  resumeSchema,
  type JobResult,
} from "@/schemas/job-result";

export async function saveJobResult(
  jobId: string,
  input: unknown,
): Promise<JobResult> {
  const payload = generatedJobPayloadSchema.parse(input);

  const result = jobResultSchema.parse({
    ...payload,
    jobId,
    generatedAt: new Date().toISOString(),
  });

  await db.transaction("rw", db.jobs, db.jobResults, async () => {
    const job = await db.jobs.get(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    await db.jobResults.put(result);

    await db.jobs.update(jobId, {
      status: "ready",
      updatedAt: new Date().toISOString(),
    });
  });

  return result;
}

export async function updateEnhancedResume(
  jobId: string,
  input: unknown,
): Promise<JobResult> {
  const enhanced = resumeSchema.parse(input);

  const current = await db.jobResults.get(jobId);

  if (!current) {
    throw new Error("Generated resume not found.");
  }

  const updated = jobResultSchema.parse({
    ...current,
    enhanced,
  });

  await db.jobResults.put(updated);

  return updated;
}
