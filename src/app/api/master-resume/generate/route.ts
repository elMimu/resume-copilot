import path from "node:path";

import { NextResponse } from "next/server";

import { z } from "zod";

import { masterResumeSchema } from "@/schemas/master-resume";
import { runCodexStructured } from "@/app/lib/codex-structured";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  story: z.string().trim().min(50, "Career story is too short."),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());

    const schemaPath = path.join(
      process.cwd(),
      "data",
      "master-resume-output.schema.json",
    );

    const prompt = buildPrompt(input.story);

    const output = await runCodexStructured(prompt, schemaPath);

    const parsed: unknown = JSON.parse(output);

    const resume = masterResumeSchema.parse(parsed);

    return NextResponse.json({
      resume,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "The generated master resume is invalid.",

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
            : "Could not generate the master resume.",
      },
      {
        status: 500,
      },
    );
  }
}

function buildPrompt(story: string) {
  return `
You are creating a factual master resume from a person's free-form career story.

=== CAREER STORY ===
${story}

Return a complete master resume using schema version 1.1.

CORE RULE:

The CAREER STORY is the only factual source of truth.

You may improve writing, organization, clarity and resume terminology.

You must not invent facts.

Do not invent:
- employers;
- job titles;
- employment dates;
- locations;
- education;
- degrees;
- projects;
- technologies;
- programming languages;
- frameworks;
- skills;
- responsibilities;
- achievements;
- metrics;
- awards;
- certifications;
- contact information;
- language proficiency.

If information is not present in the story:
- use "" for required string fields when no factual value is available;
- use null for nullable fields;
- use [] for arrays.

WRITING:

1. Rewrite factual information using concise professional resume language.

2. Prefer clear action-oriented writing.

3. Improve ATS readability through explicit, conventional terminology when that terminology is factually supported.

4. Do not keyword-stuff.

5. Do not add technologies merely because they are common for a role.

6. Do not transform a responsibility into a measurable achievement unless the story explicitly provides that achievement or measurable result.

7. Never create percentages, user counts, revenue, performance improvements, team sizes or other metrics that are not explicitly provided.

8. Preserve proper names such as companies, universities, projects and technologies.

9. Use the same natural language as the career story for descriptive prose.

STRUCTURE:

10. basics.summary should provide a concise factual professional summary.

11. career.objective should describe the professional direction supported by the story.

12. career.targetRoles should contain only roles that are explicitly stated or clearly identified by the person as desired roles.

13. work entries should contain factual employment information.

14. responsibilities should be concise factual resume-style statements.

15. achievements should only contain actual achievements or outcomes supported by the story.

16. projects should only contain projects actually mentioned by the person.

17. skills should only include technologies or professional skills explicitly stated or directly demonstrated by factual work/projects in the story.

18. computerScience.fundamentals should only contain topics actually mentioned or directly evidenced.

19. languages and proficiency levels must only come from explicit information.

INTERNAL IDS:

20. IDs are internal metadata, not factual claims.

21. Generate short stable kebab-case IDs for work entries, projects and achievements.

22. Skill evidence references may contain only IDs of work entries or projects that actually support that skill.

23. evidenceStrength:
    - strong: directly and clearly stated;
    - partial: factually supported but less explicit;
    - weak: weakly supported by the wording of the story.

Return the complete JSON object only.
`.trim();
}
