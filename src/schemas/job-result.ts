import { z } from "zod";

export const requirementSchema = z.object({
  name: z.string().min(1),
  importance: z.enum(["required", "preferred", "inferred"]),
  match: z.enum(["strong", "partial", "missing"]),
  evidence: z.array(z.string()),
});

export const resumeBasicsSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  location: z.string(),
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  portfolio: z.string().nullable(),
});

export const skillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const languageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  status: z.string().nullable(),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
});

export const resumeSchema = z.object({
  basics: resumeBasicsSchema,
  headline: z.string(),
  summary: z.string(),
  skills: z.array(skillGroupSchema),
  experiences: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  languages: z.array(languageSchema),
});

export const unsupportedClaimSchema = z.object({
  claim: z.string(),
  reason: z.string(),
});

export const glossedResumeSchema = resumeSchema.extend({
  unsupportedClaims: z.array(unsupportedClaimSchema),
});

export const generatedJobPayloadSchema = z.object({
  schemaVersion: z.literal("1.2"),

  job: z.object({
    company: z.string().nullable(),
    title: z.string(),
    url: z.string().nullable(),
    description: z.string(),
    language: z.enum(["pt-BR", "en"]),
  }),

  analysis: z.object({
    matchScore: z.number().int().min(0).max(100),

    requirements: z.array(requirementSchema),

    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    keywords: z.array(z.string()),
  }),

  enhanced: resumeSchema,

  glossed: glossedResumeSchema,
});

export type GeneratedJobPayload = z.infer<typeof generatedJobPayloadSchema>;

export const jobResultSchema = generatedJobPayloadSchema.extend({
  jobId: z.string(),
  generatedAt: z.string(),
});

export type JobResult = z.infer<typeof jobResultSchema>;
