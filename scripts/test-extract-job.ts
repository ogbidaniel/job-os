/**
 * Local dry-run of the AI provider chain via the extract-job handler.
 *
 * Proves three things without a redeploy:
 *  1. extraction still works and reports which model answered;
 *  2. the OpenAI fallback leg works when Gemini is unavailable
 *     (run with GEMINI_API_KEY unset, or DISABLE_GEMINI=1);
 *  3. the schema translation produces something OpenAI strict mode accepts.
 *
 * Keys come from the environment, same as the Lambda:
 *   GEMINI_API_KEY=... OPENAI_API_KEY=... npx tsx scripts/test-extract-job.ts
 *
 * Sandbox values can be read from SSM:
 *   /amplify/jobos/<sandbox>/GEMINI_API_KEY
 */
import { handler } from "../amplify/functions/extract-job/handler";
import { geminiSchemaToJsonSchema } from "../amplify/functions/shared/openai";

const SAMPLE_POSTING = `
Senior Data Engineer — Acme Analytics
Posted 3 days ago · Houston, TX (Hybrid) · $145,000 - $170,000 a year

About the role
Acme Analytics is hiring a Senior Data Engineer to own our batch and
streaming pipelines.

What you'll do
- Design and operate ETL pipelines processing 2TB/day
- Partner with ML engineers to productionize feature pipelines
- Own data quality monitoring and alerting

What you need
- 5+ years building production data pipelines in Python
- Deep SQL and dimensional modeling experience
- Experience with Airflow or Dagster

Nice to have
- dbt, Snowflake
- AWS certification

Apply at https://careers.acme.example/jobs/9182
`;

interface Extraction {
  company: string | null;
  title: string | null;
  location: string | null;
  salary: string | null;
  postedAt: string | null;
  sourceSite: string | null;
  requiredSkills: string[];
  _model?: string;
}

/**
 * The chain reads process.env on every call (not at module load), so
 * mutating the env between runs is enough to steer which leg is used.
 */
async function run(label: string): Promise<void> {
  const started = Date.now();
  try {
    const raw = (await handler(
      {
        arguments: { text: SAMPLE_POSTING, today: "2026-09-20" },
      } as Parameters<typeof handler>[0],
      {} as never,
      () => undefined,
    )) as string;
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    const parsed = JSON.parse(raw) as Extraction;
    console.log(`\n=== ${label} — ${seconds}s ===`);
    console.log(`  model:    ${parsed._model ?? "(not reported)"}`);
    console.log(`  company:  ${parsed.company}`);
    console.log(`  title:    ${parsed.title}`);
    console.log(`  location: ${parsed.location}`);
    console.log(`  salary:   ${parsed.salary}`);
    console.log(`  postedAt: ${parsed.postedAt}  (expect 2026-09-17)`);
    console.log(`  source:   ${parsed.sourceSite}`);
    console.log(`  required: ${parsed.requiredSkills.length} items`);
    if (!parsed.company || !parsed.title) {
      console.error("  FAILED: company/title missing");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`\n=== ${label} — THREW ===`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

async function main(): Promise<void> {
  // Schema translation is pure — check it before spending any tokens.
  const translated = geminiSchemaToJsonSchema({
    type: "OBJECT",
    properties: {
      company: { type: "STRING", nullable: true },
      skills: { type: "ARRAY", items: { type: "STRING" } },
    },
    required: ["company"],
  });
  const json = JSON.stringify(translated);
  const expectations: Array<[string, boolean]> = [
    ['nullable → ["string","null"]', json.includes('["string","null"]')],
    ["additionalProperties: false", json.includes('"additionalProperties":false')],
    ["all keys required", json.includes('"required":["company","skills"]')],
  ];
  console.log("=== schema translation ===");
  for (const [what, ok] of expectations) {
    console.log(`  ${ok ? "OK  " : "FAIL"} ${what}`);
    if (!ok) process.exitCode = 1;
  }

  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  console.log(
    `\nkeys: GEMINI_API_KEY=${hasGemini ? "set" : "unset"}, OPENAI_API_KEY=${hasOpenAi ? "set" : "unset"}`,
  );

  if (hasGemini && !process.env.DISABLE_GEMINI) {
    await run("chain as configured (Gemini first)");
  }

  if (hasOpenAi) {
    // Force the fallback leg by hiding the Gemini key from the chain.
    const saved = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    await run("OpenAI fallback only (GEMINI_API_KEY hidden)");
    if (saved) process.env.GEMINI_API_KEY = saved;
  } else {
    console.log("\nSkipping fallback leg: set OPENAI_API_KEY to exercise it.");
  }
}

void main();
