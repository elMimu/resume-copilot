"use client";

import { useState } from "react";

import { Win98Icon } from "@/components/win98-icon";
import { updateEnhancedResume } from "@/db/job-results";
import type { GeneratedJobPayload } from "@/schemas/job-result";
import styles from "@/styles/win98.module.css";

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
    <section className={styles.editor}>
      <header className={styles.editorHeader}>
        <div>
          <h2 className={styles.editorTitle}>Edit tailored resume</h2>

          <p className={styles.editorSubtitle}>
            Adjust generated content before exporting.
          </p>
        </div>

        <div className={styles.editorActions}>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            <Win98Icon name="save" />
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className={styles.button}
          >
            <Win98Icon name="close" />
          </button>
        </div>
      </header>

      <div className={styles.editorBody}>
        {message && <div className={styles.editorMessage}>{message}</div>}

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
              className={styles.input}
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
              className={styles.textarea}
            />
          </Field>
        </EditorSection>

        <EditorSection title="Skills">
          {draft.skills.map((group, index) => (
            <div
              key={`${group.category}-${index}`}
              className={styles.itemGroup}
            >
              <div className={styles.gridTwo}>
                <Field label="Category">
                  <input
                    value={group.category}
                    onChange={(event) =>
                      updateSkill(index, {
                        category: event.target.value,
                      })
                    }
                    className={styles.input}
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
                    className={styles.textarea}
                  />
                </Field>
              </div>
            </div>
          ))}
        </EditorSection>

        <EditorSection title="Experience">
          {draft.experiences.map((experience, index) => (
            <div
              key={`${experience.company}-${experience.role}-${index}`}
              className={styles.itemGroup}
            >
              <div className={styles.fields}>
                <div className={styles.gridTwo}>
                  <Field label="Role">
                    <input
                      value={experience.role}
                      onChange={(event) =>
                        updateExperience(index, {
                          role: event.target.value,
                        })
                      }
                      className={styles.input}
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
                      className={styles.input}
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
                      className={styles.input}
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
                      className={styles.input}
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
                      className={styles.input}
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
                    className={styles.textarea}
                  />
                </Field>
              </div>
            </div>
          ))}
        </EditorSection>

        <EditorSection title="Education">
          {draft.education.map((education, index) => (
            <div
              key={`${education.institution}-${education.degree}-${index}`}
              className={styles.itemGroup}
            >
              <div className={styles.gridTwo}>
                <Field label="Institution">
                  <input
                    value={education.institution}
                    onChange={(event) =>
                      updateEducation(index, {
                        institution: event.target.value,
                      })
                    }
                    className={styles.input}
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
                    className={styles.input}
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
                    className={styles.input}
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
                    className={styles.input}
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
                    className={styles.input}
                  />
                </Field>
              </div>
            </div>
          ))}
        </EditorSection>

        <EditorSection title="Projects">
          {draft.projects.map((project, index) => (
            <div key={`${project.name}-${index}`} className={styles.itemGroup}>
              <div className={styles.fields}>
                <Field label="Name">
                  <input
                    value={project.name}
                    onChange={(event) =>
                      updateProject(index, {
                        name: event.target.value,
                      })
                    }
                    className={styles.input}
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
                    className={styles.textarea}
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
                    className={styles.textarea}
                  />
                </Field>
              </div>
            </div>
          ))}
        </EditorSection>

        <EditorSection title="Languages">
          {draft.languages.map((language, index) => (
            <div
              key={`${language.language}-${index}`}
              className={styles.itemGroup}
            >
              <div className={styles.gridTwo}>
                <Field label="Language">
                  <input
                    value={language.language}
                    onChange={(event) =>
                      updateLanguage(index, {
                        language: event.target.value,
                      })
                    }
                    className={styles.input}
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
                    className={styles.input}
                  />
                </Field>
              </div>
            </div>
          ))}
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
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{title}</legend>

      <div className={styles.fields}>{children}</div>
    </fieldset>
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
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

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
