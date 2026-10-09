"use client";

import { useState } from "react";

import { updateEnhancedResume } from "@/db/job-results";
import type { GeneratedJobPayload } from "@/schemas/job-result";

type Resume = GeneratedJobPayload["enhanced"];

type Props = {
  jobId: string;
  resume: Resume;
  onClose: () => void;
};

export function ResumeEditor({ jobId, resume, onClose }: Props) {
  const [draft, setDraft] = useState<Resume>(() => resume);

  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateEnhancedResume(jobId, draft);

      setMessage("Changes saved.");
    } catch (error) {
      console.error(error);

      setMessage("Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateSkill(
    index: number,
    patch: Partial<Resume["skills"][number]>,
  ) {
    setDraft((current) => {
      const skills = [...current.skills];

      skills[index] = {
        ...skills[index],
        ...patch,
      };

      return {
        ...current,
        skills,
      };
    });
  }

  function updateExperience(
    index: number,
    patch: Partial<Resume["experiences"][number]>,
  ) {
    setDraft((current) => {
      const experiences = [...current.experiences];

      experiences[index] = {
        ...experiences[index],
        ...patch,
      };

      return {
        ...current,
        experiences,
      };
    });
  }

  function updateEducation(
    index: number,
    patch: Partial<Resume["education"][number]>,
  ) {
    setDraft((current) => {
      const education = [...current.education];

      education[index] = {
        ...education[index],
        ...patch,
      };

      return {
        ...current,
        education,
      };
    });
  }

  function updateProject(
    index: number,
    patch: Partial<Resume["projects"][number]>,
  ) {
    setDraft((current) => {
      const projects = [...current.projects];

      projects[index] = {
        ...projects[index],
        ...patch,
      };

      return {
        ...current,
        projects,
      };
    });
  }

  function updateLanguage(
    index: number,
    patch: Partial<Resume["languages"][number]>,
  ) {
    setDraft((current) => {
      const languages = [...current.languages];

      languages[index] = {
        ...languages[index],
        ...patch,
      };

      return {
        ...current,
        languages,
      };
    });
  }

  return (
    <section className="bg-slate-900">
      <header className="flex items-start justify-between gap-5 border-b border-slate-800 px-6 py-5">
        <div>
          <h2 className="font-semibold text-slate-100">Edit tailored resume</h2>

          <p className="mt-1 text-sm text-slate-500">
            Adjust generated content before exporting.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="font-semibold text-sky-400 transition hover:text-sky-300 disabled:opacity-40"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="text-2xl leading-none text-slate-500 transition hover:text-slate-100"
          >
            ×
          </button>
        </div>
      </header>

      <div className="divide-y divide-slate-800">
        {message && (
          <div className="border-l-2 border-sky-500 px-6 py-4 text-sm text-slate-300">
            {message}
          </div>
        )}

        <EditorSection title="Profile">
          <Field label="Headline">
            <input
              value={draft.headline}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  headline: event.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Summary">
            <textarea
              value={draft.summary}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              rows={6}
              className={inputClass}
            />
          </Field>
        </EditorSection>

        <EditorSection title="Skills">
          <div className="divide-y divide-slate-800">
            {draft.skills.map((group, index) => (
              <div
                key={`${group.category}-${index}`}
                className="grid gap-5 py-5 first:pt-0 last:pb-0 md:grid-cols-[1fr_2fr]"
              >
                <Field label="Category">
                  <input
                    value={group.category}
                    onChange={(event) =>
                      updateSkill(index, {
                        category: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Items">
                  <textarea
                    value={group.items.join("\n")}
                    onChange={(event) =>
                      updateSkill(index, {
                        items: splitLines(event.target.value),
                      })
                    }
                    rows={5}
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Experience">
          <div className="divide-y divide-slate-800">
            {draft.experiences.map((experience, index) => (
              <div
                key={`${experience.company}-${experience.role}-${index}`}
                className="space-y-5 py-6 first:pt-0 last:pb-0"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Role">
                    <input
                      value={experience.role}
                      onChange={(event) =>
                        updateExperience(index, {
                          role: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Company">
                    <input
                      value={experience.company}
                      onChange={(event) =>
                        updateExperience(index, {
                          company: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Location">
                    <input
                      value={experience.location ?? ""}
                      onChange={(event) =>
                        updateExperience(index, {
                          location: emptyToNull(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Start date">
                    <input
                      value={experience.startDate}
                      onChange={(event) =>
                        updateExperience(index, {
                          startDate: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="End date">
                    <input
                      value={experience.endDate}
                      onChange={(event) =>
                        updateExperience(index, {
                          endDate: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Bullets">
                  <textarea
                    value={experience.bullets.join("\n")}
                    onChange={(event) =>
                      updateExperience(index, {
                        bullets: splitLines(event.target.value),
                      })
                    }
                    rows={7}
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Education">
          <div className="divide-y divide-slate-800">
            {draft.education.map((education, index) => (
              <div
                key={`${education.institution}-${education.degree}-${index}`}
                className="grid gap-5 py-6 first:pt-0 last:pb-0 md:grid-cols-2"
              >
                <Field label="Institution">
                  <input
                    value={education.institution}
                    onChange={(event) =>
                      updateEducation(index, {
                        institution: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Degree">
                  <input
                    value={education.degree}
                    onChange={(event) =>
                      updateEducation(index, {
                        degree: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Start date">
                  <input
                    value={education.startDate ?? ""}
                    onChange={(event) =>
                      updateEducation(index, {
                        startDate: emptyToNull(event.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="End date">
                  <input
                    value={education.endDate ?? ""}
                    onChange={(event) =>
                      updateEducation(index, {
                        endDate: emptyToNull(event.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Status">
                  <input
                    value={education.status ?? ""}
                    onChange={(event) =>
                      updateEducation(index, {
                        status: emptyToNull(event.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Projects">
          <div className="divide-y divide-slate-800">
            {draft.projects.map((project, index) => (
              <div
                key={`${project.name}-${index}`}
                className="space-y-5 py-6 first:pt-0 last:pb-0"
              >
                <Field label="Name">
                  <input
                    value={project.name}
                    onChange={(event) =>
                      updateProject(index, {
                        name: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={project.description}
                    onChange={(event) =>
                      updateProject(index, {
                        description: event.target.value,
                      })
                    }
                    rows={4}
                    className={inputClass}
                  />
                </Field>

                <Field label="Technologies">
                  <textarea
                    value={project.technologies.join("\n")}
                    onChange={(event) =>
                      updateProject(index, {
                        technologies: splitLines(event.target.value),
                      })
                    }
                    rows={4}
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Languages">
          <div className="divide-y divide-slate-800">
            {draft.languages.map((language, index) => (
              <div
                key={`${language.language}-${index}`}
                className="grid gap-5 py-5 first:pt-0 last:pb-0 md:grid-cols-2"
              >
                <Field label="Language">
                  <input
                    value={language.language}
                    onChange={(event) =>
                      updateLanguage(index, {
                        language: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Level">
                  <input
                    value={language.level}
                    onChange={(event) =>
                      updateLanguage(index, {
                        level: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        </EditorSection>
      </div>
    </section>
  );
}

function EditorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-7">
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyToNull(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}
