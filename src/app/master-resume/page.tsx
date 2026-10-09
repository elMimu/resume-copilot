"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Win98Icon } from "@/components/win98-icon";
import type {
  MasterAchievement,
  MasterEducation,
  MasterProject,
  MasterResume,
  MasterSkill,
  MasterWork,
} from "@/schemas/master-resume";
import styles from "@/styles/win98.module.css";

type MasterResumeSource = "master" | "example";

type ApiResponse = {
  resume?: MasterResume;
  source?: MasterResumeSource;
  error?: string;
};

export default function MasterResumePage() {
  const [resume, setResume] = useState<MasterResume | null>(null);

  const [source, setSource] = useState<MasterResumeSource | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadResume() {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const response = await fetch("/api/master-resume");

        const data = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load the master resume.");
        }

        if (!data.resume || !data.source) {
          throw new Error("Master resume response is incomplete.");
        }

        setResume(data.resume);
        setSource(data.source);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load the master resume.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadResume();
  }, []);

  async function saveResume() {
    if (!resume) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/master-resume", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(resume),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save the master resume.");
      }

      if (!data.resume) {
        throw new Error("Master resume response is incomplete.");
      }

      setResume(data.resume);
      setSource("master");

      setMessage("Master resume saved.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save the master resume.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.shell}>
        <div className={styles.desktop}>
          <div className={styles.window}>
            <div className={styles.titleBar}>
              <Win98Icon name="app" />
              Resume Copilot — Master Resume
            </div>

            <div className={styles.windowBody}>Loading master resume...</div>
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
            Resume Copilot — Master Resume
          </div>

          <div className={styles.windowBody}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <Link href="/" className={styles.backLink}>
                <Win98Icon name="back" />
                Applications
              </Link>

              {resume && (
                <button
                  type="button"
                  onClick={saveResume}
                  disabled={isSaving}
                  className={`${styles.button} ${styles.primaryButton}`}
                >
                  <Win98Icon name="save" />

                  {isSaving ? "Saving..." : "Save master resume"}
                </button>
              )}
            </div>

            <header className="mb-4 px-2 py-2">
              <h1 className="m-0 text-[22px] font-bold leading-tight">
                Master Resume
              </h1>

              <p className="mt-1 text-[#404040]">
                Central factual source used when tailoring resumes.
              </p>
            </header>

            {error && <div className={styles.errorBox}>{error}</div>}

            {message && <div className={styles.editorMessage}>{message}</div>}

            {resume && (
              <>
                <SourceNotice source={source} />

                <div className="mt-4 space-y-4">
                  <BasicsEditor resume={resume} onChange={setResume} />

                  <CareerEditor resume={resume} onChange={setResume} />

                  <ExperienceEditor resume={resume} onChange={setResume} />

                  <EducationEditor resume={resume} onChange={setResume} />

                  <ProjectsEditor resume={resume} onChange={setResume} />

                  <SkillsEditor resume={resume} onChange={setResume} />

                  <ComputerScienceEditor resume={resume} onChange={setResume} />

                  <LanguagesEditor resume={resume} onChange={setResume} />

                  <AwardsEditor resume={resume} onChange={setResume} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SourceNotice({ source }: { source: MasterResumeSource | null }) {
  if (source === "master") {
    return (
      <div className={`${styles.sunken} px-3 py-2`}>
        <strong>Source:</strong> data/master-resume.json
      </div>
    );
  }

  if (source === "example") {
    return (
      <div className={`${styles.sunken} px-3 py-2`}>
        <strong>No local master resume found.</strong>

        <p className="mt-1 mb-0">
          The empty example template is being used. Saving will create
          data/master-resume.json.
        </p>
      </div>
    );
  }

  return null;
}

function BasicsEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateBasics(patch: Partial<MasterResume["basics"]>) {
    onChange({
      ...resume,

      basics: {
        ...resume.basics,
        ...patch,
      },
    });
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Personal information"
        subtitle="Basic factual information shared across generated resumes."
      />

      <div className={styles.editorBody}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Basics</legend>

          <div className={styles.fields}>
            <div className={styles.gridTwo}>
              <Field label="Name">
                <input
                  value={resume.basics.name}
                  onChange={(event) =>
                    updateBasics({
                      name: event.target.value,
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="Professional label">
                <input
                  value={resume.basics.label}
                  onChange={(event) =>
                    updateBasics({
                      label: event.target.value,
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={resume.basics.email}
                  onChange={(event) =>
                    updateBasics({
                      email: event.target.value,
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="Phone">
                <input
                  value={resume.basics.phone ?? ""}
                  onChange={(event) =>
                    updateBasics({
                      phone: emptyToNull(event.target.value),
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="Location">
                <input
                  value={resume.basics.location}
                  onChange={(event) =>
                    updateBasics({
                      location: event.target.value,
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="LinkedIn">
                <input
                  value={resume.basics.linkedin ?? ""}
                  onChange={(event) =>
                    updateBasics({
                      linkedin: emptyToNull(event.target.value),
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="GitHub">
                <input
                  value={resume.basics.github ?? ""}
                  onChange={(event) =>
                    updateBasics({
                      github: emptyToNull(event.target.value),
                    })
                  }
                  className={styles.input}
                />
              </Field>

              <Field label="Portfolio">
                <input
                  value={resume.basics.portfolio ?? ""}
                  onChange={(event) =>
                    updateBasics({
                      portfolio: emptyToNull(event.target.value),
                    })
                  }
                  className={styles.input}
                />
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Summary</legend>

          <Field label="Professional summary">
            <textarea
              value={resume.basics.summary}
              onChange={(event) =>
                updateBasics({
                  summary: event.target.value,
                })
              }
              rows={8}
              className={styles.textarea}
            />
          </Field>
        </fieldset>
      </div>
    </section>
  );
}

function CareerEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateCareer(patch: Partial<MasterResume["career"]>) {
    onChange({
      ...resume,

      career: {
        ...resume.career,
        ...patch,
      },
    });
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Career"
        subtitle="Professional direction and areas of interest."
      />

      <div className={styles.editorBody}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Career</legend>

          <div className={styles.fields}>
            <Field label="Objective">
              <textarea
                value={resume.career.objective}
                onChange={(event) =>
                  updateCareer({
                    objective: event.target.value,
                  })
                }
                rows={4}
                className={styles.textarea}
              />
            </Field>

            <StringListEditor
              title="Target roles"
              items={resume.career.targetRoles}
              addLabel="Add target role"
              onChange={(items) =>
                updateCareer({
                  targetRoles: items,
                })
              }
            />

            <StringListEditor
              title="Interests"
              items={resume.career.interests}
              addLabel="Add interest"
              onChange={(items) =>
                updateCareer({
                  interests: items,
                })
              }
            />
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function ExperienceEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateWork(work: MasterWork[]) {
    onChange({
      ...resume,
      work,
    });
  }

  function addExperience() {
    updateWork([
      ...resume.work,
      {
        id: crypto.randomUUID(),
        company: "",
        role: "",
        location: null,
        startDate: null,
        endDate: null,
        summary: "",
        technologies: [],
        skills: [],
        achievements: [],
        responsibilities: [],
      },
    ]);
  }

  function updateExperience(index: number, patch: Partial<MasterWork>) {
    updateWork(
      resume.work.map((experience, currentIndex) =>
        currentIndex === index
          ? {
            ...experience,
            ...patch,
          }
          : experience,
      ),
    );
  }

  function removeExperience(index: number) {
    const experience = resume.work[index];

    const label = experience?.company || experience?.role || "this experience";

    const confirmed = window.confirm(`Remove "${label}"?`);

    if (!confirmed) {
      return;
    }

    updateWork(resume.work.filter((_, currentIndex) => currentIndex !== index));
  }

  function updateAchievements(
    experienceIndex: number,
    achievements: MasterAchievement[],
  ) {
    updateExperience(experienceIndex, {
      achievements,
    });
  }

  function addAchievement(experienceIndex: number) {
    const experience = resume.work[experienceIndex];

    if (!experience) {
      return;
    }

    updateAchievements(experienceIndex, [
      ...experience.achievements,
      {
        id: crypto.randomUUID(),
        text: "",
        technologies: [],
        skills: [],
        evidenceStrength: "strong",
      },
    ]);
  }

  function updateAchievement(
    experienceIndex: number,
    achievementIndex: number,
    patch: Partial<MasterAchievement>,
  ) {
    const experience = resume.work[experienceIndex];

    if (!experience) {
      return;
    }

    updateAchievements(
      experienceIndex,
      experience.achievements.map((achievement, currentIndex) =>
        currentIndex === achievementIndex
          ? {
            ...achievement,
            ...patch,
          }
          : achievement,
      ),
    );
  }

  function removeAchievement(
    experienceIndex: number,
    achievementIndex: number,
  ) {
    const experience = resume.work[experienceIndex];

    if (!experience) {
      return;
    }

    updateAchievements(
      experienceIndex,
      experience.achievements.filter(
        (_, currentIndex) => currentIndex !== achievementIndex,
      ),
    );
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Professional Experience"
        subtitle="Professional roles, responsibilities, technologies and evidence-backed achievements."
      />

      <div className={styles.editorBody}>
        {resume.work.length === 0 && (
          <div className={`${styles.sunken} mb-3 px-3 py-4`}>
            No professional experience entries yet.
          </div>
        )}

        {resume.work.map((experience, index) => (
          <fieldset key={experience.id} className={styles.fieldset}>
            <legend className={styles.legend}>
              {experience.role ||
                experience.company ||
                `Experience ${index + 1}`}
            </legend>

            <div className={styles.fields}>
              <div className={styles.gridTwo}>
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

                <Field label="ID">
                  <input
                    value={experience.id}
                    onChange={(event) =>
                      updateExperience(index, {
                        id: event.target.value,
                      })
                    }
                    className={styles.input}
                  />
                </Field>

                <Field label="Start date">
                  <input
                    value={experience.startDate ?? ""}
                    onChange={(event) =>
                      updateExperience(index, {
                        startDate: emptyToNull(event.target.value),
                      })
                    }
                    className={styles.input}
                  />
                </Field>

                <Field label="End date">
                  <input
                    value={experience.endDate ?? ""}
                    onChange={(event) =>
                      updateExperience(index, {
                        endDate: emptyToNull(event.target.value),
                      })
                    }
                    className={styles.input}
                  />
                </Field>
              </div>

              <Field label="Summary">
                <textarea
                  value={experience.summary}
                  onChange={(event) =>
                    updateExperience(index, {
                      summary: event.target.value,
                    })
                  }
                  rows={5}
                  className={styles.textarea}
                />
              </Field>

              <StringListEditor
                title="Technologies"
                items={experience.technologies}
                addLabel="Add technology"
                onChange={(technologies) =>
                  updateExperience(index, {
                    technologies,
                  })
                }
              />

              <StringListEditor
                title="Skills"
                items={experience.skills}
                addLabel="Add skill"
                onChange={(skills) =>
                  updateExperience(index, {
                    skills,
                  })
                }
              />

              <StringListEditor
                title="Responsibilities"
                items={experience.responsibilities}
                addLabel="Add responsibility"
                onChange={(responsibilities) =>
                  updateExperience(index, {
                    responsibilities,
                  })
                }
              />

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Achievements</legend>

                <div className={styles.fields}>
                  {experience.achievements.length === 0 && (
                    <div className={`${styles.sunken} px-3 py-3`}>
                      No achievements yet.
                    </div>
                  )}

                  {experience.achievements.map(
                    (achievement, achievementIndex) => (
                      <div key={achievement.id} className={styles.itemGroup}>
                        <div className={styles.fields}>
                          <Field label={`Achievement ${achievementIndex + 1}`}>
                            <textarea
                              value={achievement.text}
                              onChange={(event) =>
                                updateAchievement(index, achievementIndex, {
                                  text: event.target.value,
                                })
                              }
                              rows={4}
                              className={styles.textarea}
                            />
                          </Field>

                          <div className={styles.gridTwo}>
                            <Field label="Evidence strength">
                              <select
                                value={achievement.evidenceStrength}
                                onChange={(event) =>
                                  updateAchievement(index, achievementIndex, {
                                    evidenceStrength: event.target
                                      .value as MasterAchievement["evidenceStrength"],
                                  })
                                }
                                className={styles.input}
                              >
                                <option value="strong">Strong</option>

                                <option value="partial">Partial</option>

                                <option value="weak">Weak</option>
                              </select>
                            </Field>

                            <Field label="Achievement ID">
                              <input
                                value={achievement.id}
                                onChange={(event) =>
                                  updateAchievement(index, achievementIndex, {
                                    id: event.target.value,
                                  })
                                }
                                className={styles.input}
                              />
                            </Field>
                          </div>

                          <StringListEditor
                            title="Technologies"
                            items={achievement.technologies}
                            addLabel="Add technology"
                            onChange={(technologies) =>
                              updateAchievement(index, achievementIndex, {
                                technologies,
                              })
                            }
                          />

                          <StringListEditor
                            title="Skills"
                            items={achievement.skills}
                            addLabel="Add skill"
                            onChange={(skills) =>
                              updateAchievement(index, achievementIndex, {
                                skills,
                              })
                            }
                          />

                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                removeAchievement(index, achievementIndex)
                              }
                              className={styles.button}
                            >
                              <Win98Icon name="close" size={12} />
                              Remove achievement
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => addAchievement(index)}
                      className={styles.button}
                    >
                      + Add achievement
                    </button>
                  </div>
                </div>
              </fieldset>

              <div>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className={styles.button}
                >
                  <Win98Icon name="close" size={12} />
                  Remove experience
                </button>
              </div>
            </div>
          </fieldset>
        ))}

        <button
          type="button"
          onClick={addExperience}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          + Add experience
        </button>
      </div>
    </section>
  );
}

function EducationEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateEducation(education: MasterEducation[]) {
    onChange({
      ...resume,
      education,
    });
  }

  function addEducation() {
    updateEducation([
      ...resume.education,
      {
        institution: "",
        degree: "",
        startDate: null,
        endDate: null,
        details: [],
      },
    ]);
  }

  function updateEducationEntry(
    index: number,
    patch: Partial<MasterEducation>,
  ) {
    updateEducation(
      resume.education.map((education, currentIndex) =>
        currentIndex === index
          ? {
            ...education,
            ...patch,
          }
          : education,
      ),
    );
  }

  function removeEducation(index: number) {
    const education = resume.education[index];

    const label =
      education?.institution || education?.degree || "this education entry";

    const confirmed = window.confirm(`Remove ${label}?`);

    if (!confirmed) {
      return;
    }

    updateEducation(
      resume.education.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Education"
        subtitle="Academic background and relevant education details."
      />

      <div className={styles.editorBody}>
        {resume.education.length === 0 && (
          <div className={`${styles.sunken} mb-3 px-3 py-4`}>
            No education entries yet.
          </div>
        )}

        {resume.education.map((education, index) => (
          <fieldset key={index} className={styles.fieldset}>
            <legend className={styles.legend}>Education {index + 1}</legend>

            <div className={styles.fields}>
              <div className={styles.gridTwo}>
                <Field label="Institution">
                  <input
                    value={education.institution}
                    onChange={(event) =>
                      updateEducationEntry(index, {
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
                      updateEducationEntry(index, {
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
                      updateEducationEntry(index, {
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
                      updateEducationEntry(index, {
                        endDate: emptyToNull(event.target.value),
                      })
                    }
                    className={styles.input}
                  />
                </Field>
              </div>

              <StringListEditor
                title="Details"
                items={education.details}
                addLabel="Add detail"
                onChange={(details) =>
                  updateEducationEntry(index, {
                    details,
                  })
                }
              />

              <div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className={styles.button}
                >
                  <Win98Icon name="close" size={12} />
                  Remove education
                </button>
              </div>
            </div>
          </fieldset>
        ))}

        <button
          type="button"
          onClick={addEducation}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          + Add education
        </button>
      </div>
    </section>
  );
}

function ProjectsEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateProjects(projects: MasterProject[]) {
    onChange({
      ...resume,
      projects,
    });
  }

  function addProject() {
    updateProjects([
      ...resume.projects,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        technologies: [],
        skills: [],
        highlights: [],
      },
    ]);
  }

  function updateProject(index: number, patch: Partial<MasterProject>) {
    updateProjects(
      resume.projects.map((project, currentIndex) =>
        currentIndex === index
          ? {
            ...project,
            ...patch,
          }
          : project,
      ),
    );
  }

  function removeProject(index: number) {
    const project = resume.projects[index];

    const label = project?.name || "this project";

    const confirmed = window.confirm(`Remove "${label}"?`);

    if (!confirmed) {
      return;
    }

    updateProjects(
      resume.projects.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Projects"
        subtitle="Projects, technologies, skills and notable highlights."
      />

      <div className={styles.editorBody}>
        {resume.projects.length === 0 && (
          <div className={`${styles.sunken} mb-3 px-3 py-4`}>
            No projects yet.
          </div>
        )}

        {resume.projects.map((project, index) => (
          <fieldset key={project.id} className={styles.fieldset}>
            <legend className={styles.legend}>
              {project.name || `Project ${index + 1}`}
            </legend>

            <div className={styles.fields}>
              <div className={styles.gridTwo}>
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

                <Field label="ID">
                  <input
                    value={project.id}
                    onChange={(event) =>
                      updateProject(index, {
                        id: event.target.value,
                      })
                    }
                    className={styles.input}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={project.description}
                  onChange={(event) =>
                    updateProject(index, {
                      description: event.target.value,
                    })
                  }
                  rows={5}
                  className={styles.textarea}
                />
              </Field>

              <StringListEditor
                title="Technologies"
                items={project.technologies}
                addLabel="Add technology"
                onChange={(technologies) =>
                  updateProject(index, {
                    technologies,
                  })
                }
              />

              <StringListEditor
                title="Skills"
                items={project.skills}
                addLabel="Add skill"
                onChange={(skills) =>
                  updateProject(index, {
                    skills,
                  })
                }
              />

              <StringListEditor
                title="Highlights"
                items={project.highlights}
                addLabel="Add highlight"
                onChange={(highlights) =>
                  updateProject(index, {
                    highlights,
                  })
                }
              />

              <div>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className={styles.button}
                >
                  <Win98Icon name="close" size={12} />
                  Remove project
                </button>
              </div>
            </div>
          </fieldset>
        ))}

        <button
          type="button"
          onClick={addProject}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          + Add project
        </button>
      </div>
    </section>
  );
}

function SkillsEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  const categories = useMemo(
    () => Array.from(new Set(resume.skills.map((skill) => skill.category))),
    [resume.skills],
  );

  function updateSkills(skills: MasterSkill[]) {
    onChange({
      ...resume,
      skills,
    });
  }

  function addCategory() {
    const category = window.prompt("Category name:");

    if (!category?.trim()) {
      return;
    }

    const normalized = category.trim();

    if (categories.includes(normalized)) {
      return;
    }

    updateSkills([
      ...resume.skills,
      {
        name: "",
        category: normalized,
        evidence: [],
      },
    ]);
  }

  function addSkill(category: string) {
    updateSkills([
      ...resume.skills,
      {
        name: "",
        category,
        evidence: [],
      },
    ]);
  }

  function updateSkill(index: number, patch: Partial<MasterSkill>) {
    updateSkills(
      resume.skills.map((skill, currentIndex) =>
        currentIndex === index
          ? {
            ...skill,
            ...patch,
          }
          : skill,
      ),
    );
  }

  function removeSkill(index: number) {
    updateSkills(
      resume.skills.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function removeCategory(category: string) {
    const hasSkills = resume.skills.some(
      (skill) => skill.category === category && skill.name.trim(),
    );

    if (hasSkills) {
      const confirmed = window.confirm(
        `Remove category "${category}" and all skills inside it?`,
      );

      if (!confirmed) {
        return;
      }
    }

    updateSkills(resume.skills.filter((skill) => skill.category !== category));
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Skills"
        subtitle="Manage skill categories, individual skills and their evidence references."
      />

      <div className={styles.editorBody}>
        {categories.length === 0 && (
          <div className={`${styles.sunken} mb-3 px-3 py-4`}>
            No skill categories yet.
          </div>
        )}

        {categories.map((category) => {
          const categorySkills = resume.skills
            .map((skill, index) => ({
              skill,
              index,
            }))
            .filter(({ skill }) => skill.category === category);

          return (
            <fieldset key={category} className={styles.fieldset}>
              <legend className={styles.legend}>{category}</legend>

              <div className={styles.fields}>
                {categorySkills.map(({ skill, index }) => (
                  <div
                    key={`${category}-${index}`}
                    className={styles.itemGroup}
                  >
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Field label="Skill">
                          <input
                            value={skill.name}
                            onChange={(event) =>
                              updateSkill(index, {
                                name: event.target.value,
                              })
                            }
                            className={styles.input}
                          />
                        </Field>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className={styles.button}
                        aria-label={`Remove ${skill.name || "skill"}`}
                      >
                        <Win98Icon name="close" size={12} />
                      </button>
                    </div>

                    <Field label="Evidence IDs">
                      <textarea
                        value={skill.evidence.join("\n")}
                        onChange={(event) =>
                          updateSkill(index, {
                            evidence: splitLines(event.target.value),
                          })
                        }
                        rows={3}
                        className={styles.textarea}
                      />
                    </Field>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addSkill(category)}
                    className={styles.button}
                  >
                    + Add skill
                  </button>

                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className={styles.button}
                  >
                    Remove category
                  </button>
                </div>
              </div>
            </fieldset>
          );
        })}

        <button
          type="button"
          onClick={addCategory}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          + Add category
        </button>
      </div>
    </section>
  );
}

function ComputerScienceEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateFundamentals(fundamentals: string[]) {
    onChange({
      ...resume,

      computerScience: {
        ...resume.computerScience,
        fundamentals,
      },
    });
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Computer Science"
        subtitle="Fundamental computer science knowledge that can support technical matching."
      />

      <div className={styles.editorBody}>
        <StringListEditor
          title="Fundamentals"
          items={resume.computerScience.fundamentals}
          addLabel="Add fundamental"
          onChange={updateFundamentals}
        />
      </div>
    </section>
  );
}

function LanguagesEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateLanguages(languages: MasterResume["languages"]) {
    onChange({
      ...resume,
      languages,
    });
  }

  function addLanguage() {
    updateLanguages([
      ...resume.languages,
      {
        language: "",
        level: "",
      },
    ]);
  }

  function removeLanguage(index: number) {
    updateLanguages(
      resume.languages.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function updateLanguage(
    index: number,
    patch: Partial<MasterResume["languages"][number]>,
  ) {
    updateLanguages(
      resume.languages.map((language, currentIndex) =>
        currentIndex === index
          ? {
            ...language,
            ...patch,
          }
          : language,
      ),
    );
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Languages"
        subtitle="Languages and proficiency levels."
      />

      <div className={styles.editorBody}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Languages</legend>

          <div className={styles.fields}>
            {resume.languages.length === 0 && (
              <div className={`${styles.sunken} px-3 py-4`}>
                No languages yet.
              </div>
            )}

            {resume.languages.map((language, index) => (
              <div key={index} className={styles.itemGroup}>
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
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

                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className={styles.button}
                    aria-label="Remove language"
                  >
                    <Win98Icon name="close" size={12} />
                  </button>
                </div>
              </div>
            ))}

            <div>
              <button
                type="button"
                onClick={addLanguage}
                className={styles.button}
              >
                + Add language
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function AwardsEditor({
  resume,
  onChange,
}: {
  resume: MasterResume;
  onChange: (resume: MasterResume) => void;
}) {
  function updateAwards(awards: string[]) {
    onChange({
      ...resume,
      awards,
    });
  }

  return (
    <section className={styles.editor}>
      <EditorHeader
        title="Awards"
        subtitle="Awards, competitions and professional recognitions."
      />

      <div className={styles.editorBody}>
        <StringListEditor
          title="Awards"
          items={resume.awards}
          addLabel="Add award"
          onChange={updateAwards}
        />
      </div>
    </section>
  );
}

function StringListEditor({
  title,
  items,
  addLabel,
  onChange,
}: {
  title: string;
  items: string[];
  addLabel: string;
  onChange: (items: string[]) => void;
}) {
  function addItem() {
    onChange([...items, ""]);
  }

  function updateItem(index: number, value: string) {
    onChange(
      items.map((item, currentIndex) =>
        currentIndex === index ? value : item,
      ),
    );
  }

  function removeItem(index: number) {
    onChange(items.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{title}</legend>

      <div className={styles.fields}>
        {items.length === 0 && (
          <div className={`${styles.sunken} px-3 py-3`}>No items yet.</div>
        )}

        {items.map((item, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Field label={`Item ${index + 1}`}>
                <input
                  value={item}
                  onChange={(event) => updateItem(index, event.target.value)}
                  className={styles.input}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={() => removeItem(index)}
              className={styles.button}
              aria-label="Remove item"
            >
              <Win98Icon name="close" size={12} />
            </button>
          </div>
        ))}

        <div>
          <button type="button" onClick={addItem} className={styles.button}>
            + {addLabel}
          </button>
        </div>
      </div>
    </fieldset>
  );
}

function EditorHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className={styles.editorHeader}>
      <div>
        <h2 className={styles.editorTitle}>{title}</h2>

        <p className={styles.editorSubtitle}>{subtitle}</p>
      </div>
    </div>
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
