"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { JobResultImport } from "@/components/job-result-import";
import { ResumeEditor } from "@/components/resume-editor";
import { ResumePreview } from "@/components/resume-preview";
import { Win98Icon } from "@/components/win98-icon";
import { db } from "@/db/database";
import { saveJobResult } from "@/db/job-results";
import { exportResumeDocx, exportResumePdf } from "@/app/lib/resume-export";
import type { JobResult } from "@/schemas/job-result";
import styles from "@/styles/win98.module.css";

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
      <main className={styles.shell}>
        <div className={styles.desktop}>
          <div className={styles.window}>
            <div className={styles.titleBar}>
              <Win98Icon name="app" />
              Resume Copilot
            </div>

            <div className={styles.windowBody}>Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <div className={styles.desktop}>
        <div className={styles.window}>
          <div className={styles.titleBar}>
            <Win98Icon name="app" />
            Resume Copilot — {job.title}
          </div>

          <div className={styles.windowBody}>
            <Link href="/" className={styles.backLink}>
              <Win98Icon name="back" />
              Applications
            </Link>

            <header className={styles.jobHeader}>
              <div className={styles.jobIdentity}>
                <div className={styles.jobTitleRow}>
                  <h1 className={styles.jobTitle}>{job.title}</h1>

                  {result && (
                    <OverallMatch score={result.analysis.matchScore} />
                  )}

                  <StatusBadge status={job.status} />
                </div>

                <p className={styles.company}>{job.company}</p>
              </div>

              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.externalLink}
                >
                  <Win98Icon name="external" />
                  View original job
                </a>
              )}
            </header>

            {!result ? (
              <div className={styles.generateArea}>
                <PendingGeneration />

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={generateResume}
                    disabled={isGenerating}
                    className={`${styles.button} ${styles.primaryButton}`}
                  >
                    <Win98Icon name="resume" />
                    {isGenerating
                      ? "Generating..."
                      : "Generate tailored resume"}
                  </button>
                </div>

                {generationError && (
                  <p className={styles.errorBox}>{generationError}</p>
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
        </div>
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
    <>
      <WorkspaceNavigation activeTab={activeTab} onChange={changeTab} />

      <div className={styles.content}>
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
    </>
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
    icon: "document" | "analysis" | "resume" | "sparkle";
  }> = [
      {
        id: "description",
        label: "Job Description",
        icon: "document",
      },
      {
        id: "analysis",
        label: "Analysis",
        icon: "analysis",
      },
      {
        id: "tailored",
        label: "Tailored Resume",
        icon: "resume",
      },
      {
        id: "glossed",
        label: "Glossed",
        icon: "sparkle",
      },
    ];

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active = item.id === activeTab;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={[
              styles.navButton,
              active ? styles.navButtonActive : "",
            ].join(" ")}
          >
            <Win98Icon name={item.icon} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function JobDescriptionView({ description }: { description: string }) {
  return (
    <section>
      <SectionHeading
        title="Job Description"
        description="Original description used to generate this analysis."
      />

      <article className={`${styles.sunken} ${styles.description}`}>
        {description}
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
      <SectionHeading
        title="Requirements"
        description="Requirements grouped according to the evidence found in your master resume."
      />

      <div className={styles.requirementGroups}>
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

  const matchClass = {
    strong: styles.requirementStrong,
    partial: styles.requirementPartial,
    missing: styles.requirementMissing,
  }[match];

  return (
    <section className={`${styles.requirementGroup} ${matchClass}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className={styles.requirementHeader}
      >
        <span className={styles.requirementHeaderMain}>
          <span
            className={[styles.chevron, isOpen ? styles.chevronOpen : ""].join(
              " ",
            )}
          >
            <Win98Icon name="chevron" />
          </span>

          <span>
            <span className={styles.requirementName}>{title}</span>

            <span className={styles.requirementDescription}>{description}</span>
          </span>
        </span>

        <span className={styles.countBadge}>{requirements.length}</span>
      </button>

      {isOpen && (
        <div className={styles.requirementBody}>
          {requirements.length === 0 ? (
            <div className={styles.emptyMessage}>
              No requirements in this category.
            </div>
          ) : (
            requirements.map((requirement) => (
              <RequirementCard
                key={requirement.name}
                requirement={requirement}
                match={match}
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
}: {
  requirement: Requirement;
  match: Match;
}) {
  const matchClass = {
    strong: styles.matchStrong,
    partial: styles.matchPartial,
    missing: styles.matchMissing,
  }[match];

  return (
    <article className={styles.requirementItem}>
      <div className={styles.requirementItemHeader}>
        <div>
          <span className={styles.requirementItemTitle}>
            {requirement.name}
          </span>

          <span className={styles.importance}>{requirement.importance}</span>
        </div>

        <span className={`${styles.matchLabel} ${matchClass}`}>{match}</span>
      </div>

      {requirement.evidence.length > 0 && (
        <ul className={styles.evidence}>
          {requirement.evidence.map((evidence) => (
            <li key={evidence}>{evidence}</li>
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
      <div className={styles.resumeToolbar}>
        <SectionHeading
          title="Tailored Resume"
          description="Factual resume tailored to this opportunity."
        />

        <div className={styles.actions}>
          <button type="button" onClick={onEdit} className={styles.button}>
            <Win98Icon name="edit" />
            Edit
          </button>

          <button
            type="button"
            onClick={exportPdf}
            disabled={exporting !== null}
            className={styles.button}
          >
            <Win98Icon name="pdf" />
            {exporting === "pdf" ? "Generating..." : "Export PDF"}
          </button>

          <button
            type="button"
            onClick={exportDocx}
            disabled={exporting !== null}
            className={styles.button}
          >
            <Win98Icon name="docx" />
            {exporting === "docx" ? "Generating..." : "Export DOCX"}
          </button>
        </div>
      </div>

      {exportError && <p className={styles.errorBox}>{exportError}</p>}

      <div className={styles.previewFrame}>
        <ResumePreview resume={result.enhanced} />
      </div>
    </section>
  );
}

function GlossedView({ result }: { result: JobResult }) {
  return (
    <div>
      <div className={styles.resumeToolbar}>
        <SectionHeading
          title="Glossed Resume"
          description="Aggressive positioning for comparison. Review unsupported claims before use."
        />
      </div>

      <div className={styles.previewFrame}>
        <ResumePreview resume={result.glossed} />
      </div>

      <section className={styles.unsupported}>
        <SectionHeading
          title="Unsupported claims"
          description="Claims that are not fully supported by the master resume."
        />

        {result.glossed.unsupportedClaims.length === 0 ? (
          <div className={`${styles.sunken} ${styles.emptyMessage}`}>
            No unsupported claims were generated.
          </div>
        ) : (
          <div className={styles.unsupportedList}>
            {result.glossed.unsupportedClaims.map((item) => (
              <article key={item.claim} className={styles.unsupportedItem}>
                <p className={styles.unsupportedClaim}>{item.claim}</p>
                <p className={styles.unsupportedReason}>{item.reason}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDescription}>{description}</p>
    </div>
  );
}

function OverallMatch({ score }: { score: number }) {
  return (
    <div className={styles.overall}>
      <span className={styles.overallLabel}>Overall</span>
      <span className={styles.overallScore}>{score}%</span>
    </div>
  );
}

function PendingGeneration() {
  return (
    <div className={`${styles.sunken} ${styles.pending}`}>
      <strong>Resume not generated yet</strong>

      <p>
        Generate the analysis, tailored resume and glossed comparison using the
        local Codex integration.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={styles.status}>{status}</span>;
}
