import { useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/EmptyState";
import type { Experience } from "@/types/models";
import { useDeleteExperience, useExperiences } from "../hooks/use-profile";
import { skillsToInput } from "../lib/skills";
import { EXPERIENCE_KIND_LABELS } from "../types";
import { ExperienceDialog } from "./ExperienceDialog";

function sortExperiences(items: Experience[]): Experience[] {
  return [...items].sort((a, b) => {
    if ((b.isCurrent ? 1 : 0) !== (a.isCurrent ? 1 : 0)) {
      return (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0);
    }
    return (b.startDate ?? "").localeCompare(a.startDate ?? "");
  });
}

function dateRange(item: Experience): string {
  const start = item.startDate ?? "";
  const end = item.isCurrent ? "Present" : (item.endDate ?? "");
  if (!start && !end) return "";
  return [start, end].filter(Boolean).join(" — ");
}

export function ExperienceTab() {
  const { data: experiences, isLoading } = useExperiences();
  const deleteExperience = useDeleteExperience();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | undefined>(undefined);

  if (isLoading) {
    return <Skeleton className="h-60 w-full" />;
  }

  const sorted = sortExperiences(experiences ?? []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden />
          Add experience
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No experience entries yet"
          description="Add entries as you do things — or use Import to load your master document."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.title}
                      {item.organization ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {item.organization}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="mr-2">
                        {EXPERIENCE_KIND_LABELS[item.kind]}
                      </Badge>
                      {dateRange(item)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(item);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExperience.mutate(item.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                {item.description ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
                    {item.description
                      .split("\n")
                      .filter(Boolean)
                      .map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                  </ul>
                ) : null}
                {skillsToInput(item.skills) ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {skillsToInput(item.skills)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExperienceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        experience={editing}
      />
    </div>
  );
}
