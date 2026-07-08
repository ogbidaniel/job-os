import type { JobStatus } from "@/types/models";

export const JOB_STATUS_ORDER: readonly JobStatus[] = [
  "NEW",
  "REVIEWED",
  "CLOSED",
  "ARCHIVED",
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  NEW: "New",
  REVIEWED: "Reviewed",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};
