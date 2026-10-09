import { z } from "zod";

export const masterAchievementSchema = z.object({
  id: z.string(),
  text: z.string(),
  technologies: z.array(z.string()),
  skills: z.array(z.string()),
  evidenceStrength: z.enum(["strong", "partial", "weak"]),
});

export const masterWorkSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  summary: z.string(),
  technologies: z.array(z.string()),
  skills: z.array(z.string()),
  achievements: z.array(masterAchievementSchema),
  responsibilities: z.array(z.string()),
});

export const masterEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  details: z.array(z.string()),
});

export const masterProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  skills: z.array(z.string()),
  highlights: z.array(z.string()),
});

export const masterSkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  evidence: z.array(z.string()),
});

export const masterLanguageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

export const masterResumeSchema = z.object({
  schemaVersion: z.literal("1.1"),

  basics: z.object({
    name: z.string(),
    label: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    location: z.string(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
    portfolio: z.string().nullable(),
    summary: z.string(),
  }),

  career: z.object({
    objective: z.string(),
    targetRoles: z.array(z.string()),
    interests: z.array(z.string()),
  }),

  work: z.array(masterWorkSchema),

  education: z.array(masterEducationSchema),

  projects: z.array(masterProjectSchema),

  skills: z.array(masterSkillSchema),

  computerScience: z.object({
    fundamentals: z.array(z.string()),
  }),

  languages: z.array(masterLanguageSchema),

  awards: z.array(z.string()),
});

export type MasterResume = z.infer<typeof masterResumeSchema>;

export type MasterWork = z.infer<typeof masterWorkSchema>;

export type MasterEducation = z.infer<typeof masterEducationSchema>;

export type MasterProject = z.infer<typeof masterProjectSchema>;

export type MasterSkill = z.infer<typeof masterSkillSchema>;

export type MasterLanguage = z.infer<typeof masterLanguageSchema>;

export type MasterAchievement = z.infer<typeof masterAchievementSchema>;
