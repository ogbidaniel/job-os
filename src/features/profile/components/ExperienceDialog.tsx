import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import type { Experience, ExperienceKind } from "@/types/models";
import {
  useCreateExperience,
  useUpdateExperience,
} from "../hooks/use-profile";
import { inputToSkills, skillsToInput } from "../lib/skills";
import { EXPERIENCE_KIND_LABELS, EXPERIENCE_KIND_ORDER } from "../types";

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this entry instead of creating one. */
  experience?: Experience;
}

interface DraftState {
  kind: ExperienceKind;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  skills: string;
}

const emptyDraft: DraftState = {
  kind: "WORK",
  title: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  skills: "",
};

function toDraft(experience: Experience): DraftState {
  return {
    kind: experience.kind,
    title: experience.title,
    organization: experience.organization ?? "",
    location: experience.location ?? "",
    startDate: experience.startDate ?? "",
    endDate: experience.endDate ?? "",
    isCurrent: experience.isCurrent ?? false,
    description: experience.description ?? "",
    skills: skillsToInput(experience.skills),
  };
}

export function ExperienceDialog({
  open,
  onOpenChange,
  experience,
}: ExperienceDialogProps) {
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const [draft, setDraft] = useState<DraftState>(emptyDraft);

  useEffect(() => {
    if (open) setDraft(experience ? toDraft(experience) : emptyDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open
  }, [open, experience?.id]);

  const pending = createExperience.isPending || updateExperience.isPending;

  function set<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const input = {
      kind: draft.kind,
      title: draft.title.trim(),
      organization: draft.organization || null,
      location: draft.location || null,
      startDate: draft.startDate || null,
      endDate: draft.isCurrent ? null : draft.endDate || null,
      isCurrent: draft.isCurrent,
      description: draft.description || null,
      skills: inputToSkills(draft.skills),
    };
    const onSuccess = () => onOpenChange(false);
    if (experience) {
      updateExperience.mutate({ id: experience.id, ...input }, { onSuccess });
    } else {
      createExperience.mutate(input, { onSuccess });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {experience ? "Edit experience" : "Add experience"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kind</Label>
              <Select
                value={draft.kind}
                onValueChange={(value) => set("kind", value as ExperienceKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_KIND_ORDER.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {EXPERIENCE_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-title">Title</Label>
              <Input
                id="exp-title"
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="Graduate Research Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-org">Organization</Label>
              <Input
                id="exp-org"
                value={draft.organization}
                onChange={(event) => set("organization", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-location">Location</Label>
              <Input
                id="exp-location"
                value={draft.location}
                onChange={(event) => set("location", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-start">Start date</Label>
              <Input
                id="exp-start"
                type="date"
                value={draft.startDate}
                onChange={(event) => set("startDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-end">End date</Label>
              <Input
                id="exp-end"
                type="date"
                value={draft.endDate}
                disabled={draft.isCurrent}
                onChange={(event) => set("endDate", event.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={draft.isCurrent}
              onChange={(event) => set("isCurrent", event.target.checked)}
            />
            I'm currently doing this
          </label>
          <div className="space-y-2">
            <Label htmlFor="exp-description">What you did (one bullet per line)</Label>
            <Textarea
              id="exp-description"
              rows={6}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-skills">Skills (comma-separated)</Label>
            <Input
              id="exp-skills"
              value={draft.skills}
              onChange={(event) => set("skills", event.target.value)}
              placeholder="Python, PyTorch, AWS"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.title.trim() || pending}>
            {experience ? "Save changes" : "Add experience"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
