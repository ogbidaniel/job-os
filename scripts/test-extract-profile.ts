/**
 * Local dry-run of the extract-profile Lambda handler against a real
 * document. Requires GEMINI_API_KEY in the environment and a file path
 * argument. Not part of the app build; run with: npx tsx scripts/...
 */
import { readFileSync } from "node:fs";
import { handler } from "../amplify/functions/extract-profile/handler";

interface ExtractedEntry {
  kind: string;
  title: string;
  organization?: string | null;
  source?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean | null;
  date?: string | null;
  url?: string | null;
  skills: string[];
  description?: string | null;
}

interface Extraction {
  profile: Record<string, string | null>;
  experiences: ExtractedEntry[];
  evidence: ExtractedEntry[];
}

async function main(): Promise<void> {
  const path = process.argv[2];
  if (!path) throw new Error("usage: tsx test-extract-profile.ts <file>");
  const text = readFileSync(path, "utf8");

  const raw = (await handler(
    // Only `arguments` is read by the handler.
    { arguments: { text } } as Parameters<typeof handler>[0],
    {} as never,
    () => undefined,
  )) as string;

  const result = JSON.parse(raw) as Extraction;

  console.log("=== PROFILE ===");
  for (const [key, value] of Object.entries(result.profile)) {
    console.log(`${key}: ${value ?? "(null)"}`);
  }

  console.log(`\n=== EXPERIENCES (${result.experiences.length}) ===`);
  for (const item of result.experiences) {
    const dates = [item.startDate, item.isCurrent ? "present" : item.endDate]
      .filter(Boolean)
      .join(" to ");
    const bullets = (item.description ?? "").split("\n").filter(Boolean).length;
    console.log(
      `[${item.kind}] ${item.title}${item.organization ? ` @ ${item.organization}` : ""} (${dates || "no dates"}) — ${bullets} bullets, skills: ${item.skills.join(", ") || "none"}`,
    );
  }

  console.log(`\n=== EVIDENCE (${result.evidence.length}) ===`);
  for (const item of result.evidence) {
    console.log(
      `[${item.kind}] ${item.title}${item.source ? ` (${item.source})` : ""}${item.date ? ` ${item.date}` : ""}${item.url ? ` url=${item.url}` : ""}`,
    );
  }
}

void main();
