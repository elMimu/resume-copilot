import { claimQueuedJob, markJobGenerationError } from "@/db/jobs";

import { saveJobResult } from "@/db/job-results";

export async function processQueuedJob(jobId: string): Promise<boolean> {
  const job = await claimQueuedJob(jobId);

  if (!job) {
    return false;
  }

  try {
    const response = await fetch("/api/generate-resume", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        company: job.company,

        title: job.title,

        description: job.description,

        url: job.url || undefined,

        resumeLanguage: job.resumeLanguage,
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null && "error" in data
          ? String(data.error)
          : "Resume generation failed.";

      throw new Error(message);
    }

    await saveJobResult(job.id, data);

    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Resume generation failed.";

    await markJobGenerationError(job.id, message);

    console.error("Resume generation failed:", error);

    return false;
  }
}
