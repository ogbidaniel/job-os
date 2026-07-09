import { format } from "date-fns";
import { client, unwrap, unwrapRequired } from "@/lib/amplify-client";
import type { Job, JobExtraction } from "@/types/models";

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
    return unwrapRequired(
      await client.queries.extractJob({
        text,
        // Local calendar date so "posted 3 days ago" resolves in the
        // user's timezone, not the Lambda's UTC.
        today: format(new Date(), "yyyy-MM-dd"),
      }),
    );
  },
};
