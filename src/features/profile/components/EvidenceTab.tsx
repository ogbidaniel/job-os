import { useState } from "react";
import { Award, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/EmptyState";
import type { Evidence } from "@/types/models";
import { useDeleteEvidence, useEvidenceItems } from "../hooks/use-profile";
import { EVIDENCE_KIND_LABELS } from "../types";
import { EvidenceDialog } from "./EvidenceDialog";

export function EvidenceTab() {
  const { data: evidence, isLoading } = useEvidenceItems();
  const deleteEvidence = useDeleteEvidence();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Evidence | undefined>(undefined);

  if (isLoading) {
    return <Skeleton className="h-60 w-full" />;
  }

  const sorted = [...(evidence ?? [])].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );

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
          Add evidence
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No evidence yet"
          description="Certificates, papers, videos, posts, recommendations — anything verifiable you can point a resume at."
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
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 inline-flex items-center align-middle text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                          <span className="sr-only">Open link</span>
                        </a>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="mr-2">
                        {EVIDENCE_KIND_LABELS[item.kind]}
                      </Badge>
                      {[item.source, item.date].filter(Boolean).join(" · ")}
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
                      onClick={() => deleteEvidence.mutate(item.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                {item.description ? (
                  <p className="mt-2 text-sm leading-6">{item.description}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EvidenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        evidence={editing}
      />
    </div>
  );
}
