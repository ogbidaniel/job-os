import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { downloadText, toFilenameStem } from "@/lib/download-text";
import type { Resume } from "@/types/models";
import { useUpdateResume } from "../hooks/use-resumes";

interface ResumeEditorProps {
  resume: Resume;
}

/** Content editor with explicit save, plus copy/download export actions. */
export function ResumeEditor({ resume }: ResumeEditorProps) {
  // null = untouched (show the server value); string = unsaved draft.
  const [draft, setDraft] = useState<string | null>(null);
  const updateResume = useUpdateResume();
  const content = draft ?? resume.content ?? "";

  function handleSave() {
    updateResume.mutate(
      { id: resume.id, content: content || null },
      { onSuccess: () => setDraft(null) },
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    toast.success("Resume text copied to clipboard");
  }

  function handleDownload() {
    downloadText(`${toFilenameStem(resume.label, "resume")}.txt`, content);
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(event) => setDraft(event.target.value)}
        rows={24}
        className="font-mono text-sm leading-relaxed"
        placeholder="Paste or write your resume text here…"
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => void handleCopy()}>
          <Copy className="size-4" aria-hidden />
          Copy text
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="size-4" aria-hidden />
          Download .txt
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            updateResume.isPending ||
            draft === null ||
            draft === (resume.content ?? "")
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
