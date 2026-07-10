import { format } from "date-fns";
import { client, unwrap, unwrapRequired } from "@/lib/amplify-client";
import type { Job } from "@/types/models";

/** Result of job-extract.v3 (JSON transported as a string). */
export interface JobExtraction {
  company: string | null;
  title: string | null;
  location: string | null;
  salary: string | null;
  summary: string | null;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  description: string | null;
  applicationUrl: string | null;
  postedAt: string | null;
  sourceSite: string | null;
}

/** Result of fit-score.v1 (also stored on Job.fitReport as JSON). */
export interface FitReport {
  score: number;
  summary: string;
  matchedSkills: string[];
  gaps: string[];
}

export type JobCreateInput = Pick<Job, "company" | "title"> &
  Partial<
    Pick<
      Job,
      | "description"
      | "requirements"
      | "location"
      | "salary"
      | "applicationUrl"
      | "sourceUrl"
      | "postedAt"
      | "status"
      | "summary"
      | "responsibilities"
      | "requiredSkills"
      | "preferredSkills"
      | "sourceSite"
      | "rawPosting"
      | "fitScore"
      | "fitReport"
    >
  >;

export type JobUpdateInput = { id: string } & Partial<JobCreateInput>;

export const jobsService = {
  async list(): Promise<Job[]> {
    const jobs: Job[] = [];
    let nextToken: string | null | undefined;
    do {
      const result = await client.models.Job.list({ limit: 200, nextToken });
      jobs.push(...unwrap(result));
      nextToken = result.nextToken;
    } while (nextToken);
    return jobs;
  },

  async get(id: string): Promise<Job | null> {
    return unwrap(await client.models.Job.get({ id }));
  },

  async create(input: JobCreateInput): Promise<Job> {
    return unwrapRequired(
      await client.models.Job.create({ status: "NEW", ...input }),
    );
  },

  async update(input: JobUpdateInput): Promise<Job> {
    return unwrapRequired(await client.models.Job.update(input));
  },

  async remove(id: string): Promise<void> {
    unwrap(await client.models.Job.delete({ id }));
  },

  /** AI extraction (Gemini behind an Amplify Function; key never in browser). */
  async extractFromText(text: string): Promise<JobExtraction> {
    const raw = unwrapRequired(
      await client.queries.extractJob({
        text,
        // Local calendar date so "posted 3 days ago" resolves in the
        // user's timezone, not the Lambda's UTC.
        today: format(new Date(), "yyyy-MM-dd"),
      }),
    );
    return JSON.parse(raw) as JobExtraction;
  },

  /** AI fit scoring against the user's profile. */
  async scoreFit(
    jobContext: string,
    profileContext: string,
  ): Promise<FitReport> {
    const raw = unwrapRequired(
      await client.queries.scoreFit({ jobContext, profileContext }),
    );
    return JSON.parse(raw) as FitReport;
  },
};
