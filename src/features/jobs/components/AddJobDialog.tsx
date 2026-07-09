import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJob, useExtractJob } from "../hooks/use-jobs";
import {
  emptyJobFormValues,
  extractionToFormValues,
  formValuesToInput,
  jobFormSchema,
  type JobFormValues,
} from "../lib/job-form";
import { JobForm } from "./JobForm";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJobDialog({ open, onOpenChange }: AddJobDialogProps) {
  const navigate = useNavigate();
  const [pasteText, setPasteText] = useState("");
  const extractJob = useExtractJob();
  const createJob = useCreateJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: emptyJobFormValues,
  });

  function handleExtract() {
    extractJob.mutate(pasteText, {
      onSuccess: (extraction) => {
        form.reset(extractionToFormValues(extraction, form.getValues()));
        toast.success("Fields populated from the paste — review before saving");
      },
    });
  }

  function handleSubmit(values: JobFormValues) {
    createJob.mutate(formValuesToInput(values), {
      onSuccess: (job) => {
        onOpenChange(false);
        form.reset(emptyJobFormValues);
        setPasteText("");
        navigate(`/jobs/${job.id}`);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add job</DialogTitle>
          <DialogDescription>
            Paste a job posting and let AI fill the form, or enter the details
            yourself. Review everything before saving.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            placeholder="Paste the full job posting here (from LinkedIn, Indeed, a careers page, …)"
            rows={5}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleExtract}
            disabled={!pasteText.trim() || extractJob.isPending}
          >
            {extractJob.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
            {extractJob.isPending ? "Extracting…" : "Extract with AI"}
          </Button>
        </div>
        <Separator />
        <JobForm
          form={form}
          onSubmit={handleSubmit}
          submitLabel="Save job"
          submitting={createJob.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
