import type { Evidence, Experience, Profile } from "@/types/models";

function cleanSkills(
  skills: ReadonlyArray<string | null> | null | undefined,
): string[] {
  return (skills ?? []).filter((skill): skill is string => Boolean(skill));
}

/** True when there is enough profile content to score against. */
export function hasProfileContent(
  experiences: Experience[] | undefined,
  evidence: Evidence[] | undefined,
): boolean {
  return (experiences?.length ?? 0) + (evidence?.length ?? 0) > 0;
}

/**
 * Compiles the profile vault into the plain-text candidate context sent
 * to the fit-score (and later resume-generation) prompts.
 */
export function buildProfileContext(
  profile: Profile | undefined,
  experiences: Experience[],
  evidence: Evidence[],
): string {
  const lines: string[] = [];

  if (profile) {
    if (profile.fullName) lines.push(`NAME: ${profile.fullName}`);
    if (profile.headline) lines.push(`HEADLINE: ${profile.headline}`);
    if (profile.location) lines.push(`LOCATION: ${profile.location}`);
    if (profile.summary) lines.push(`SUMMARY: ${profile.summary}`);
  }

  if (experiences.length > 0) {
    lines.push("", "EXPERIENCE:");
    for (const item of experiences) {
      const dates = [item.startDate, item.isCurrent ? "present" : item.endDate]
        .filter(Boolean)
        .join(" to ");
      const header = [
        `- [${item.kind}] ${item.title}`,
        item.organization ? `at ${item.organization}` : null,
        dates ? `(${dates})` : null,
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(header);
      if (item.description) {
        for (const bullet of item.description.split("\n").filter(Boolean)) {
          lines.push(`  * ${bullet}`);
        }
      }
      const skills = cleanSkills(item.skills);
      if (skills.length > 0) lines.push(`  skills: ${skills.join(", ")}`);
    }
  }

  if (evidence.length > 0) {
    lines.push("", "EVIDENCE (verifiable artifacts):");
    for (const item of evidence) {
      const header = [
        `- [${item.kind}] ${item.title}`,
        item.source ? `(${item.source})` : null,
        item.date ? item.date : null,
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(header);
      if (item.description) lines.push(`  ${item.description}`);
      if (item.url) lines.push(`  url: ${item.url}`);
      const skills = cleanSkills(item.skills);
      if (skills.length > 0) lines.push(`  skills: ${skills.join(", ")}`);
    }
  }

  return lines.join("\n");
}
