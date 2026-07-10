import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Job } from "@/types/models";
import { useExtractJob, useUpdateJob } from "../hooks/use-jobs";
import {
  extractionToFormValues,
  formValuesToInput,
  jobFormSchema,
  jobToFormValues,
  type JobFormValues,
} from "../lib/job-form";
import { JobForm } from "./JobForm";
import { PasteExtract } from "./PasteExtract";

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const updateJob = useUpdateJob();
  const extractJob = useExtractJob();
  const [pasteText, setPasteText] = useState("");

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: jobToFormValues(job),
  });

  // Re-sync when a different job is edited or fresh data arrives.
  useEffect(() => {
    form.reset(jobToFormValues(job));
  }, [form, job]);

  function handleExtract() {
    extractJob.mutate(pasteText, {
      onSuccess: (extraction) => {
        form.reset(extractionToFormValues(extraction, form.getValues()));
        toast.success("Fields re-extracted — review before saving");
      },
    });
  }

  function handleSubmit(values: JobFormValues) {
    updateJob.mutate(
      {
        id: job.id,
        ...formValuesToInput(values),
        // Keep the previous raw paste unless a new one was provided.
        ...(pasteText ? { rawPosting: pasteText } : {}),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPasteText("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit job</DialogTitle>
          <DialogDescription>
            Re-paste the posting to re-run extraction (fills the structured
            sections), or edit fields directly.
          </DialogDescription>
        </DialogHeader>
        <PasteExtract
          value={pasteText}
          onChange={setPasteText}
          onExtract={handleExtract}
          extracting={extractJob.isPending}
        />
        <Separator />
        <JobForm
          form={form}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          submitting={updateJob.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
