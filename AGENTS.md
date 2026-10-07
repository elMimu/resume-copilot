<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Resume Copilot

This repository contains a local-first job application manager.

## Responsibilities

Codex is responsible for transforming a job description and the master resume
into structured Resume Copilot output.

The web application is responsible for storing, displaying, editing and
exporting those results.

Do not introduce server-side persistence, authentication, PostgreSQL or an
external LLM API unless explicitly requested.
