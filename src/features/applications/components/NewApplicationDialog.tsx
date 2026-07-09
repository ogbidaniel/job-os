import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobs } from "@/features/jobs/hooks/use-jobs";
import { useCreateApplication } from "../hooks/use-applications";

interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewApplicationDialog({
  open,
  onOpenChange,
}: NewApplicationDialogProps) {
  const navigate = useNavigate();
  const { data: jobs } = useJobs();
  const createApplication = useCreateApplication();
  const [jobId, setJobId] = useState("");

  function handleCreate() {
    if (!jobId) return;
    createApplication.mutate(
      { jobId },
      {
        onSuccess: (application) => {
          onOpenChange(false);
          setJobId("");
          navigate(`/applications/${application.id}`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New application</DialogTitle>
          <DialogDescription>
            Pick the job you are applying to. It starts in “Saved” status.
          </DialogDescription>
        </DialogHeader>
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a job…" />
          </SelectTrigger>
          <SelectContent>
            {(jobs ?? []).map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.company} — {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!jobId || createApplication.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
