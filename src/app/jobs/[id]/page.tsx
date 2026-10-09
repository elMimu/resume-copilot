"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { JobResultImport } from "@/components/job-result-import";
import { ResumeEditor } from "@/components/resume-editor";
import { ResumePreview } from "@/components/resume-preview";
import { db } from "@/db/databse";
import { saveJobResult } from "@/db/job-results";
import type { JobResult } from "@/schemas/job-result";
import { exportResumeDocx, exportResumePdf } from "@/app/lib/resume-export";

type Tab = "description" | "analysis" | "tailored" | "glossed";

type Match = "strong" | "partial" | "missing";

type Requirement = JobResult["analysis"]["requirements"][number];

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
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Link
          href="/"
          className="text-sm text-slate-500 transition hover:text-sky-400"
        >
          ← Applications
        </Link>

        <header className="mt-6 flex flex-col justify-between gap-5 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
                {job.title}
              </h1>

              {result && <OverallMatch score={result.analysis.matchScore} />}

              <StatusBadge status={job.status} />
            </div>

            <p className="mt-2 text-slate-400">{job.company}</p>
          </div>

          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
            >
              View original job ↗
            </a>
          )}
        </header>

        {!result ? (
          <div className="mt-8 max-w-2xl space-y-6">
            <PendingGeneration />

            <button
              type="button"
              onClick={generateResume}
              disabled={isGenerating}
              className="bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate tailored resume"}
            </button>

            {generationError && (
              <p className="border-l-2 border-rose-500 bg-rose-950/20 px-4 py-3 text-sm text-rose-300">
                {generationError}
              </p>
            )}

            <JobResultImport jobId={jobId} />
          </div>
        ) : (
          <GeneratedWorkspace
            jobId={jobId}
            jobDescription={job.description}
            result={result}
          />
        )}
      </div>
    </main>
  );
}

