import { spawn } from "node:child_process";

import { readFile } from "node:fs/promises";

import path from "node:path";

import { NextResponse } from "next/server";

import { z } from "zod";

import { generatedJobPayloadSchema } from "@/schemas/job-result";

import { resumeLanguageSchema, type ResumeLanguage } from "@/schemas/job";
import { localizeLocation } from "@/app/lib/resume-i18n";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  company: z.string().min(1),

  title: z.string().min(1),

  description: z.string().min(1),

  url: z.string().nullable().optional(),

  resumeLanguage: resumeLanguageSchema.optional().default("en"),
});

type MasterResume = {
  basics?: {
    name: string;

    label: string;

    email: string;

    phone: string | null;

    location: string;

    linkedin: string | null;

    github: string | null;

    portfolio: string | null;
  };

  career?: {
    targetRoles?: string[];
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

      resumeLanguage: input.resumeLanguage,
    });

    const output = await runCodex(prompt, schemaPath);

    const json = JSON.parse(output) as {
      enhanced?: Record<string, unknown>;

      glossed?: Record<string, unknown>;

      [key: string]: unknown;
    };

    normalizeFactualFields(json, masterResume, input.resumeLanguage);

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

  resumeLanguage: ResumeLanguage,
) {
  const languages = localizeLanguages(
    masterResume.languages ?? [],
    resumeLanguage,
  );

  const headline = getMasterResumeHeadline(masterResume);

  if (json.enhanced) {
    if (masterResume.basics) {
      json.enhanced.basics = localizeBasics(
        masterResume.basics,
        resumeLanguage,
      );
    }

    json.enhanced.headline = headline;

    json.enhanced.languages = languages;

    localizeExperienceLocations(json.enhanced, resumeLanguage);
  }

  if (json.glossed) {
    if (masterResume.basics) {
      json.glossed.basics = localizeBasics(masterResume.basics, resumeLanguage);
    }

    json.glossed.headline = headline;

    json.glossed.languages = languages;

    localizeExperienceLocations(json.glossed, resumeLanguage);
  }
}

function localizeBasics(
  basics: NonNullable<MasterResume["basics"]>,

  language: ResumeLanguage,
) {
  return {
    ...basics,

    location: localizeLocation(basics.location, language),
  };
}

function localizeExperienceLocations(
  resume: Record<string, unknown>,

  language: ResumeLanguage,
) {
  if (!Array.isArray(resume.experiences)) {
    return;
  }

  resume.experiences = resume.experiences.map((experience) => {
    if (typeof experience !== "object" || experience === null) {
      return experience;
    }

    const record = experience as Record<string, unknown>;

    if (typeof record.location !== "string") {
      return record;
    }

    return {
      ...record,

      location: localizeLocation(record.location, language),
    };
  });
}

function getMasterResumeHeadline(masterResume: MasterResume) {
  const targetRole = masterResume.career?.targetRoles
    ?.find((role) => role.trim().length > 0)
    ?.trim();

  if (targetRole) {
    return targetRole;
  }

  return masterResume.basics?.label?.trim() ?? "";
}

function localizeLanguages(
  languages: Array<{
    language: string;
    level: string;
  }>,
  target: ResumeLanguage,
) {
  return languages.map(({ language, level }) => ({
    language: localizeLanguageName(language, target),

    level: localizeLanguageLevel(level, target),
  }));
}

function localizeLanguageName(value: string, target: ResumeLanguage) {
  const normalized = value.trim().toLowerCase();

  if (target === "pt-BR") {
    const values: Record<string, string> = {
      english: "Inglês",
      portuguese: "Português",
      spanish: "Espanhol",
      french: "Francês",
      german: "Alemão",
    };

    return values[normalized] ?? value;
  }

  const values: Record<string, string> = {
    inglês: "English",
    ingles: "English",
    português: "Portuguese",
    portugues: "Portuguese",
    espanhol: "Spanish",
    francês: "French",
    frances: "French",
    alemão: "German",
    alemao: "German",
  };

  return values[normalized] ?? value;
}

function localizeLanguageLevel(value: string, target: ResumeLanguage) {
  const normalized = value.trim().toLowerCase();

  if (target === "pt-BR") {
    const values: Record<string, string> = {
      native: "Nativo",
      fluent: "Fluente",
      advanced: "Avançado",
      intermediate: "Intermediário",
      basic: "Básico",
      beginner: "Iniciante",
    };

    return values[normalized] ?? value;
  }

  const values: Record<string, string> = {
    nativo: "Native",
    fluente: "Fluent",
    avançado: "Advanced",
    avancado: "Advanced",
    intermediário: "Intermediate",
    intermediario: "Intermediate",
    básico: "Basic",
    basico: "Basic",
    iniciante: "Beginner",
  };

  return values[normalized] ?? value;
}

function buildPrompt({
  masterResumeContent,
  company,
  title,
  description,
  url,
  resumeLanguage,
}: {
  masterResumeContent: string;

  company: string;

  title: string;

  description: string;

  url: string | null;

  resumeLanguage: ResumeLanguage;
}) {
  const outputLanguage =
    resumeLanguage === "pt-BR" ? "Brazilian Portuguese" : "English";

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

=== TARGET RESUME LANGUAGE ===
${outputLanguage}

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

19. Write the enhanced resume entirely in ${outputLanguage}.

20. Write the glossed resume entirely in ${outputLanguage}.

21. When the target language is Brazilian Portuguese:
    - write natural Brazilian Portuguese;
    - use "Brasil", never "Brazil", in locations;
    - translate section-related concepts naturally;
    - translate user-facing skill category names when appropriate;
    - translate language names and proficiency descriptions;
    - preserve company names, institution names, technologies, URLs and email addresses.

22. When the target language is English:
    - use "Brazil", not "Brasil", in locations;
    - write user-facing content in natural English.

23. Preserve the factual meaning of job titles and degrees while expressing them naturally in ${outputLanguage} when appropriate.

24. The analysis section may remain in English.

25. The resume headline must contain only the candidate's primary professional role.
    Do not include skills, technologies, keywords, specializations, separators, or descriptive phrases in the headline.
    The application will replace this field with the canonical role from the master resume after generation.

26. Return only the structured JSON result.

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
