import { useMemo, useState } from "react";
import { Link } from "react-router";
import { addMonths, format, parseISO, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { useJobs } from "@/features/jobs/hooks/use-jobs";
import { useApplications } from "@/features/applications/hooks/use-applications";
import { MonthGrid } from "../components/MonthGrid";
import { buildCalendarEvents, groupEventsByDay } from "../lib/build-events";
import {
  CALENDAR_EVENT_KIND_CLASSES,
  CALENDAR_EVENT_KIND_LABELS,
} from "../types";

export function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const jobs = useJobs();
  const applications = useApplications();
  const isLoading = jobs.isLoading || applications.isLoading;

  const eventsByDay = useMemo(
    () =>
      groupEventsByDay(
        buildCalendarEvents(jobs.data ?? [], applications.data ?? []),
      ),
    [jobs.data, applications.data],
  );

  const selectedEvents = selectedDay
    ? (eventsByDay.get(selectedDay) ?? [])
    : [];

  return (
    <>
      <PageHeader
        title="Calendar"
        description="When jobs were posted and when you applied."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft className="size-4" aria-hidden />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setMonth(startOfMonth(new Date()))}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight className="size-4" aria-hidden />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        }
      />

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium">{format(month, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          {(Object.keys(CALENDAR_EVENT_KIND_LABELS) as Array<
            keyof typeof CALENDAR_EVENT_KIND_LABELS
          >).map((kind) => (
            <Badge
              key={kind}
              className={cn("border-transparent", CALENDAR_EVENT_KIND_CLASSES[kind])}
            >
              {CALENDAR_EVENT_KIND_LABELS[kind]}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[36rem] w-full" />
      ) : (
        <MonthGrid
          month={month}
          eventsByDay={eventsByDay}
          selectedDay={selectedDay}
          onSelectDay={(dayKey) =>
            setSelectedDay((current) => (current === dayKey ? null : dayKey))
          }
        />
      )}

      {selectedDay ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">
              {format(parseISO(selectedDay), "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing happened on this day.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map((event) => (
                  <li key={event.id} className="flex items-center gap-2 text-sm">
                    <Badge
                      className={cn(
                        "border-transparent",
                        CALENDAR_EVENT_KIND_CLASSES[event.kind],
                      )}
                    >
                      {CALENDAR_EVENT_KIND_LABELS[event.kind]}
                    </Badge>
                    <Link to={event.href} className="font-medium hover:underline">
                      {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
