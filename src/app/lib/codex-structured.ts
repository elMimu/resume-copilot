import { spawn } from "node:child_process";

export function runCodexStructured(
  prompt: string,
  schemaPath: string,
): Promise<string> {
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
