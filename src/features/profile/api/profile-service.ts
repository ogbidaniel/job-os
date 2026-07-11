import { client, unwrap, unwrapRequired } from "@/lib/amplify-client";
import type {
  Evidence,
  EvidenceKind,
  Experience,
  ExperienceKind,
  Profile,
} from "@/types/models";
import { chunkDocument, mergeExtractions } from "../lib/chunk-document";
import { EVIDENCE_KIND_ORDER, EXPERIENCE_KIND_ORDER } from "../types";

export type ProfileUpdateInput = { id: string } & Partial<
  Pick<
    Profile,
    | "fullName"
    | "headline"
    | "location"
    | "email"
    | "phone"
    | "linkedin"
    | "github"
    | "website"
    | "summary"
  >
>;

export type ExperienceCreateInput = Pick<Experience, "kind" | "title"> &
  Partial<
    Pick<
      Experience,
      | "organization"
      | "location"
      | "startDate"
      | "endDate"
      | "isCurrent"
      | "description"
      | "skills"
    >
  >;
export type ExperienceUpdateInput = { id: string } & Partial<ExperienceCreateInput>;

export type EvidenceCreateInput = Pick<Evidence, "kind" | "title"> &
  Partial<
    Pick<Evidence, "url" | "source" | "date" | "description" | "skills">
  >;
export type EvidenceUpdateInput = { id: string } & Partial<EvidenceCreateInput>;

/** Result of profile-extract.v1 (JSON transported as a string). */
export interface ProfileExtraction {
  profile: {
    fullName: string | null;
    headline: string | null;
    location: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
    summary: string | null;
  };
  experiences: Array<{
    kind: string;
    title: string;
    organization: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean | null;
    description: string | null;
    skills: string[];
  }>;
  evidence: Array<{
    kind: string;
    title: string;
    url: string | null;
    source: string | null;
    date: string | null;
    description: string | null;
    skills: string[];
  }>;
}

export const profileService = {
  /** The Profile is a singleton by convention: get-or-create the record. */
  async getOrCreate(): Promise<Profile> {
    const existing = unwrap(await client.models.Profile.list({ limit: 1 }));
    if (existing.length > 0) return existing[0];
    return unwrapRequired(await client.models.Profile.create({}));
  },

  async update(input: ProfileUpdateInput): Promise<Profile> {
    return unwrapRequired(await client.models.Profile.update(input));
  },

  /**
   * Chunked extraction: AppSync caps a single query at 30s, which a full
   * master document blows past. Sections are extracted in parallel and
   * merged (see lib/chunk-document.ts).
   */
  async extractFromText(text: string): Promise<ProfileExtraction> {
    const chunks = chunkDocument(text);
    const parts = await Promise.all(
      chunks.map(async (chunk) => {
        const raw = unwrapRequired(
          await client.queries.extractProfile({ text: chunk }),
        );
        return JSON.parse(raw) as ProfileExtraction;
      }),
    );
    return mergeExtractions(parts);
  },

  /** Bulk-creates the reviewed selection from a profile extraction. */
  async importSelected(options: {
    profileId: string;
    extraction: ProfileExtraction;
    includeAbout: boolean;
    experienceIndexes: ReadonlySet<number>;
    evidenceIndexes: ReadonlySet<number>;
  }): Promise<{ about: boolean; experiences: number; evidence: number }> {
    const { profileId, extraction } = options;
    const tasks: Array<Promise<unknown>> = [];

    if (options.includeAbout) {
      const p = extraction.profile;
      tasks.push(
        this.update({
          id: profileId,
          fullName: p.fullName,
          headline: p.headline,
          location: p.location,
          email: p.email,
          phone: p.phone,
          linkedin: sanitizeUrl(p.linkedin),
          github: sanitizeUrl(p.github),
          website: sanitizeUrl(p.website),
          summary: p.summary,
        }),
      );
    }

    const experiences = extraction.experiences.filter((_, index) =>
      options.experienceIndexes.has(index),
    );
    for (const item of experiences) {
      tasks.push(
        experiencesService.create({
          kind: coerceExperienceKind(item.kind),
          title: item.title,
          organization: item.organization,
          location: item.location,
          startDate: sanitizeDate(item.startDate),
          endDate: sanitizeDate(item.endDate),
          isCurrent: item.isCurrent ?? false,
          description: item.description,
          skills: item.skills,
        }),
      );
    }

    const evidence = extraction.evidence.filter((_, index) =>
      options.evidenceIndexes.has(index),
    );
    for (const item of evidence) {
      tasks.push(
        evidenceService.create({
          kind: coerceEvidenceKind(item.kind),
          title: item.title,
          url: sanitizeUrl(item.url),
          source: item.source,
          date: sanitizeDate(item.date),
          description: item.description,
          skills: item.skills,
        }),
      );
    }

    await Promise.all(tasks);
    return {
      about: options.includeAbout,
      experiences: experiences.length,
      evidence: evidence.length,
    };
  },
};

function coerceExperienceKind(value: string): ExperienceKind {
  return (EXPERIENCE_KIND_ORDER as readonly string[]).includes(value)
    ? (value as ExperienceKind)
    : "OTHER";
}

function coerceEvidenceKind(value: string): EvidenceKind {
  return (EVIDENCE_KIND_ORDER as readonly string[]).includes(value)
    ? (value as EvidenceKind)
    : "OTHER";
}

/** AWSURL rejects bare domains; only pass through http(s) URLs. */
function sanitizeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}([/?].*)?$/i.test(value)) return `https://${value}`;
  return null;
}

/** AWSDate requires YYYY-MM-DD. */
function sanitizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export const experiencesService = {
  async list(): Promise<Experience[]> {
    const items: Experience[] = [];
    let nextToken: string | null | undefined;
    do {
      const result = await client.models.Experience.list({
        limit: 200,
        nextToken,
      });
      items.push(...unwrap(result));
      nextToken = result.nextToken;
    } while (nextToken);
    return items;
  },

  async create(input: ExperienceCreateInput): Promise<Experience> {
    return unwrapRequired(await client.models.Experience.create(input));
  },

  async update(input: ExperienceUpdateInput): Promise<Experience> {
    return unwrapRequired(await client.models.Experience.update(input));
  },

  async remove(id: string): Promise<void> {
    unwrap(await client.models.Experience.delete({ id }));
  },
};

export const evidenceService = {
  async list(): Promise<Evidence[]> {
    const items: Evidence[] = [];
    let nextToken: string | null | undefined;
    do {
      const result = await client.models.Evidence.list({
        limit: 200,
        nextToken,
      });
      items.push(...unwrap(result));
      nextToken = result.nextToken;
    } while (nextToken);
    return items;
  },

  async create(input: EvidenceCreateInput): Promise<Evidence> {
    return unwrapRequired(await client.models.Evidence.create(input));
  },

  async update(input: EvidenceUpdateInput): Promise<Evidence> {
    return unwrapRequired(await client.models.Evidence.update(input));
  },

  async remove(id: string): Promise<void> {
    unwrap(await client.models.Evidence.delete({ id }));
  },
};