function GeneratedWorkspace({
  jobId,
  jobDescription,
  result,
}: {
  jobId: string;
  jobDescription: string;
  result: JobResult;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const [isEditing, setIsEditing] = useState(false);

  function changeTab(tab: Tab) {
    setActiveTab(tab);

    if (tab !== "tailored") {
      setIsEditing(false);
    }
  }

  return (
    <div>
      <WorkspaceNavigation activeTab={activeTab} onChange={changeTab} />

      <div className="mt-8">
        {activeTab === "description" && (
          <JobDescriptionView description={jobDescription} />
        )}

        {activeTab === "analysis" && <AnalysisView result={result} />}

        {activeTab === "tailored" && (
          <TailoredView
            jobId={jobId}
            result={result}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCloseEditor={() => setIsEditing(false)}
          />
        )}

        {activeTab === "glossed" && <GlossedView result={result} />}
      </div>
    </div>
  );
}

function WorkspaceNavigation({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const items: Array<{
    id: Tab;
    label: string;
  }> = [
      {
        id: "description",
        label: "Job Description",
      },
      {
        id: "analysis",
        label: "Analysis",
      },
      {
        id: "tailored",
        label: "Tailored Resume",
      },
      {
        id: "glossed",
        label: "Glossed",
      },
    ];

  return (
    <nav className="-mx-6 bg-slate-900 px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-stretch justify-between gap-6 overflow-x-auto">
        {items.map((item) => {
          const active = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={[
                "relative min-w-fit py-4 text-sm font-medium transition-colors",
                active ? "text-sky-400" : "text-slate-400 hover:text-slate-100",
              ].join(" ")}
            >
              {item.label}

              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function JobDescriptionView({ description }: { description: string }) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-100">
          Job Description
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Original description used to generate this analysis.
        </p>
      </div>

      <article className="bg-slate-900 px-6 py-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
          {description}
        </p>
      </article>
    </section>
  );
}

function AnalysisView({ result }: { result: JobResult }) {
  const strong = result.analysis.requirements.filter(
    (requirement) => requirement.match === "strong",
  );

  const partial = result.analysis.requirements.filter(
    (requirement) => requirement.match === "partial",
  );

  const missing = result.analysis.requirements.filter(
    (requirement) => requirement.match === "missing",
  );

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Requirements</h2>

        <p className="mt-1 text-sm text-slate-500">
          Requirements grouped according to the evidence found in your master
          resume.
        </p>
      </div>

      <div className="space-y-5">
        <RequirementGroup
          title="Strong matches"
          description="Requirements directly supported by your experience."
          requirements={strong}
          match="strong"
        />

        <RequirementGroup
          title="Partial matches"
          description="Related experience exists, but the exact requirement is not fully demonstrated."
          requirements={partial}
          match="partial"
        />

        <RequirementGroup
          title="Missing"
          description="No meaningful evidence was found in the master resume."
          requirements={missing}
          match="missing"
        />
      </div>
    </section>
  );
}

function RequirementGroup({
  title,
  description,
  requirements,
  match,
}: {
  title: string;
  description: string;
  requirements: Requirement[];
  match: Match;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const styles = matchStyles[match];

  return (
    <section className={`border-l-2 bg-slate-900 ${styles.border}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition hover:bg-slate-800/50"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 ${styles.text}`}>
            <ChevronIcon open={isOpen} />
          </span>

          <span>
            <span className="block font-semibold text-slate-100">{title}</span>

            <span className="mt-1 block text-sm leading-6 text-slate-500">
              {description}
            </span>
          </span>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}
        >
          {requirements.length}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-800">
          {requirements.length === 0 ? (
            <div className="px-5 py-7 text-sm text-slate-500">
              No requirements in this category.
            </div>
          ) : (
            requirements.map((requirement, index) => (
              <RequirementCard
                key={requirement.name}
                requirement={requirement}
                match={match}
                showDivider={index > 0}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function RequirementCard({
  requirement,
  match,
  showDivider,
}: {
  requirement: Requirement;
  match: Match;
  showDivider: boolean;
}) {
  const styles = matchStyles[match];

  return (
    <article
      className={[
        "bg-slate-950/25 px-5 py-5",
        showDivider ? "border-t border-slate-800" : "",
      ].join(" ")}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-medium text-slate-100">{requirement.name}</h3>

          <span className="mt-1 inline-block text-xs capitalize text-slate-500">
            {requirement.importance}
          </span>
        </div>

        <span
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles.badge}`}
        >
          {match}
        </span>
      </div>

      {requirement.evidence.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          {requirement.evidence.map((evidence) => (
            <li key={evidence} className="flex gap-2">
              <span className={styles.text}>•</span>

              <span>{evidence}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function TailoredView({
  jobId,
  result,
  isEditing,
  onEdit,
  onCloseEditor,
}: {
  jobId: string;
  result: JobResult;
  isEditing: boolean;
  onEdit: () => void;
  onCloseEditor: () => void;
}) {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const [exportError, setExportError] = useState<string | null>(null);

  async function exportPdf() {
    setExportError(null);

    setExporting("pdf");

    try {
      await exportResumePdf(result.enhanced);
    } catch (error) {
      console.error(error);

      setExportError("Could not generate the PDF.");
    } finally {
      setExporting(null);
    }
  }

  async function exportDocx() {
    setExportError(null);

    setExporting("docx");

    try {
      await exportResumeDocx(result.enhanced);
    } catch (error) {
      console.error(error);

      setExportError("Could not generate the DOCX file.");
    } finally {
      setExporting(null);
    }
  }

  if (isEditing) {
    return (
      <ResumeEditor
        jobId={jobId}
        resume={result.enhanced}
        onClose={onCloseEditor}
      />
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Tailored Resume
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Factual resume tailored to this opportunity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <button
            type="button"
            onClick={onEdit}
            className="font-medium text-slate-300 transition hover:text-sky-400"
          >
            Edit
          </button>

          <span className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={exportPdf}
            disabled={exporting !== null}
            className="font-medium text-sky-400 transition hover:text-sky-300 disabled:opacity-40"
          >
            {exporting === "pdf" ? "Generating PDF..." : "Export PDF"}
          </button>

          <button
            type="button"
            onClick={exportDocx}
            disabled={exporting !== null}
            className="font-medium text-sky-400 transition hover:text-sky-300 disabled:opacity-40"
          >
            {exporting === "docx" ? "Generating DOCX..." : "Export DOCX"}
          </button>
        </div>
      </div>

      {exportError && (
        <p className="mb-4 border-l-2 border-rose-500 bg-rose-950/20 px-4 py-3 text-sm text-rose-300">
          {exportError}
        </p>
      )}

      <div className="overflow-hidden bg-white">
        <ResumePreview resume={result.enhanced} />
      </div>
    </section>
  );
}

function GlossedView({ result }: { result: JobResult }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-100">
            Glossed Resume
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Aggressive positioning for comparison. Review unsupported claims
            before use.
          </p>
        </div>

        <div className="overflow-hidden bg-white">
          <ResumePreview resume={result.glossed} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-100">
          Unsupported claims
        </h2>

        {result.glossed.unsupportedClaims.length === 0 ? (
          <div className="mt-4 border-l-2 border-slate-700 bg-slate-900 px-5 py-5 text-sm text-slate-400">
            No unsupported claims were generated.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-800 border-l-2 border-rose-800 bg-rose-950/10">
            {result.glossed.unsupportedClaims.map((item) => (
              <article key={item.claim} className="p-5">
                <p className="font-medium text-rose-300">{item.claim}</p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.reason}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OverallMatch({ score }: { score: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Overall
      </span>

      <span className="text-base font-semibold text-sky-400">{score}%</span>
    </div>
  );
}

function PendingGeneration() {
  return (
    <div className="border-l-2 border-sky-500 bg-slate-900 px-6 py-5">
      <h2 className="font-semibold text-slate-100">Resume not generated yet</h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Generate the analysis, tailored resume and glossed comparison using the
        local Codex integration.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="text-xs font-medium capitalize text-slate-500">
      {status}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={[
        "h-5 w-5 transition-transform duration-200",
        open ? "rotate-180" : "",
      ].join(" ")}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const matchStyles = {
  strong: {
    border: "border-emerald-600",
    text: "text-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-300",
  },

  partial: {
    border: "border-amber-500",
    text: "text-amber-300",
    badge: "bg-amber-400/10 text-amber-300",
  },

  missing: {
    border: "border-rose-600",
    text: "text-rose-400",
    badge: "bg-rose-400/10 text-rose-300",
  },
} satisfies Record<
  Match,
  {
    border: string;
    text: string;
    badge: string;
  }
>;
