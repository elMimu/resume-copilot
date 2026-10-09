import path from "node:path";

import { NextResponse } from "next/server";

import { z } from "zod";

import { masterResumeSchema, type MasterResume } from "@/schemas/master-resume";
import { runCodexStructured } from "@/app/lib/codex-structured";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  resume: masterResumeSchema,
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());

    const schemaPath = path.join(
      process.cwd(),
      "data",
      "master-resume-output.schema.json",
    );

    const prompt = buildPrompt(input.resume);

    const output = await runCodexStructured(prompt, schemaPath);

    const candidate = masterResumeSchema.parse(JSON.parse(output));

    const resume = masterResumeSchema.parse(
      mergeReviewedResume(input.resume, candidate),
    );

    return NextResponse.json({
      resume,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "The reviewed master resume is invalid.",

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
          error instanceof Error
            ? error.message
            : "Could not review the master resume.",
      },
      {
        status: 500,
      },
    );
  }
}

function buildPrompt(resume: MasterResume) {
  return `
You are reviewing the writing of an existing factual master resume.

=== MASTER RESUME ===
${JSON.stringify(resume, null, 2)}

Return the complete master resume using the same schema version 1.1.

GOAL:

Improve writing quality, clarity, concision and ATS readability while preserving the candidate's factual information.

YOU MAY:

- improve the professional summary;
- improve the career objective;
- improve work summaries;
- rewrite responsibilities more clearly;
- rewrite achievement descriptions;
- improve education detail wording;
- improve project descriptions;
- improve project highlight wording;
- remove vague, repetitive or unnecessarily verbose wording inside those textual fields;
- use conventional resume terminology when factually equivalent;
- use stronger action verbs when they do not change the meaning.

YOU MUST NOT:

- invent facts;
- add employers;
- remove employers;
- change employers;
- add or change roles;
- change employment dates;
- change locations;
- add or remove technologies;
- add or remove skills;
- change evidence references;
- add achievements;
- remove achievements;
- change achievement evidence strength;
- add projects;
- remove projects;
- change project names;
- change institutions;
- change degrees;
- change education dates;
- change contact information;
- change language proficiency;
- add awards;
- invent metrics;
- exaggerate seniority;
- convert ordinary responsibilities into unsupported achievements;
- keyword-stuff.

PRESERVE:

- schemaVersion;
- IDs;
- names;
- contact information;
- company names;
- role names;
- locations;
- dates;
- technologies;
- skills;
- evidence;
- education facts;
- project identities;
- computer science fundamentals;
- languages;
- language proficiency;
- awards.

Only improve factual prose.

Return the complete JSON object only.
`.trim();
}

function mergeReviewedResume(
  original: MasterResume,
  reviewed: MasterResume,
): MasterResume {
  const reviewedWork = new Map(reviewed.work.map((item) => [item.id, item]));

  const reviewedProjects = new Map(
    reviewed.projects.map((item) => [item.id, item]),
  );

  return {
    ...original,

    basics: {
      ...original.basics,

      summary: reviewedText(
        original.basics.summary,

        reviewed.basics.summary,
      ),
    },

    career: {
      ...original.career,

      objective: reviewedText(
        original.career.objective,

        reviewed.career.objective,
      ),
    },

    work: original.work.map((work) => {
      const candidate = reviewedWork.get(work.id);

      if (!candidate) {
        return work;
      }

      const reviewedAchievements = new Map(
        candidate.achievements.map((achievement) => [
          achievement.id,
          achievement,
        ]),
      );

      return {
        ...work,

        summary: reviewedText(work.summary, candidate.summary),

        responsibilities: reviewStringArray(
          work.responsibilities,
          candidate.responsibilities,
        ),

        achievements: work.achievements.map((achievement) => {
          const reviewedAchievement = reviewedAchievements.get(achievement.id);

          return {
            ...achievement,

            text: reviewedText(
              achievement.text,

              reviewedAchievement?.text,
            ),
          };
        }),
      };
    }),

    education: original.education.map((education, index) => ({
      ...education,

      details: reviewStringArray(
        education.details,

        reviewed.education[index]?.details ?? [],
      ),
    })),

    projects: original.projects.map((project) => {
      const candidate = reviewedProjects.get(project.id);

      if (!candidate) {
        return project;
      }

      return {
        ...project,

        description: reviewedText(
          project.description,

          candidate.description,
        ),

        highlights: reviewStringArray(
          project.highlights,

          candidate.highlights,
        ),
      };
    }),
  };
}

function reviewStringArray(original: string[], reviewed: string[]) {
  return original.map((value, index) => reviewedText(value, reviewed[index]));
}

function reviewedText(original: string, reviewed: string | undefined) {
  const candidate = reviewed?.trim();

  return candidate ? candidate : original;
}
