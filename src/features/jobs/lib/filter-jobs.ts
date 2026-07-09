import type { Job, JobStatus } from "@/types/models";

export interface JobFilters {
  query: string;
  status: JobStatus | "ALL";
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const query = filters.query.trim().toLowerCase();
  return jobs.filter((job) => {
    if (filters.status !== "ALL" && job.status !== filters.status) {
      return false;
    }
    if (!query) return true;
    return [job.company, job.title, job.location]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(query));
  });
}
