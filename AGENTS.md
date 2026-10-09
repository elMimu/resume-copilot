<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Resume Copilot

Resume Copilot is a local-first job application and tailored resume manager.

Codex is used locally as the resume-generation engine.

The web application is responsible for storing, displaying, editing and exporting generated results.

Do not introduce server-side persistence, authentication, PostgreSQL, FastAPI or external LLM APIs unless explicitly requested.

## Master resume

The master resume is the factual source of truth.

The enhanced resume must never contain invented facts.

Factual information includes:

- identity;
- contact information;
- employers;
- roles;
- dates;
- work locations;
- technologies;
- responsibilities;
- achievements;
- metrics;
- projects;
- education;
- skills;
- languages;
- language proficiency.

Do not invent facts to improve job fit.

## Evidence analysis

Before classifying a job requirement, inspect all relevant evidence available in the master resume.

Check:

- work technologies;
- work responsibilities;
- work achievements;
- work skills;
- project technologies;
- project descriptions;
- project highlights;
- top-level skills;
- education;
- computer science fundamentals;
- languages.

A requirement must not be classified as `missing` until the relevant master-resume evidence has been checked.

Use these match classifications:

- `strong`: direct and meaningful factual evidence exists;
- `partial`: related factual evidence exists but does not fully prove the exact requirement;
- `missing`: no meaningful factual evidence exists.

Examples:

- professional JavaScript and TypeScript experience is relevant evidence for JavaScript or TypeScript requirements;
- React used in a factual project is relevant evidence for React;
- factual Git experience is relevant evidence for Git;
- API integration experience is relevant evidence for API-related requirements.

Do not claim exact experience with a framework or technology unless the master resume supports it.

## Match score

`matchScore` represents the factual fit between the candidate and the job before resume rewriting.

Consider the candidate's complete factual background:

- professional experience;
- projects;
- skills;
- education;
- computer science knowledge.

Do not reduce the score to zero merely because some exact tools or frameworks are absent.

## Enhanced resume

The enhanced resume is intended for real job applications.

It may:

- reorder factual information;
- rewrite factual bullets;
- improve clarity;
- emphasize relevant evidence;
- remove low-value information;
- use terminology from the job description;
- categorize factual skills;
- prioritize relevant projects.

It must remain factually supported by the master resume.

Unless the master resume genuinely lacks the information, the enhanced resume must not return empty:

- summary;
- experiences;
- education;
- skills.

Tailoring means selecting and emphasizing factual evidence.

Tailoring does not mean discarding the candidate's background because the target technology stack differs.

## Glossed resume

The glossed resume is an exploratory comparison.

It may use more aggressive positioning.

Every unsupported claim must appear in `unsupportedClaims`.

Do not hide unsupported claims.

Employers, dates, education institutions, work locations, contact information and languages must remain factual.

## Contact information

`enhanced.basics` and `glossed.basics` must reflect factual information from the master resume.

Do not invent, modify or improve contact information.

## Skills

Generated resume skills use categorized groups.

Example:

```json
{
  "category": "Frontend",
  "items": ["React", "Next.js", "TypeScript"]
}
```

Skill categories are presentation-only.

They must not create new factual claims.

Do not add technologies to the enhanced resume unless supported by the master resume.

## Languages

Both enhanced and glossed resumes must include factual languages from the master resume.

Do not infer or upgrade language proficiency.

## Experience location

Every generated experience contains nullable `location`.

Use the factual location associated with the corresponding master-resume experience.

Use `null` when unavailable.

Do not infer location from the employer name.

## Education status

Every generated education item contains nullable `status`.

A concise status may be derived from factual master-resume information.

Examples:

- `Completed`
- `Expected graduation: 2026`
- `In progress`

Do not mark education as completed unless the master resume supports that conclusion.

## Language

Use the language of the job description for generated prose unless explicitly instructed otherwise.

Supported output language values:

- `en`
- `pt-BR`

Do not translate or modify factual identity information.

## Output contract

Generated output must conform exactly to Resume Copilot schema version `1.2`.

The canonical JSON schema is:

`data/resume-copilot-output.schema.json`

Both `enhanced` and `glossed` contain:

- `basics`;
- `headline`;
- `summary`;
- categorized `skills`;
- `experiences`;
- `education`;
- `projects`;
- `languages`.

Experiences contain nullable `location`.

Education contains nullable `status`.

Glossed additionally contains:

- `unsupportedClaims`.

Do not add fields outside the schema.

Return structured JSON only.

Do not wrap JSON in Markdown.

Do not add commentary before or after the result.

## Generation workflow

When generating a result:

1. Read the supplied master resume.
2. Read the supplied job description.
3. Determine job language.
4. Extract required, preferred and inferred requirements.
5. Inspect the entire master resume for relevant evidence.
6. Match every requirement against factual evidence.
7. Calculate factual match score.
8. Generate a complete enhanced resume.
9. Generate a complete glossed resume.
10. Identify every unsupported glossed claim.
11. Return only the schema-compliant result.

## Fabrication rules

For the enhanced resume:

- no invented identity information;
- no invented contact information;
- no invented employers;
- no invented roles;
- no invented dates;
- no invented work locations;
- no invented technologies;
- no invented responsibilities;
- no invented achievements;
- no invented metrics;
- no invented education;
- no invented certifications;
- no invented language proficiency.

Use `null` when the schema requires a nullable value and no factual value is available.
