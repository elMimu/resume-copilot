import { z } from "zod";

const requirementSchema = z.object({
  name: z.string().min(1),
  importance: z.enum(["required", "preferred", "inferred"]),
  match: z.enum(["strong", "partial", "missing"]),
  evidence: z.array(z.string()),
});

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
});

export const resumeSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experiences: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
});

const unsupportedClaimSchema = z.object({
  claim: z.string(),
  reason: z.string(),
});

export const generatedJobPayloadSchema = z.object({
  schemaVersion: z.literal("1.0"),

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

  glossed: resumeSchema.extend({
    unsupportedClaims: z.array(unsupportedClaimSchema),
  }),
});

export type GeneratedJobPayload = z.infer<typeof generatedJobPayloadSchema>;
export const jobResultSchema = generatedJobPayloadSchema.extend({
  jobId: z.string(),
  generatedAt: z.string(),
});

export type JobResult = z.infer<typeof jobResultSchema>;
