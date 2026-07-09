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

export type JobStatus = NonNullable<Job["status"]>;
export type ApplicationStatus = NonNullable<Application["status"]>;
export type DocumentKind = NonNullable<Resume["kind"]>;

/** Result of the AI job extraction query (fields null when absent). */
export type JobExtraction = Schema["JobExtraction"]["type"];
