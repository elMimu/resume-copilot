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
  url: z.string().optional(),
});

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

      resolve(stdout.trim());
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

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

    const masterResume = await readFile(masterResumePath, "utf8");

    const prompt = `
=== MASTER RESUME ===
${masterResume}

=== JOB ===
Company: ${input.company}
Title: ${input.title}
URL: ${input.url ?? ""}

=== JOB DESCRIPTION ===
${input.description}

Generate the Resume Copilot payload using the project instructions.
Return only the structured result.
`.trim();

    const output = await runCodex(prompt, schemaPath);

    const json: unknown = JSON.parse(output);

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
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Resume generation failed.",
      },
      { status: 500 },
    );
  }
}
