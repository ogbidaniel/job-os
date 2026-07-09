import {
  addDays,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../types";
import { CALENDAR_EVENT_KIND_CLASSES } from "../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 3;

interface MonthGridProps {
  month: Date;
  eventsByDay: Map<string, CalendarEvent[]>;
  selectedDay: string | null;
  onSelectDay: (dayKey: string) => void;
}

export function MonthGrid({
  month,
  eventsByDay,
  selectedDay,
  onSelectDay,
}: MonthGridProps) {
  const gridStart = startOfWeek(startOfMonth(month));
  const days = Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index),
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const events = eventsByDay.get(dayKey) ?? [];
          const inMonth = isSameMonth(day, month);
          const selected = selectedDay === dayKey;

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onSelectDay(dayKey)}
              className={cn(
                "flex min-h-24 flex-col items-stretch gap-1 border-t border-l p-1.5 text-left align-top transition-colors first:border-l-0 hover:bg-accent/50",
                "[&:nth-child(7n+1)]:border-l-0 [&:nth-child(-n+7)]:border-t-0",
                !inMonth && "bg-muted/30",
                selected && "bg-accent",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs",
                  !inMonth && "text-muted-foreground/60",
                  isToday(day) && "bg-primary font-semibold text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <span className="flex flex-col gap-0.5">
                {events.slice(0, MAX_CHIPS_PER_DAY).map((event) => (
                  <span
                    key={event.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-xs",
                      CALENDAR_EVENT_KIND_CLASSES[event.kind],
                    )}
                  >
                    {event.title}
                  </span>
                ))}
                {events.length > MAX_CHIPS_PER_DAY ? (
                  <span className="px-1 text-xs text-muted-foreground">
                    +{events.length - MAX_CHIPS_PER_DAY} more
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
