import { format, parseISO } from "date-fns";

/** ISO datetime (AWSDateTime) → value for <input type="date">. */
export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return format(parseISO(iso), "yyyy-MM-dd");
}

/** <input type="date"> value → ISO datetime, or null when empty. */
export function dateInputToIso(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toISOString();
}

/** ISO datetime → local calendar-day key ("yyyy-MM-dd"). */
export function isoToDayKey(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

/** Human display for an ISO datetime, or a dash when absent. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(parseISO(iso), "MMM d, yyyy");
}
