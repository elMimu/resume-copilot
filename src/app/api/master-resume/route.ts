import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { masterResumeSchema } from "@/schemas/master-resume";

export const runtime = "nodejs";

const DATA_DIRECTORY = path.join(process.cwd(), "data");

const MASTER_RESUME_PATH = path.join(DATA_DIRECTORY, "master-resume.json");

const MASTER_RESUME_EXAMPLE_PATH = path.join(
  DATA_DIRECTORY,
  "master-resume.example.json",
);

type MasterResumeSource = "master" | "example";

export async function GET() {
  try {
    const { content, source } = await readMasterResume();

    const parsedJson: unknown = JSON.parse(content);

    const validation = masterResumeSchema.safeParse(parsedJson);

    if (!validation.success) {
      console.error("Invalid master resume:", validation.error);

      return Response.json(
        {
          error: "Master resume file is invalid.",
          issues: validation.error.issues,
          source,
        },
        {
          status: 500,
        },
      );
    }

    return Response.json({
      resume: validation.data,
      source,
    });
  } catch (error) {
    console.error("Failed to load master resume:", error);

    return Response.json(
      {
        error: "Could not load the master resume.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const input: unknown = await request.json();

    const validation = masterResumeSchema.safeParse(input);

    if (!validation.success) {
      return Response.json(
        {
          error: "Master resume is invalid.",
          issues: validation.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    await mkdir(DATA_DIRECTORY, {
      recursive: true,
    });

    const temporaryPath = `${MASTER_RESUME_PATH}.tmp`;

    const serialized = `${JSON.stringify(validation.data, null, 2)}\n`;

    await writeFile(temporaryPath, serialized, "utf8");

    await rename(temporaryPath, MASTER_RESUME_PATH);

    return Response.json({
      resume: validation.data,
      source: "master" satisfies MasterResumeSource,
    });
  } catch (error) {
    console.error("Failed to save master resume:", error);

    if (error instanceof SyntaxError) {
      return Response.json(
        {
          error: "Request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    return Response.json(
      {
        error: "Could not save the master resume.",
      },
      {
        status: 500,
      },
    );
  }
}

async function readMasterResume(): Promise<{
  content: string;
  source: MasterResumeSource;
}> {
  try {
    const content = await readFile(MASTER_RESUME_PATH, "utf8");

    return {
      content,
      source: "master",
    };
  } catch (error) {
    if (!isFileNotFound(error)) {
      throw error;
    }
  }

  const content = await readFile(MASTER_RESUME_EXAMPLE_PATH, "utf8");

  return {
    content,
    source: "example",
  };
}

function isFileNotFound(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
