import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PasteExtractProps {
  value: string;
  onChange: (value: string) => void;
  onExtract: () => void;
  extracting: boolean;
  placeholder?: string;
}

/** Paste box + "Extract with AI" button shared by the job dialogs. */
export function PasteExtract({
  value,
  onChange,
  onExtract,
  extracting,
  placeholder = "Paste the full job posting here (LinkedIn, Indeed, Workday, a careers page, …)",
}: PasteExtractProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={onExtract}
        disabled={!value.trim() || extracting}
      >
        {extracting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="size-4" aria-hidden />
        )}
        {extracting ? "Extracting…" : "Extract with AI"}
      </Button>
    </div>
  );
}
