"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { JobResultImport } from "@/components/job-result-import";
import { ResumePreview } from "@/components/resume-preview";
import { db } from "@/db/databse";
import { saveJobResult } from "@/db/job-results";
import type { JobResult, GeneratedJobPayload } from "@/schemas/job-result";

type Resume = GeneratedJobPayload["enhanced"];

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
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String(data.error)
            : "Resume generation failed.";

        throw new Error(message);
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
        Generate a tailored resume using the local Codex integration.
      </p>
    </div>
  );
}

function GeneratedResult({ result }: { result: JobResult }) {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-end justify-between gap-4">
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{requirement.name}</p>

                  <p className="mt-1 text-xs text-gray-500">
                    {requirement.importance}
                  </p>
                </div>

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

      {result.analysis.strengths.length > 0 && (
        <AnalysisList title="Strengths" items={result.analysis.strengths} />
      )}

      {result.analysis.gaps.length > 0 && (
        <AnalysisList title="Gaps" items={result.analysis.gaps} />
      )}

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Enhanced Resume</h2>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Print / Save PDF
          </button>
        </div>

        <ResumePreview resume={result.enhanced} />
      </section>

      <ResumeSummary title="Glossed Resume" resume={result.glossed} />

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

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ResumeSummary({ title, resume }: { title: string; resume: Resume }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="mt-4 rounded border p-6">
        <h3 className="text-xl font-semibold">{resume.headline}</h3>

        <p className="mt-3 text-sm leading-6">{resume.summary}</p>

        {resume.skills.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Skills</h4>

            <div className="mt-2 space-y-1 text-sm">
              {resume.skills.map((group) => (
                <p key={group.category}>
                  <strong>{group.category}:</strong> {group.items.join(", ")}
                </p>
              ))}
            </div>
          </div>
        )}

        {resume.experiences.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Experience</h4>

            <div className="mt-3 space-y-5">
              {resume.experiences.map((experience) => (
                <article
                  key={`${experience.company}-${experience.role}-${experience.startDate}`}
                >
                  <h5 className="font-medium">{experience.role}</h5>

                  <p className="text-sm text-gray-500">
                    {experience.company} · {experience.startDate} –{" "}
                    {experience.endDate}
                    {experience.location ? ` · ${experience.location}` : ""}
                  </p>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Education</h4>

            <div className="mt-3 space-y-3">
              {resume.education.map((education) => (
                <article key={`${education.institution}-${education.degree}`}>
                  <p className="font-medium">{education.institution}</p>

                  <p className="text-sm text-gray-500">
                    {education.degree}

                    {education.status ? ` · ${education.status}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}

        {resume.projects.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Projects</h4>

            <div className="mt-3 space-y-3">
              {resume.projects.map((project) => (
                <article key={project.name}>
                  <p className="font-medium">{project.name}</p>

                  <p className="text-sm text-gray-600">{project.description}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {resume.languages.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">Languages</h4>

            <p className="mt-2 text-sm">
              {resume.languages
                .map(({ language, level }) => `${language}: ${level}`)
                .join(" | ")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
