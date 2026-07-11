/**
 * Local dry-run of the chunked profile extraction against a real
 * document: chunks like the client does, invokes the real Lambda handler
 * per chunk (sequentially, with timings), merges like the client does.
 * Requires GEMINI_API_KEY in the environment and a file path argument.
 * Run with: npx tsx scripts/test-extract-profile.ts <file>
 */
import { readFileSync } from "node:fs";
import { handler } from "../amplify/functions/extract-profile/handler";
import {
  chunkDocument,
  mergeExtractions,
} from "../src/features/profile/lib/chunk-document";
import type { ProfileExtraction } from "../src/features/profile/api/profile-service";

async function main(): Promise<void> {
  const path = process.argv[2];
  if (!path) throw new Error("usage: tsx test-extract-profile.ts <file>");
  const text = readFileSync(path, "utf8");

  const chunks = chunkDocument(text);
  console.log(
    `document: ${text.length} chars -> ${chunks.length} chunks (${chunks
      .map((chunk) => chunk.length)
      .join(", ")} chars)`,
  );

  const parts: ProfileExtraction[] = [];
  for (const [index, chunk] of chunks.entries()) {
    const startedAt = Date.now();
    const raw = (await handler(
      { arguments: { text: chunk } } as Parameters<typeof handler>[0],
      {} as never,
      () => undefined,
    )) as string;
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    const part = JSON.parse(raw) as ProfileExtraction;
    parts.push(part);
    console.log(
      `chunk ${index + 1}/${chunks.length}: ${seconds}s — ${part.experiences.length} experiences, ${part.evidence.length} evidence`,
    );
  }

  const result = mergeExtractions(parts);

  console.log("\n=== MERGED PROFILE ===");
  for (const [key, value] of Object.entries(result.profile)) {
    console.log(`${key}: ${value ?? "(null)"}`);
  }

  console.log(`\n=== MERGED EXPERIENCES (${result.experiences.length}) ===`);
  for (const item of result.experiences) {
    const dates = [item.startDate, item.isCurrent ? "present" : item.endDate]
      .filter(Boolean)
      .join(" to ");
    const bullets = (item.description ?? "").split("\n").filter(Boolean).length;
    console.log(
      `[${item.kind}] ${item.title}${item.organization ? ` @ ${item.organization}` : ""} (${dates || "no dates"}) — ${bullets} bullets`,
    );
  }

  console.log(`\n=== MERGED EVIDENCE (${result.evidence.length}) ===`);
  for (const item of result.evidence) {
    console.log(
      `[${item.kind}] ${item.title}${item.source ? ` (${item.source})` : ""}${item.url ? ` url=${item.url}` : ""}`,
    );
  }
}

void main();
