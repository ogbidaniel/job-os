import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Job } from "@/types/models";
import { useUpdateJob } from "../hooks/use-jobs";
import {
  formValuesToInput,
  jobFormSchema,
  jobToFormValues,
  type JobFormValues,
} from "../lib/job-form";
import { JobForm } from "./JobForm";

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const updateJob = useUpdateJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: jobToFormValues(job),
  });

  // Re-sync when a different job is edited or fresh data arrives.
  useEffect(() => {
    form.reset(jobToFormValues(job));
  }, [form, job]);

  function handleSubmit(values: JobFormValues) {
    updateJob.mutate(
      { id: job.id, ...formValuesToInput(values) },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit job</DialogTitle>
        </DialogHeader>
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
