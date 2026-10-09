"use client";

import Link from "next/link";

import { useLiveQuery } from "dexie-react-hooks";

import { Win98Icon } from "@/components/win98-icon";
import { db } from "@/db/databse";
import { deleteJob } from "@/db/jobs";
import styles from "@/styles/win98.module.css";

export default function HomePage() {
  const jobs = useLiveQuery(
    () => db.jobs.orderBy("createdAt").reverse().toArray(),
    [],
  );

  async function handleDelete(jobId: string, jobTitle: string) {
    const confirmed = window.confirm(`Delete "${jobTitle}"?`);

    if (!confirmed) {
      return;
    }

    await deleteJob(jobId);
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
                        className="w-10 border-b border-l border-[#808080] px-2 py-2"
                      />
                    </tr>
                  </thead>

                  <tbody>
                    {jobs?.map((job) => (
                      <tr
                        key={job.id}
                        className="group border-b border-[#c0c0c0] last:border-b-0 hover:bg-[#000080] hover:text-white"
                      >
                        <td className="px-3 py-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center gap-2 font-bold text-[#000080] group-hover:text-white group-hover:underline"
                          >
                            <Win98Icon name="document" />

                            {job.title}
                          </Link>
                        </td>

                        <td className="px-3 py-2">{job.company}</td>

                        <td className="whitespace-nowrap px-3 py-2">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>

                        <td className="w-10 px-2 py-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(job.id, job.title)}
                            aria-label={`Delete ${job.title}`}
                            title="Delete"
                            className="inline-flex h-6 w-6 items-center justify-center bg-[#c0c0c0] text-black"
                            style={{
                              borderTop: "2px solid #ffffff",
                              borderLeft: "2px solid #ffffff",
                              borderRight: "2px solid #000000",
                              borderBottom: "2px solid #000000",
                            }}
                          >
                            <Win98Icon name="close" size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}

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
