import { isoToDayKey } from "@/lib/dates";
import type { Application, Job } from "@/types/models";
import type { CalendarEvent } from "../types";

/**
 * Flattens jobs and applications into calendar events:
 * - Job.postedAt        → "job-posted"
 * - Application.appliedAt → "applied"
 */
export function buildCalendarEvents(
  jobs: Job[],
  applications: Application[],
): CalendarEvent[] {
  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  const events: CalendarEvent[] = [];

  for (const job of jobs) {
    if (!job.postedAt) continue;
    events.push({
      id: `job-posted:${job.id}`,
      date: isoToDayKey(job.postedAt),
      kind: "job-posted",
      title: `${job.company} — ${job.title}`,
      href: `/jobs/${job.id}`,
    });
  }

  for (const application of applications) {
    if (!application.appliedAt) continue;
    const job = jobsById.get(application.jobId);
    events.push({
      id: `applied:${application.id}`,
      date: isoToDayKey(application.appliedAt),
      kind: "applied",
      title: job ? `${job.company} — ${job.title}` : "Application",
      href: `/applications/${application.id}`,
    });
  }

  return events;
}

/** Groups events by day key for O(1) lookup while rendering the grid. */
export function groupEventsByDay(
  events: CalendarEvent[],
): Map<string, CalendarEvent[]> {
  const byDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const existing = byDay.get(event.date);
    if (existing) existing.push(event);
    else byDay.set(event.date, [event]);
  }
  return byDay;
}
