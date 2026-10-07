import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "generated",
      "result.json",
    );

    const content = await readFile(filePath, "utf-8");
    const result: unknown = JSON.parse(content);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Generated result not found.",
      },
      {
        status: 404,
      },
    );
  }
}
