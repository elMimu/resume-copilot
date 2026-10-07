"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createJob } from "@/db/jobs";

export default function NewJobPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await createJob({
        company,
        title,
        url,
        description,
      });

      router.push("/");
    } catch {
      setError("Could not save the job. Check the provided information.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Add job</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium">
            Company
          </label>
          <input
            id="company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="mt-2 w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Role
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium">
            Job URL
          </label>
          <input
            id="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Job description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={14}
            className="mt-2 w-full rounded border p-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save job
        </button>
      </form>
    </main>
  );
}
