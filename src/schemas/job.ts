import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "draft",
  "ready",
  "applied",
  "interview",
  "rejected",
  "offer",
  "archived",
]);

export const resumeLanguageSchema = z.enum(["en", "pt-BR"]);

export const generationStatusSchema = z.enum([
  "idle",
  "queued",
  "processing",
  "ready",
  "error",
]);

export const jobSchema = z.object({
  id: z.string(),

  company: z.string().trim().min(1),

  title: z.string().trim().min(1),

  description: z.string().trim().min(1),

  url: z.string().url().optional().or(z.literal("")),

  status: applicationStatusSchema,

  resumeLanguage: resumeLanguageSchema,

  generationStatus: generationStatusSchema,

  generationError: z.string().nullable(),

  generationCompletedAt: z.string().nullable(),

  createdAt: z.string(),

  updatedAt: z.string(),
});

export type Job = z.infer<typeof jobSchema>;

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export type ResumeLanguage = z.infer<typeof resumeLanguageSchema>;

export type GenerationStatus = z.infer<typeof generationStatusSchema>;
