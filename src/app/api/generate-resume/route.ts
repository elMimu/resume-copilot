import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { generatedJobPayloadSchema } from "@/schemas/job-result";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().nullable().optional(),
});

type MasterResume = {
  basics?: {
    name: string;
    email: string;
    phone: string | null;
    location: string;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };

  languages?: Array<{
    language: string;
    level: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());

    const masterResumePath = path.join(
      process.cwd(),
      "data",
      "master-resume.json",
    );

    const schemaPath = path.join(
      process.cwd(),
      "data",
      "resume-copilot-output.schema.json",
    );

    const masterResumeContent = await readFile(masterResumePath, "utf8");

    const masterResume = JSON.parse(masterResumeContent) as MasterResume;

    const prompt = buildPrompt({
      masterResumeContent,
      company: input.company,
      title: input.title,
      description: input.description,
      url: input.url ?? null,
    });

    const output = await runCodex(prompt, schemaPath);

    const json = JSON.parse(output) as {
      enhanced?: Record<string, unknown>;
      glossed?: Record<string, unknown>;
      [key: string]: unknown;
    };

    normalizeFactualFields(json, masterResume);

    const result = generatedJobPayloadSchema.parse(json);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input or generated payload.",
          issues: error.issues,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Resume generation failed.",
      },
      {
        status: 500,
      },
    );
  }
}

function normalizeFactualFields(
  json: {
    enhanced?: Record<string, unknown>;
    glossed?: Record<string, unknown>;
    [key: string]: unknown;
  },
  masterResume: MasterResume,
) {
  const languages = masterResume.languages ?? [];

  if (json.enhanced) {
    if (masterResume.basics) {
      json.enhanced.basics = masterResume.basics;
    }

    json.enhanced.languages = languages;
  }

  if (json.glossed) {
    if (masterResume.basics) {
      json.glossed.basics = masterResume.basics;
    }

    json.glossed.languages = languages;
  }
}

function buildPrompt({
  masterResumeContent,
  company,
  title,
  description,
  url,
}: {
  masterResumeContent: string;
  company: string;
  title: string;
  description: string;
  url: string | null;
}) {
  return `
You are generating a tailored resume from a factual master resume.

=== MASTER RESUME ===
${masterResumeContent}

=== TARGET JOB ===
Company: ${company}
Title: ${title}
URL: ${url ?? "N/A"}

=== JOB DESCRIPTION ===
${description}

Generate a Resume Copilot payload using schema version 1.2.

IMPORTANT RULES:

1. The MASTER RESUME is the factual source of truth.

2. Analyze all relevant evidence from:
   - work experience;
   - technologies;
   - skills;
   - responsibilities;
   - achievements;
   - projects;
   - project technologies;
   - education;
   - computer science knowledge;
   - languages.

3. Do not classify a requirement as "missing" before checking the entire master resume.

4. Requirement matching:
   - strong: direct factual evidence exists;
   - partial: related factual evidence exists but does not fully prove the exact requirement;
   - missing: no meaningful factual evidence exists.

5. Related evidence must count.

Examples:
- JavaScript and TypeScript experience is relevant evidence for JavaScript/TypeScript requirements.
- React used in a project is relevant evidence for React.
- Git evidence is relevant for Git requirements.
- API integration experience is relevant for API-related requirements.

6. Do not mark an exact technology as strong unless the master resume directly supports it.

7. matchScore must reflect the candidate's factual fit before resume rewriting.

8. The enhanced resume must be a complete usable resume.

9. Unless the master resume truly contains no such information, do not return empty:
   - summary;
   - experiences;
   - education;
   - skills.

10. Preserve relevant work experience even if the target stack is different.

11. Preserve relevant education.

12. Include relevant projects when they strengthen the application.

13. Generate categorized skills using only factual skills and technologies from the master resume.

14. Do not invent:
   - technologies;
   - employers;
   - roles;
   - dates;
   - responsibilities;
   - achievements;
   - metrics;
   - education;
   - work locations;
   - certifications;
   - language proficiency.

15. Experience location must come from the master resume.
    Use null when unavailable.

16. Education status must be based on factual information from the master resume.

17. Both enhanced and glossed must be complete resume objects.

18. Any unsupported claim in glossed must be included in unsupportedClaims.

19. Return only the structured JSON result.

Before producing the result, internally compare every job requirement against the complete master resume.
`.trim();
}

function runCodex(prompt: string, schemaPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "codex",
      ["exec", "--sandbox", "read-only", "--output-schema", schemaPath, "-"],
      {
        cwd: process.cwd(),
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");

    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Codex exited with code ${code}.\n${stderr}`));

        return;
      }

      const output = stdout.trim();

      if (!output) {
        reject(new Error(`Codex returned an empty response.\n${stderr}`));

        return;
      }

      resolve(output);
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}
