/**
 * Central query-key factory. All TanStack Query hooks must build their
 * keys from here so cache invalidation stays consistent across features.
 */
export const queryKeys = {
  jobs: {
    all: ["jobs"] as const,
    detail: (id: string) => ["jobs", id] as const,
  },
  applications: {
    all: ["applications"] as const,
    detail: (id: string) => ["applications", id] as const,
  },
  resumes: {
    all: ["resumes"] as const,
    detail: (id: string) => ["resumes", id] as const,
  },
  coverLetters: {
    all: ["cover-letters"] as const,
    detail: (id: string) => ["cover-letters", id] as const,
  },
  recruiters: {
    all: ["recruiters"] as const,
    detail: (id: string) => ["recruiters", id] as const,
  },
  dashboard: {
    counts: ["dashboard", "counts"] as const,
  },
} as const;
