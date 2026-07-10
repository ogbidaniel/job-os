import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileExtraction } from "../api/profile-service";
import { useExtractProfile, useImportProfile } from "../hooks/use-profile";
import { EVIDENCE_KIND_LABELS, EXPERIENCE_KIND_LABELS } from "../types";

interface ImportProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string | undefined;
}

interface CheckRowProps {
  checked: boolean;
  onToggle: () => void;
  badge: string;
  label: string;
  detail?: string | null;
}

function CheckRow({ checked, onToggle, badge, label, detail }: CheckRowProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 hover:bg-accent/50">
      <input
        type="checkbox"
        className="mt-1 size-4 accent-primary"
        checked={checked}
        onChange={onToggle}
      />
      <span className="min-w-0">
        <Badge variant="secondary" className="mr-1.5">
          {badge}
        </Badge>
        <span className="text-sm font-medium">{label}</span>
        {detail ? (
          <span className="block truncate text-xs text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function ImportProfileDialog({
  open,
  onOpenChange,
  profileId,
}: ImportProfileDialogProps) {
  const extractProfile = useExtractProfile();
  const importProfile = useImportProfile();
  const [pasteText, setPasteText] = useState("");
  const [extraction, setExtraction] = useState<ProfileExtraction | null>(null);
  const [includeAbout, setIncludeAbout] = useState(true);
  const [experienceIndexes, setExperienceIndexes] = useState<Set<number>>(
    new Set(),
  );
  const [evidenceIndexes, setEvidenceIndexes] = useState<Set<number>>(
    new Set(),
  );

  function handleExtract() {
    extractProfile.mutate(pasteText, {
      onSuccess: (result) => {
        setExtraction(result);
        setIncludeAbout(true);
        setExperienceIndexes(new Set(result.experiences.map((_, i) => i)));
        setEvidenceIndexes(new Set(result.evidence.map((_, i) => i)));
      },
    });
  }

  function toggle(
    set: Set<number>,
    setter: (next: Set<number>) => void,
    index: number,
  ) {
    const next = new Set(set);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setter(next);
  }

  function handleImport() {
    if (!extraction || !profileId) return;
    importProfile.mutate(
      {
        profileId,
        extraction,
        includeAbout,
        experienceIndexes,
        evidenceIndexes,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPasteText("");
          setExtraction(null);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import your master profile</DialogTitle>
          <DialogDescription>
            Paste your full career document (master resume, profile doc). AI
            splits it into About info, experiences, and evidence — you pick
            what gets imported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            placeholder="Paste your whole career document here…"
            rows={extraction ? 3 : 10}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleExtract}
            disabled={!pasteText.trim() || extractProfile.isPending}
          >
            {extractProfile.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
            {extractProfile.isPending ? "Extracting…" : "Extract with AI"}
          </Button>
        </div>

        {extraction ? (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-semibold">About</p>
                <CheckRow
                  checked={includeAbout}
                  onToggle={() => setIncludeAbout((current) => !current)}
                  badge="About"
                  label={extraction.profile.fullName ?? "Contact & summary"}
                  detail={extraction.profile.headline}
                />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold">
                  Experiences ({extraction.experiences.length})
                </p>
                <div className="space-y-0.5">
                  {extraction.experiences.map((item, index) => (
                    <CheckRow
                      key={`${item.title}-${index}`}
                      checked={experienceIndexes.has(index)}
                      onToggle={() =>
                        toggle(experienceIndexes, setExperienceIndexes, index)
                      }
                      badge={
                        EXPERIENCE_KIND_LABELS[
                          item.kind as keyof typeof EXPERIENCE_KIND_LABELS
                        ] ?? "Other"
                      }
                      label={item.title}
                      detail={item.organization}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold">
                  Evidence ({extraction.evidence.length})
                </p>
                <div className="space-y-0.5">
                  {extraction.evidence.map((item, index) => (
                    <CheckRow
                      key={`${item.title}-${index}`}
                      checked={evidenceIndexes.has(index)}
                      onToggle={() =>
                        toggle(evidenceIndexes, setEvidenceIndexes, index)
                      }
                      badge={
                        EVIDENCE_KIND_LABELS[
                          item.kind as keyof typeof EVIDENCE_KIND_LABELS
                        ] ?? "Other"
                      }
                      label={item.title}
                      detail={item.source}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={importProfile.isPending || !profileId}
              >
                {importProfile.isPending ? "Importing…" : "Import selected"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
