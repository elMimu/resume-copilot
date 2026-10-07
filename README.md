# Resume Copilot

Local-first tool for managing job applications and job-specific resumes.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- pnpm

## Architecture

The application stores job application data locally.

AI-assisted resume generation is performed externally by Codex using the
instructions in `AGENTS.md`.

The UI imports structured generated results and manages:

- jobs
- job analysis
- enhanced resumes
- glossed resumes
- application status
