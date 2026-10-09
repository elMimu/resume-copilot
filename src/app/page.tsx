"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useLiveQuery } from "dexie-react-hooks";

import { Win98Icon } from "@/components/win98-icon";

import { db } from "@/db/database";

import { deleteJob } from "@/db/jobs";

import type { Job } from "@/schemas/job";

import styles from "@/styles/win98.module.css";
import { processQueuedJob } from "./lib/job-generation";

const COMPLETION_TICK_MS = 3000;

export default function HomePage() {
  const jobs = useLiveQuery(
    () => db.jobs.orderBy("createdAt").reverse().toArray(),

    [],
  );

  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        setClock(Date.now());
      },

      500,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!jobs) {
      return;
    }

    const alreadyProcessing = jobs.some(
      (job) => job.generationStatus === "processing",
    );

    if (alreadyProcessing) {
      return;
    }

    const nextJob = jobs.find((job) => job.generationStatus === "queued");

    if (!nextJob) {
      return;
    }

    void processQueuedJob(nextJob.id);
  }, [jobs]);

  async function handleDelete(job: Job) {
    if (isGenerationPending(job)) {
      return;
    }

    const confirmed = window.confirm(`Delete "${job.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteJob(job.id);
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error ? error.message : "Could not delete the job.",
      );
    }
  }

  return (
    <main className={styles.shell}>
      <div className={styles.desktop}>
        <div className={styles.window}>
          <div className={styles.titleBar}>
            <Win98Icon name="app" />
            Resume Copilot
          </div>

          <div className={styles.windowBody}>
            <header className="flex items-end justify-between gap-6 px-2 py-3">
              <div>
                <h1 className="m-0 text-[22px] font-bold leading-tight">
                  Applications
                </h1>

                <p className="mt-1 text-[#404040]">
                  Track jobs and tailored resumes locally.
                </p>
              </div>

              <Link href="/jobs/new" className={styles.button}>
                <span className="text-base font-bold leading-none">+</span>
                Add job
              </Link>
            </header>

            <section className="mt-3">
              <div className="flex items-center justify-between border-b border-[#808080] bg-[#b4c3dc] px-3 py-2">
                <strong>Job applications</strong>

                <Link
                  href="/master-resume"
                  className="inline-flex items-center gap-1.5 font-bold text-[#000080] no-underline hover:underline"
                >
                  <Win98Icon name="resume" />
                  Master Resume
                </Link>
              </div>

              <div className={styles.sunken}>
                <table className="w-full border-collapse bg-white text-left">
                  <thead>
                    <tr className="bg-[#c0c0c0]">
                      <TableHeader>Role</TableHeader>

                      <TableHeader>Company</TableHeader>

                      <TableHeader>Created</TableHeader>

                      <th
                        aria-label="Actions"
                        className="w-24 border-b border-l border-[#808080] px-2 py-2"
                      />
                    </tr>
                  </thead>

                  <tbody>
                    {jobs?.map((job) => {
                      const pending = isGenerationPending(job);

                      const showTick = shouldShowCompletionTick(job, clock);

                      const hasError = job.generationStatus === "error";

                      return (
                        <tr
                          key={job.id}
                          className={[
                            "group border-b border-[#c0c0c0] last:border-b-0",

                            pending
                              ? "bg-[#f0f0f0] text-[#707070]"
                              : "hover:bg-[#000080] hover:text-white",
                          ].join(" ")}
                        >
                          <td className="px-3 py-2">
                            {pending ? (
                              <span className="inline-flex items-center gap-2 font-bold">
                                <Win98Icon name="document" />

                                {job.title}
                              </span>
                            ) : (
                              <Link
                                href={`/jobs/${job.id}`}
                                className="inline-flex items-center gap-2 font-bold text-[#000080] group-hover:text-white group-hover:underline"
                              >
                                <Win98Icon name="document" />

                                {job.title}
                              </Link>
                            )}
                          </td>

                          <td className="px-3 py-2">{job.company}</td>

                          <td className="whitespace-nowrap px-3 py-2">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>

                          <td className="w-24 px-2 py-1">
                            <div className="flex items-center justify-end gap-2">
                              {pending && (
                                <ProcessingIndicator
                                  status={job.generationStatus}
                                />
                              )}

                              {showTick && (
                                <span
                                  title="Resume generated"
                                  aria-label="Resume generated"
                                  className="inline-flex h-6 w-6 items-center justify-center font-bold text-[#008000]"
                                >
                                  ✓
                                </span>
                              )}

                              {hasError && (
                                <span
                                  title={
                                    job.generationError ??
                                    "Resume generation failed."
                                  }
                                  aria-label="Resume generation failed"
                                  className="inline-flex h-6 w-6 items-center justify-center font-bold text-[#a00000]"
                                >
                                  !
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDelete(job)}
                                disabled={pending}
                                aria-label={`Delete ${job.title}`}
                                title={
                                  pending
                                    ? "Wait for resume generation to finish"
                                    : "Delete"
                                }
                                className={[
                                  "inline-flex h-6 w-6 items-center justify-center bg-[#c0c0c0] text-black",

                                  pending
                                    ? "cursor-not-allowed opacity-50"
                                    : "",
                                ].join(" ")}
                                style={{
                                  borderTop: "2px solid #ffffff",

                                  borderLeft: "2px solid #ffffff",

                                  borderRight: "2px solid #000000",

                                  borderBottom: "2px solid #000000",
                                }}
                              >
                                <Win98Icon name="close" size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {jobs?.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-12 text-center text-[#606060]"
                        >
                          No jobs yet.
                        </td>
                      </tr>
                    )}

                    {jobs === undefined && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-12 text-center text-[#606060]"
                        >
                          Loading...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 flex justify-between border border-[#808080] bg-[#c0c0c0] px-2 py-1 text-[11px]">
                <span>
                  {jobs?.length ?? 0} application
                  {jobs?.length === 1 ? "" : "s"}
                </span>

                <span>Local database</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProcessingIndicator({ status }: { status: Job["generationStatus"] }) {
  return (
    <span
      title={
        status === "queued" ? "Waiting to generate resume" : "Generating resume"
      }
      aria-label={
        status === "queued" ? "Waiting to generate resume" : "Generating resume"
      }
      className="inline-flex h-6 w-6 items-center justify-center"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#808080] border-t-[#000080]" />
    </span>
  );
}

function isGenerationPending(job: Job) {
  return (
    job.generationStatus === "queued" || job.generationStatus === "processing"
  );
}

function shouldShowCompletionTick(job: Job, clock: number) {
  if (job.generationStatus !== "ready" || !job.generationCompletedAt) {
    return false;
  }

  const completedAt = new Date(job.generationCompletedAt).getTime();

  if (Number.isNaN(completedAt)) {
    return false;
  }

  return clock - completedAt < COMPLETION_TICK_MS;
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="border-b border-r border-[#808080] px-3 py-2 font-bold"
      style={{
        boxShadow: "inset 1px 1px #ffffff, inset -1px -1px #808080",
      }}
    >
      {children}
    </th>
  );
}
