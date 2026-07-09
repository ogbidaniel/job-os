import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResumeEditor } from "../components/ResumeEditor";
import {
  useDeleteResume,
  useResume,
  useUpdateResume,
} from "../hooks/use-resumes";
import { RESUME_KIND_LABELS } from "../types";

export function ResumeDetailPage() {
  const { resumeId } = useParams<"resumeId">();
  const navigate = useNavigate();
  const { data: resume, isLoading } = useResume(resumeId);
  const updateResume = useUpdateResume();
  const deleteResume = useDeleteResume();
  // null = untouched; string = unsaved label draft.
  const [draftLabel, setDraftLabel] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!resume) {
    return (
      <EmptyState
        icon={FileText}
        title="Resume not found"
        description="It may have been deleted."
        action={
          <Button onClick={() => navigate("/resumes")}>Back to Resumes</Button>
        }
      />
    );
  }

  const labelValue = draftLabel ?? resume.label;

  function handleSaveLabel() {
    if (!labelValue.trim()) return;
    updateResume.mutate(
      { id: resume!.id, label: labelValue.trim() },
      { onSuccess: () => setDraftLabel(null) },
    );
  }

  function handleDelete() {
    deleteResume.mutate(resume!.id, {
      onSuccess: () => navigate("/resumes"),
    });
  }

  return (
    <>
      <PageHeader
        title={resume.label}
        description="Edit the text, then copy or download it for your Word template."
        actions={
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="w-full max-w-sm space-y-1">
          <span className="text-sm text-muted-foreground">Label</span>
          <Input
            value={labelValue}
            onChange={(event) => setDraftLabel(event.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSaveLabel}
          disabled={
            updateResume.isPending ||
            draftLabel === null ||
            draftLabel.trim() === resume.label ||
            !draftLabel.trim()
          }
        >
          Rename
        </Button>
        <Badge variant="secondary" className="mb-2">
          {RESUME_KIND_LABELS[resume.kind]}
        </Badge>
      </div>

      <ResumeEditor resume={resume} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this resume?</DialogTitle>
            <DialogDescription>
              “{resume.label}” will be permanently deleted. Applications that
              reference it keep working but lose the attachment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteResume.isPending}
            >
              Delete resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
