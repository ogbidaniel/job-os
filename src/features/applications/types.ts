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

/** Badge tint per status (paired light/dark). */
export const APPLICATION_STATUS_CLASSES: Record<ApplicationStatus, string> = {
  SAVED: "bg-secondary text-secondary-foreground",
  DRAFTING: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  APPLIED: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  INTERVIEWING: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  OFFER: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-500/15 text-red-700 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
  GHOSTED: "bg-muted text-muted-foreground",
};
