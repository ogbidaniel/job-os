export type CalendarEventKind = "job-posted" | "applied";

export interface CalendarEvent {
  id: string;
  /** Local calendar day, "yyyy-MM-dd". */
  date: string;
  kind: CalendarEventKind;
  title: string;
  href: string;
}

export const CALENDAR_EVENT_KIND_LABELS: Record<CalendarEventKind, string> = {
  "job-posted": "Job posted",
  applied: "Applied",
};

/** Chip tint per event kind (paired light/dark). */
export const CALENDAR_EVENT_KIND_CLASSES: Record<CalendarEventKind, string> = {
  "job-posted": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  applied: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};
