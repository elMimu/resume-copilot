"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import type { JobResult } from "@/schemas/job-result";
import { JobResultImport } from "@/components/job-result-import";

import { db } from "@/db/databse";

import type { z } from "zod";

import { resumeSchema } from "@/schemas/job-result";
import { useState } from "react";
import { saveJobResult } from "@/db/job-results";

type Resume = z.infer<typeof resumeSchema>;

export default function JobPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const job = useLiveQuery(() => db.jobs.get(jobId), [jobId]);

  const result = useLiveQuery(() => db.jobResults.get(jobId), [jobId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  async function generateResume() {
    if (!job) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

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
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const error =
          typeof data === "object" && data !== null && "error" in data
            ? String(data.error)
            : "Resume generation failed.";

        throw new Error(error);
      }

      await saveJobResult(job.id, data);
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Resume generation failed.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  if (job === undefined) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Applications
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold">{job.title}</h1>

        <div className="mt-2 flex gap-3 text-sm text-gray-500">
          <span>{job.company}</span>
          <span>•</span>
          <span>{job.status}</span>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <aside>
          <h2 className="font-semibold">Job</h2>

          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-gray-500">Company</dt>
              <dd>{job.company}</dd>
            </div>

            <div>
              <dt className="text-gray-500">Status</dt>
              <dd>{job.status}</dd>
            </div>

            {job.url && (
              <div>
                <dt className="text-gray-500">Original job</dt>
                <dd>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Open
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </aside>

        <section>
          {!result ? (
            <div className="space-y-6">
              <PendingGeneration />

              <button
                type="button"
                onClick={generateResume}
                disabled={isGenerating}
                className="rounded border px-4 py-2 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate tailored resume"}
              </button>

              {generationError && (
                <p className="text-sm text-red-600">{generationError}</p>
              )}

              <JobResultImport jobId={jobId} />
            </div>
          ) : (
            <GeneratedResult result={result} />
          )}
        </section>
      </div>
    </main>
  );
}

function PendingGeneration() {
  return (
    <div className="rounded border p-6">
      <h2 className="font-semibold">Resume not generated yet</h2>

      <p className="mt-2 text-sm text-gray-500">
        Generate the Resume Copilot payload with Codex and import it here.
      </p>
    </div>
  );
}

function GeneratedResult({ result }: { result: JobResult }) {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500">Match</p>

            <p className="text-4xl font-semibold">
              {result.analysis.matchScore}%
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Generated {new Date(result.generatedAt).toLocaleDateString()}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Requirements</h2>

        <div className="mt-4 space-y-3">
          {result.analysis.requirements.map((requirement) => (
            <div key={requirement.name} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{requirement.name}</p>

                <span className="text-sm">{requirement.match}</span>
              </div>

              {requirement.evidence.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {requirement.evidence.map((evidence) => (
                    <li key={evidence}>{evidence}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <ResumeSection title="Enhanced Resume" resume={result.enhanced} />

      <ResumeSection title="Glossed Resume" resume={result.glossed} />

      {result.glossed.unsupportedClaims.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Unsupported claims</h2>

          <div className="mt-4 space-y-3">
            {result.glossed.unsupportedClaims.map((item) => (
              <div key={item.claim} className="rounded border p-4">
                <p className="font-medium">{item.claim}</p>
                <p className="mt-1 text-sm text-gray-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ResumeSection({ title, resume }: { title: string; resume: Resume }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="mt-4 rounded border p-6">
        <h3 className="text-xl font-semibold">{resume.headline}</h3>

        <p className="mt-3 text-sm leading-6">{resume.summary}</p>

        <div className="mt-6">
          <h4 className="font-semibold">Skills</h4>

          <p className="mt-2 text-sm">{resume.skills.join(" · ")}</p>
        </div>

        <div className="mt-6 space-y-6">
          {resume.experiences.map((experience) => (
            <article key={`${experience.company}-${experience.role}`}>
              <h4 className="font-semibold">{experience.role}</h4>

              <p className="text-sm text-gray-500">
                {experience.company} · {experience.startDate} –{" "}
                {experience.endDate}
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {experience.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
