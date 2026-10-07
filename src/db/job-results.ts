import { db } from "./databse";

import {
  generatedJobPayloadSchema,
  jobResultSchema,
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
