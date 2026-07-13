/**
 * Local dry-run of the compile-latex handler: compiles the default
 * template (asserts a real PDF comes back) and a broken source (asserts
 * the error path carries a log). Run with: npx tsx scripts/test-compile-latex.ts
 */
import { writeFileSync } from "node:fs";
import { handler } from "../amplify/functions/compile-latex/handler";
import { DEFAULT_RESUME_TEMPLATE } from "../src/content/resume-template";

type CompileResult = { pdfBase64: string } | { error: string; log: string };

async function compile(source: string): Promise<CompileResult> {
  const raw = (await handler(
    { arguments: { source } } as Parameters<typeof handler>[0],
    {} as never,
    () => undefined,
  )) as string;
  return JSON.parse(raw) as CompileResult;
}

async function main(): Promise<void> {
  const started = Date.now();
  const good = await compile(DEFAULT_RESUME_TEMPLATE);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if ("pdfBase64" in good) {
    const bytes = Buffer.from(good.pdfBase64, "base64");
    const isPdf = bytes.subarray(0, 4).toString("utf8") === "%PDF";
    console.log(
      `template compile: ${seconds}s — ${bytes.length} bytes, isPdf=${isPdf}`,
    );
    writeFileSync("scripts/out-test-resume.pdf", bytes);
    console.log("wrote scripts/out-test-resume.pdf");
  } else {
    console.error(`template compile FAILED: ${good.error}\n${good.log}`);
    process.exitCode = 1;
    return;
  }

  const bad = await compile("\\documentclass{article}\\begin{document}\\undefinedmacro\\end{document}");
  if ("error" in bad) {
    console.log(
      `broken-source path OK: ${bad.error}; log length ${bad.log.length}`,
    );
  } else {
    console.error("broken source unexpectedly compiled");
    process.exitCode = 1;
  }
}

void main();
