import { client, unwrap, unwrapRequired } from "@/lib/amplify-client";
import type { Resume } from "@/types/models";

export type ResumeCreateInput = Pick<Resume, "kind" | "label"> &
  Partial<Pick<Resume, "content" | "sourceResumeId">>;

export type ResumeUpdateInput = { id: string } & Partial<
  Pick<Resume, "kind" | "label" | "content" | "sourceResumeId">
>;

export const resumesService = {
  async list(): Promise<Resume[]> {
    const resumes: Resume[] = [];
    let nextToken: string | null | undefined;
    do {
      const result = await client.models.Resume.list({ limit: 200, nextToken });
      resumes.push(...unwrap(result));
      nextToken = result.nextToken;
    } while (nextToken);
    return resumes;
  },

  async get(id: string): Promise<Resume | null> {
    return unwrap(await client.models.Resume.get({ id }));
  },

  async create(input: ResumeCreateInput): Promise<Resume> {
    return unwrapRequired(await client.models.Resume.create(input));
  },

  async update(input: ResumeUpdateInput): Promise<Resume> {
    return unwrapRequired(await client.models.Resume.update(input));
  },

  async remove(id: string): Promise<void> {
    unwrap(await client.models.Resume.delete({ id }));
  },
};
