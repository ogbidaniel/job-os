import { client, unwrap, unwrapRequired } from "@/lib/amplify-client";
import type { Resume } from "@/types/models";

export type ResumeCreateInput = Pick<Resume, "kind" | "label"> &
  Partial<Pick<Resume, "content" | "sourceResumeId">>;

export type ResumeUpdateInput = { id: string } & Partial<
  Pick<Resume, "kind" | "label" | "content" | "sourceResumeId">
>;

/** compileLatex transport result. */
export type CompileResult =
  | { pdfBase64: string }
  | { error: string; log: string };

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

  /** Category resumes are keyed by label; created on first visit. */
  async getOrCreateByLabel(
    label: string,
    defaultContent: string,
  ): Promise<Resume> {
    const all = await this.list();
    const existing = all.find((resume) => resume.label === label);
    if (existing) return existing;
    return this.create({ kind: "MASTER", label, content: defaultContent });
  },

  /** LaTeX → PDF via the compile-latex Lambda proxy. */
  async compile(source: string): Promise<CompileResult> {
    const raw = unwrapRequired(await client.queries.compileLatex({ source }));
    return JSON.parse(raw) as CompileResult;
  },
};
