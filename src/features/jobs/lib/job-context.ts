import type { Job } from "@/types/models";

function cleanList(
  items: ReadonlyArray<string | null> | null | undefined,
): string[] {
  return (items ?? []).filter((item): item is string => Boolean(item));
}

/** Compiles a job into the plain-text context sent to the fit-score prompt. */
export function buildJobContext(job: Job): string {
  const lines: string[] = [`TITLE: ${job.title}`, `COMPANY: ${job.company}`];
  if (job.location) lines.push(`LOCATION: ${job.location}`);
  if (job.summary) lines.push(`ABOUT: ${job.summary}`);

  const responsibilities = cleanList(job.responsibilities);
  if (responsibilities.length > 0) {
    lines.push("", "RESPONSIBILITIES:");
    for (const item of responsibilities) lines.push(`- ${item}`);
  }
  const required = cleanList(job.requiredSkills);
  if (required.length > 0) {
    lines.push("", "REQUIRED:");
    for (const item of required) lines.push(`- ${item}`);
  }
  const preferred = cleanList(job.preferredSkills);
  if (preferred.length > 0) {
    lines.push("", "PREFERRED:");
    for (const item of preferred) lines.push(`- ${item}`);
  }

  // Legacy records without structured fields: fall back to raw text.
  if (responsibilities.length === 0 && required.length === 0) {
    const body = job.description ?? job.requirements;
    if (body) lines.push("", "POSTING TEXT:", body.slice(0, 6000));
  }

  return lines.join("\n");
}

/** Long multi-city location strings → first N + "+n more". */
export function condenseLocation(
  location: string | null | undefined,
  max = 3,
): { display: string; full: string } {
  if (!location) return { display: "", full: "" };
  const parts = location
    .split(/;|·/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= max) return { display: location, full: location };
  return {
    display: `${parts.slice(0, max).join("; ")} +${parts.length - max} more`,
    full: parts.join("; "),
  };
}

/** Color classes for a fit score badge/number. */
export function fitScoreClasses(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function fitScoreBadgeClasses(score: number): string {
  if (score >= 75) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (score >= 50) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-red-500/15 text-red-700 dark:text-red-300";
}
