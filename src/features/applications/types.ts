import type { ApplicationStatus } from "@/types/models";

export const APPLICATION_STATUS_ORDER: readonly ApplicationStatus[] = [
  "SAVED",
  "DRAFTING",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
  "GHOSTED",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  DRAFTING: "Drafting",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  GHOSTED: "Ghosted",
};
