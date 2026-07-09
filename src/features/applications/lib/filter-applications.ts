import type { ApplicationStatus } from "@/types/models";
import type { ApplicationWithJob } from "../hooks/use-applications";

export interface ApplicationFilters {
  query: string;
  status: ApplicationStatus | "ALL";
}

export function filterApplications(
  rows: ApplicationWithJob[],
  filters: ApplicationFilters,
): ApplicationWithJob[] {
  const query = filters.query.trim().toLowerCase();
  return rows.filter(({ application, job }) => {
    if (filters.status !== "ALL" && application.status !== filters.status) {
      return false;
    }
    if (!query) return true;
    return [job?.company, job?.title, application.notes]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(query));
  });
}
