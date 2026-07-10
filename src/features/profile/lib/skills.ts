/** Comma-separated input ↔ skills array. */
export function skillsToInput(
  skills: ReadonlyArray<string | null> | null | undefined,
): string {
  return (skills ?? [])
    .filter((skill): skill is string => Boolean(skill))
    .join(", ");
}

export function inputToSkills(value: string): string[] | null {
  const skills = value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  return skills.length > 0 ? skills : null;
}
