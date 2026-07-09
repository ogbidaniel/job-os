import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentKind, Resume } from "@/types/models";
import { useCreateResume } from "../hooks/use-resumes";
import { RESUME_KIND_LABELS } from "../types";

interface NewResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the created resume (used by the workspace to auto-attach). */
  onCreated?: (resume: Resume) => void;
}

export function NewResumeDialog({
  open,
  onOpenChange,
  onCreated,
}: NewResumeDialogProps) {
  const createResume = useCreateResume();
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<DocumentKind>("MASTER");
  const [content, setContent] = useState("");

  function handleCreate() {
    createResume.mutate(
      { label: label.trim(), kind, content: content || null },
      {
        onSuccess: (resume) => {
          onOpenChange(false);
          setLabel("");
          setKind("MASTER");
          setContent("");
          onCreated?.(resume);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New resume</DialogTitle>
          <DialogDescription>
            Paste your resume text. Masters are your source resumes; tailored
            copies are per-application versions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resume-label">Label</Label>
              <Input
                id="resume-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Master — ML Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Kind</Label>
              <Select
                value={kind}
                onValueChange={(value) => setKind(value as DocumentKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RESUME_KIND_LABELS) as DocumentKind[]).map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {RESUME_KIND_LABELS[value]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume-content">Resume text</Label>
            <Textarea
              id="resume-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={14}
              className="font-mono text-sm"
              placeholder="Paste the full resume text here…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!label.trim() || createResume.isPending}
          >
            Save resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
