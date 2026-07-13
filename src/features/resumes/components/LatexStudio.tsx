import { useEffect, useRef, useState } from "react";
import { Copy, Download, ExternalLink, FileOutput, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { downloadBlob, toFilenameStem } from "@/lib/download-text";
import {
  useCategoryResume,
  useCompileLatex,
  useUpdateResume,
} from "../hooks/use-resumes";
import { openInOverleaf } from "../lib/overleaf";

function pdfBlobFromBase64(base64: string): Blob {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: "application/pdf" });
}

interface LatexStudioProps {
  category: string;
}

/** LaTeX editor + PDF generation for one job-category resume. */
export function LatexStudio({ category }: LatexStudioProps) {
  const { data: resume, isLoading } = useCategoryResume(category);
  const updateResume = useUpdateResume();
  const compileLatex = useCompileLatex();
  // null = untouched (server value); string = unsaved draft.
  const [draft, setDraft] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);

  // Revoke the object URL on unmount / category switch.
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  if (isLoading || !resume) {
    return <Skeleton className="h-[70vh] w-full" />;
  }

  const source = draft ?? resume.content ?? "";
  const dirty = draft !== null && draft !== (resume.content ?? "");

  function handleSave() {
    updateResume.mutate(
      { id: resume!.id, content: source || null },
      { onSuccess: () => setDraft(null) },
    );
  }

  function handleGenerate() {
    // Persist edits alongside generating so the PDF always matches the
    // saved LaTeX.
    if (dirty) handleSave();
    compileLatex.mutate(source, {
      onSuccess: (result) => {
        if ("pdfBase64" in result) {
          if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
          const url = URL.createObjectURL(pdfBlobFromBase64(result.pdfBase64));
          pdfUrlRef.current = url;
          setPdfUrl(url);
          setCompileLog(null);
          toast.success("PDF generated");
        } else {
          setPdfUrl(null);
          setCompileLog(`${result.error}\n\n${result.log}`);
          toast.error("LaTeX compilation failed — see the log");
        }
      },
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(source);
    toast.success("LaTeX copied to clipboard");
  }

  function handleDownload() {
    if (!pdfUrl) return;
    void fetch(pdfUrl)
      .then((response) => response.blob())
      .then((blob) =>
        downloadBlob(
          `Daniel_Ogbuigwe_${toFilenameStem(category, "resume").replace(/ /g, "_")}.pdf`,
          blob,
        ),
      );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={handleGenerate}
          disabled={compileLatex.isPending || !source.trim()}
        >
          {compileLatex.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <FileOutput className="size-4" aria-hidden />
          )}
          {compileLatex.isPending ? "Compiling…" : "Generate PDF"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={updateResume.isPending || !dirty}
        >
          Save
        </Button>
        <Button variant="outline" onClick={() => void handleCopy()}>
          <Copy className="size-4" aria-hidden />
          Copy LaTeX
        </Button>
        <Button variant="outline" onClick={handleDownload} disabled={!pdfUrl}>
          <Download className="size-4" aria-hidden />
          Download PDF
        </Button>
        <Button variant="ghost" onClick={() => openInOverleaf(source)}>
          <ExternalLink className="size-4" aria-hidden />
          Open in Overleaf
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Textarea
          value={source}
          onChange={(event) => setDraft(event.target.value)}
          rows={32}
          spellCheck={false}
          className="font-mono text-xs leading-5"
        />
        <div className="min-h-[40vh]">
          {pdfUrl ? (
            <iframe
              title={`${category} resume PDF`}
              src={pdfUrl}
              className="h-[75vh] w-full rounded-lg border"
            />
          ) : compileLog ? (
            <pre className="h-[75vh] overflow-auto rounded-lg border bg-muted/40 p-3 text-xs whitespace-pre-wrap text-red-700 dark:text-red-300">
              {compileLog}
            </pre>
          ) : (
            <div className="flex h-[75vh] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Generate PDF to preview it here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
