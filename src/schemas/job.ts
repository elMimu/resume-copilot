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

export const jobSchema = z.object({
  id: z.string(),
  company: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  url: z.string().url().optional().or(z.literal("")),
  status: applicationStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Job = z.infer<typeof jobSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
