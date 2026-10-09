"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Win98Icon } from "@/components/win98-icon";

import { createJob } from "@/db/jobs";

import type { ResumeLanguage } from "@/schemas/job";

import styles from "@/styles/win98.module.css";

export default function NewJobPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");

  const [title, setTitle] = useState("");

  const [url, setUrl] = useState("");

  const [description, setDescription] = useState("");

  const [resumeLanguage, setResumeLanguage] = useState<ResumeLanguage>("en");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    setError(null);

    try {
      await createJob({
        company,
        title,
        url,
        description,
        resumeLanguage,
      });

      router.push("/");
    } catch (error) {
      console.error(error);

      setError("Could not add the job. Check the provided information.");

      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.shell}>
      <div className={styles.desktop}>
        <div className={styles.window}>
          <div className={styles.titleBar}>
            <Win98Icon name="app" />
            Resume Copilot — Add Job
          </div>

          <div className={styles.windowBody}>
            <Link href="/" className={styles.backLink}>
              <Win98Icon name="back" />
              Applications
            </Link>

            <header className="mb-4 px-2 py-2">
              <h1 className="m-0 text-[22px] font-bold leading-tight">
                Add job
              </h1>

              <p className="mt-1 text-[#404040]">
                Add an opportunity and automatically generate its tailored
                resumes.
              </p>
            </header>

            <form onSubmit={handleSubmit} className={styles.editor}>
              <div className={styles.editorHeader}>
                <div>
                  <h2 className={styles.editorTitle}>Job information</h2>

                  <p className={styles.editorSubtitle}>
                    The resume will be generated after the job is added.
                  </p>
                </div>
              </div>

              <div className={styles.editorBody}>
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Opportunity</legend>

                  <div className={styles.fields}>
                    <div className={styles.gridTwo}>
                      <Field label="Company" htmlFor="company">
                        <input
                          id="company"
                          value={company}
                          onChange={(event) => setCompany(event.target.value)}
                          required
                          className={styles.input}
                        />
                      </Field>

                      <Field label="Role" htmlFor="title">
                        <input
                          id="title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          required
                          className={styles.input}
                        />
                      </Field>
                    </div>

                    <Field label="Job URL" htmlFor="url">
                      <input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        className={styles.input}
                      />
                    </Field>

                    <Field label="Resume language" htmlFor="resume-language">
                      <select
                        id="resume-language"
                        value={resumeLanguage}
                        onChange={(event) =>
                          setResumeLanguage(
                            event.target.value as ResumeLanguage,
                          )
                        }
                        className={styles.input}
                      >
                        <option value="en">English</option>

                        <option value="pt-BR">Português</option>
                      </select>
                    </Field>

                    <Field label="Job description" htmlFor="description">
                      <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        required
                        rows={16}
                        className={styles.textarea}
                      />
                    </Field>
                  </div>
                </fieldset>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.actions}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${styles.button} ${styles.primaryButton}`}
                  >
                    <Win98Icon name="document" />

                    {isSubmitting ? "Adding..." : "Add job"}
                  </button>

                  <Link href="/" className={styles.button}>
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;

  htmlFor: string;

  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>

      {children}
    </label>
  );
}
