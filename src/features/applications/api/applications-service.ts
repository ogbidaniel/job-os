import { client, unwrap, unwrapRequired } from "@/lib/amplify-client";
import type { Application } from "@/types/models";

export type ApplicationCreateInput = { jobId: string } & Partial<
  Pick<
    Application,
    "status" | "appliedAt" | "notes" | "resumeId" | "coverLetterId" | "recruiterId"
  >
>;

export type ApplicationUpdateInput = { id: string } & Partial<
  Pick<
    Application,
    | "status"
    | "appliedAt"
    | "notes"
    | "jobId"
    | "resumeId"
    | "coverLetterId"
    | "recruiterId"
  >
>;

export const applicationsService = {
  async list(): Promise<Application[]> {
    const applications: Application[] = [];
    let nextToken: string | null | undefined;
    do {
      const result = await client.models.Application.list({
        limit: 200,
        nextToken,
      });
      applications.push(...unwrap(result));
      nextToken = result.nextToken;
    } while (nextToken);
    return applications;
  },

  async get(id: string): Promise<Application | null> {
    return unwrap(await client.models.Application.get({ id }));
  },

  async create(input: ApplicationCreateInput): Promise<Application> {
    return unwrapRequired(
      await client.models.Application.create({ status: "SAVED", ...input }),
    );
  },

  /**
   * Moving to APPLIED stamps appliedAt (once, still user-editable) so the
   * calendar and dashboard reflect when the application was submitted.
   */
  async update(input: ApplicationUpdateInput): Promise<Application> {
    let patch = input;
    if (input.status === "APPLIED" && input.appliedAt === undefined) {
      const current = await this.get(input.id);
      if (current && !current.appliedAt) {
        patch = { ...input, appliedAt: new Date().toISOString() };
      }
    }
    return unwrapRequired(await client.models.Application.update(patch));
  },

  async remove(id: string): Promise<void> {
    unwrap(await client.models.Application.delete({ id }));
  },
};
