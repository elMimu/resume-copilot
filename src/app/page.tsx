"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/db/databse";

export default function HomePage() {
  const jobs = useLiveQuery(
    () => db.jobs.orderBy("createdAt").reverse().toArray(),
    [],
  );

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track jobs and tailored resumes locally.
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add job
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3">Role</th>
              <th className="p-3">Company</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {jobs?.map((job) => (
              <tr key={job.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{job.title}</td>
                <td className="p-3">{job.company}</td>
                <td className="p-3">{job.status}</td>
                <td className="p-3">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {jobs?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
