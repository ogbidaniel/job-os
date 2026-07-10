import type { Schema } from "../../amplify/data/resource";

/**
 * Entity types re-exported from the Amplify schema so features never
 * import the amplify/ path directly.
 */
export type Job = Schema["Job"]["type"];
export type Application = Schema["Application"]["type"];
export type Resume = Schema["Resume"]["type"];
export type CoverLetter = Schema["CoverLetter"]["type"];
export type Recruiter = Schema["Recruiter"]["type"];
export type Experience = Schema["Experience"]["type"];
export type Evidence = Schema["Evidence"]["type"];
export type Profile = Schema["Profile"]["type"];

export type JobStatus = NonNullable<Job["status"]>;
export type ApplicationStatus = NonNullable<Application["status"]>;
export type DocumentKind = NonNullable<Resume["kind"]>;
export type ExperienceKind = NonNullable<Experience["kind"]>;
export type EvidenceKind = NonNullable<Evidence["kind"]>;
