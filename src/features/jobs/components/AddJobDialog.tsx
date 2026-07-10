import { useState } from "react";
import { useNavigate } from "react-router";
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
import { useCreateJob, useExtractJob } from "../hooks/use-jobs";
import {
  emptyJobFormValues,
  extractionToFormValues,
  formValuesToInput,
  jobFormSchema,
  type JobFormValues,
} from "../lib/job-form";
import { JobForm } from "./JobForm";
import { PasteExtract } from "./PasteExtract";

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
    createJob.mutate(
      { ...formValuesToInput(values), rawPosting: pasteText || null },
      {
        onSuccess: (job) => {
          onOpenChange(false);
          form.reset(emptyJobFormValues);
          setPasteText("");
          navigate(`/jobs/${job.id}`);
        },
      },
    );
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
          submitLabel="Save job"
          submitting={createJob.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
