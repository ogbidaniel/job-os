import { useMemo } from "react";
import { useApplications } from "@/features/applications/hooks/use-applications";

export interface DashboardCounts {
  applications: number;
  applied: number;
  assessments: number;
  interviews: number;
  offers: number;
}

export function useDashboardCounts() {
  const { data: applications, isLoading } = useApplications();

  const counts = useMemo<DashboardCounts | undefined>(() => {
    if (!applications) return undefined;
    return {
      applications: applications.length,
      applied: applications.filter((a) => Boolean(a.appliedAt)).length,
      assessments: applications.filter((a) => a.status === "ASSESSMENT").length,
      interviews: applications.filter((a) => a.status === "INTERVIEWING").length,
      offers: applications.filter((a) => a.status === "OFFER").length,
    };
  }, [applications]);

  return { counts, isLoading };
}
