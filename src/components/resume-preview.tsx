"use client";

import { getResumeSectionLabels } from "@/app/lib/resume-i18n";
import type { ResumeLanguage } from "@/schemas/job";

import type { GeneratedJobPayload } from "@/schemas/job-result";

type Resume = GeneratedJobPayload["enhanced"];

type Props = {
  resume: Resume;
  language: ResumeLanguage;
};

export function ResumePreview({ resume, language }: Props) {
  const {
    basics,
    headline,
    summary,
    education,
    experiences,
    projects,
    skills,
    languages,
  } = resume;

  const labels = getResumeSectionLabels(language);

  return (
    <article
      id="resume-print-area"
      className="bg-white p-8 text-[14px] leading-[1.35] text-black shadow-sm"
    >
      <header>
        <h1 className="text-center text-[26px] font-bold leading-tight">
          {basics.name} | {headline}
        </h1>

        <p className="mt-3 break-words text-center text-[13px] leading-5">
          {[
            basics.location,
            basics.email,
            basics.phone,
            basics.linkedin,
            basics.github,
            basics.portfolio,
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>

      <ResumeSection title={labels.summary}>
        <p>{summary}</p>
      </ResumeSection>

      {education.length > 0 && (
        <ResumeSection title={labels.education}>
          <div className="space-y-4">
            {education.map((item) => (
              <article
                key={`${item.institution}-${item.degree}`}
                className="break-inside-avoid"
              >
                <h3 className="font-bold">{item.institution}</h3>

                <div className="flex justify-between gap-4">
                  <p className="italic">{item.degree}</p>

                  {(item.status || item.startDate || item.endDate) && (
                    <small className="shrink-0 italic">
                      {item.status ??
                        formatDateRange(item.startDate, item.endDate)}
                    </small>
                  )}
                </div>
              </article>
            ))}
          </div>
        </ResumeSection>
      )}

      {experiences.length > 0 && (
        <ResumeSection title={labels.experience}>
          <div className="space-y-5">
            {experiences.map((experience) => (
              <article
                key={`${experience.company}-${experience.role}-${experience.startDate}`}
                className="break-inside-avoid"
              >
                <div className="flex items-start gap-6">
                  <div>
                    <h3 className="font-bold">{experience.role}</h3>

                    <p className="italic">{experience.company}</p>
                  </div>

                  <div className="ml-auto shrink-0 text-right">
                    <p>
                      {experience.startDate}-{experience.endDate}
                    </p>

                    {experience.location && (
                      <p className="italic">{experience.location}</p>
                    )}
                  </div>
                </div>

                {experience.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-7">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </ResumeSection>
      )}

      {projects.length > 0 && (
        <ResumeSection title={labels.projects}>
          <div className="space-y-4">
            {projects.map((project) => (
              <article key={project.name} className="break-inside-avoid">
                <p>
                  <strong>{project.name} | </strong>

                  {project.description}
                </p>

                {project.technologies.length > 0 && (
                  <p className="mt-1 text-[12px] italic">
                    {project.technologies.join(", ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        </ResumeSection>
      )}

      {skills.length > 0 && (
        <ResumeSection title={labels.skills}>
          <div className="space-y-1">
            {skills.map((group) => (
              <p key={group.category}>
                <strong>{group.category}:</strong> {group.items.join(", ")}
              </p>
            ))}
          </div>
        </ResumeSection>
      )}

      {languages.length > 0 && (
        <ResumeSection title={labels.languages}>
          <p>
            {languages
              .map(({ language, level }) => `${language}: ${level}`)
              .join(" | ")}
          </p>
        </ResumeSection>
      )}
    </article>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4">
      <h2 className="text-[18px] font-bold leading-tight">{title}</h2>

      <hr className="mb-2 border-black" />

      {children}
    </section>
  );
}

function formatDateRange(
  startDate: string | null,

  endDate: string | null,
) {
  if (!startDate && !endDate) {
    return "";
  }

  if (!startDate) {
    return endDate ?? "";
  }

  if (!endDate) {
    return startDate;
  }

  return `${startDate}-${endDate}`;
}
