import { useEffect, useState } from "react";
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
import type { Evidence, EvidenceKind } from "@/types/models";
import { useCreateEvidence, useUpdateEvidence } from "../hooks/use-profile";
import { inputToSkills, skillsToInput } from "../lib/skills";
import { EVIDENCE_KIND_LABELS, EVIDENCE_KIND_ORDER } from "../types";

interface EvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this item instead of creating one. */
  evidence?: Evidence;
}

interface DraftState {
  kind: EvidenceKind;
  title: string;
  url: string;
  source: string;
  date: string;
  description: string;
  skills: string;
}

const emptyDraft: DraftState = {
  kind: "CERTIFICATE",
  title: "",
  url: "",
  source: "",
  date: "",
  description: "",
  skills: "",
};

function toDraft(evidence: Evidence): DraftState {
  return {
    kind: evidence.kind,
    title: evidence.title,
    url: evidence.url ?? "",
    source: evidence.source ?? "",
    date: evidence.date ?? "",
    description: evidence.description ?? "",
    skills: skillsToInput(evidence.skills),
  };
}

export function EvidenceDialog({
  open,
  onOpenChange,
  evidence,
}: EvidenceDialogProps) {
  const createEvidence = useCreateEvidence();
  const updateEvidence = useUpdateEvidence();
  const [draft, setDraft] = useState<DraftState>(emptyDraft);

  useEffect(() => {
    if (open) setDraft(evidence ? toDraft(evidence) : emptyDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open
  }, [open, evidence?.id]);

  const pending = createEvidence.isPending || updateEvidence.isPending;

  function set<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const input = {
      kind: draft.kind,
      title: draft.title.trim(),
      url: draft.url.trim() || null,
      source: draft.source || null,
      date: draft.date || null,
      description: draft.description || null,
      skills: inputToSkills(draft.skills),
    };
    const onSuccess = () => onOpenChange(false);
    if (evidence) {
      updateEvidence.mutate({ id: evidence.id, ...input }, { onSuccess });
    } else {
      createEvidence.mutate(input, { onSuccess });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{evidence ? "Edit evidence" : "Add evidence"}</DialogTitle>
          <DialogDescription>
            A verifiable artifact: certificate, paper, video, post,
            recommendation…
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kind</Label>
              <Select
                value={draft.kind}
                onValueChange={(value) => set("kind", value as EvidenceKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_KIND_ORDER.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {EVIDENCE_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-title">Title</Label>
              <Input
                id="ev-title"
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="AWS Certified Solutions Architect"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ev-url">URL</Label>
              <Input
                id="ev-url"
                value={draft.url}
                onChange={(event) => set("url", event.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-source">Source</Label>
              <Input
                id="ev-source"
                value={draft.source}
                onChange={(event) => set("source", event.target.value)}
                placeholder="arXiv / YouTube / AWS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-date">Date</Label>
              <Input
                id="ev-date"
                type="date"
                value={draft.date}
                onChange={(event) => set("date", event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-description">Description</Label>
            <Textarea
              id="ev-description"
              rows={3}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-skills">Skills (comma-separated)</Label>
            <Input
              id="ev-skills"
              value={draft.skills}
              onChange={(event) => set("skills", event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.title.trim() || pending}>
            {evidence ? "Save changes" : "Add evidence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
