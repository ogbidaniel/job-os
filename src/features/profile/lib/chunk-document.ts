import type { ProfileExtraction } from "../api/profile-service";

/**
 * AppSync hard-caps queries at 30s, so a full master document can't be
 * extracted in one call. We split on section boundaries, extract chunks
 * in parallel, and merge — each chunk's output is small enough to finish
 * comfortably within the limit.
 */

const SECTION_START = /^(#{1,3} |---\s*$)/;

// 3500 keeps the slowest chunk (~15s of verbatim output) safely inside
// AppSync's 30s cap, with room for one transient-error retry.
export function chunkDocument(text: string, maxChars = 3500): string[] {
  const lines = text.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (SECTION_START.test(line) && current.length > 0) {
      sections.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push(current.join("\n"));

  const chunks: string[] = [];
  let buffer = "";
  for (const section of sections) {
    if (buffer && buffer.length + section.length > maxChars) {
      chunks.push(buffer);
      buffer = section;
    } else {
      buffer = buffer ? `${buffer}\n${section}` : section;
    }
  }
  if (buffer.trim()) chunks.push(buffer);

  return chunks.length > 0 ? chunks : [text];
}

function firstNonNull(
  values: Array<string | null | undefined>,
): string | null {
  for (const value of values) {
    if (value) return value;
  }
  return null;
}

export function mergeExtractions(
  parts: ProfileExtraction[],
): ProfileExtraction {
  const profileKeys = [
    "fullName",
    "headline",
    "location",
    "email",
    "phone",
    "linkedin",
    "github",
    "website",
    "summary",
  ] as const;

  const profile = {} as ProfileExtraction["profile"];
  for (const key of profileKeys) {
    profile[key] = firstNonNull(parts.map((part) => part.profile?.[key]));
  }

  const seenExperiences = new Set<string>();
  const experiences: ProfileExtraction["experiences"] = [];
  for (const part of parts) {
    for (const item of part.experiences ?? []) {
      const dedupeKey = `${item.kind}:${item.title.trim().toLowerCase()}`;
      if (seenExperiences.has(dedupeKey)) continue;
      seenExperiences.add(dedupeKey);
      experiences.push(item);
    }
  }

  const seenEvidence = new Set<string>();
  const evidence: ProfileExtraction["evidence"] = [];
  for (const part of parts) {
    for (const item of part.evidence ?? []) {
      const dedupeKey = `${item.kind}:${item.title.trim().toLowerCase()}`;
      if (seenEvidence.has(dedupeKey)) continue;
      seenEvidence.add(dedupeKey);
      evidence.push(item);
    }
  }

  return { profile, experiences, evidence };
}
