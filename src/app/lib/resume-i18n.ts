import type { ResumeLanguage } from "@/schemas/job";

export type ResumeSectionLabels = {
  summary: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
  languages: string;
};

const labels: Record<ResumeLanguage, ResumeSectionLabels> = {
  en: {
    summary: "SUMMARY",
    education: "EDUCATION",
    experience: "EXPERIENCE",
    projects: "PROJECTS",
    skills: "SKILLS",
    languages: "LANGUAGES",
  },

  "pt-BR": {
    summary: "RESUMO",
    education: "FORMAÇÃO ACADÊMICA",
    experience: "EXPERIÊNCIA PROFISSIONAL",
    projects: "PROJETOS",
    skills: "HABILIDADES",
    languages: "IDIOMAS",
  },
};

export function getResumeSectionLabels(
  language: ResumeLanguage,
): ResumeSectionLabels {
  return labels[language];
}

export function localizeLocation(location: string, language: ResumeLanguage) {
  if (language === "pt-BR") {
    return location.replace(/\bBrazil\b/gi, "Brasil");
  }

  return location.replace(/\bBrasil\b/gi, "Brazil");
}
