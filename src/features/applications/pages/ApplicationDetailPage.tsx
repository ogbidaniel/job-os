import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ExternalLink, FileStack, FileText, Mail, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { dateInputToIso, formatDate, isoToDateInput } from "@/lib/dates";
import type { ApplicationStatus } from "@/types/models";
import { useJob } from "@/features/jobs/hooks/use-jobs";
import { JOB_STATUS_LABELS } from "@/features/jobs/types";
import {
  useApplication,
  useDeleteApplication,
  useUpdateApplication,
} from "../hooks/use-applications";
import {
  APPLICATION_STATUS_CLASSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from "../types";

export function ApplicationDetailPage() {
  const { applicationId } = useParams<"applicationId">();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplication(applicationId);
  const { data: job } = useJob(application?.jobId ?? undefined);
  const updateApplication = useUpdateApplication();
  const deleteApplication = useDeleteApplication();
  // null = untouched (show the server value); string = user's unsaved draft.
  const [draftNotes, setDraftNotes] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const notesValue = draftNotes ?? application?.notes ?? "";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon={FileStack}
        title="Application not found"
        description="It may have been deleted."
        action={
          <Button onClick={() => navigate("/applications")}>
            Back to Applications
          </Button>
        }
      />
    );
  }

  function handleStatusChange(status: ApplicationStatus) {
    updateApplication.mutate({ id: application!.id, status });
  }

  function handleAppliedAtChange(value: string) {
    updateApplication.mutate({
      id: application!.id,
      appliedAt: dateInputToIso(value),
    });
  }

  function handleSaveNotes() {
    updateApplication.mutate(
      { id: application!.id, notes: notesValue || null },
      { onSuccess: () => setDraftNotes(null) },
    );
  }

  function handleDelete() {
    deleteApplication.mutate(application!.id, {
      onSuccess: () => navigate("/applications"),
    });
  }

  return (
    <>
      <PageHeader
        title={job ? `${job.company} — ${job.title}` : "Application"}
        description={`Created ${formatDate(application.createdAt)}`}
        actions={
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={application.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as ApplicationStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUS_ORDER.map((value) => (
                      <SelectItem key={value} value={value}>
                        {APPLICATION_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applied-at">Applied on</Label>
                <Input
                  id="applied-at"
                  type="date"
                  value={isoToDateInput(application.appliedAt)}
                  onChange={(event) => handleAppliedAtChange(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={6}
                value={notesValue}
                onChange={(event) => setDraftNotes(event.target.value)}
                placeholder="Contacts, referral, follow-ups, interview notes…"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={
                    updateApplication.isPending ||
                    draftNotes === null ||
                    draftNotes === (application.notes ?? "")
                  }
                >
                  Save notes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {job ? (
                <>
                  <p className="font-medium">
                    <Link to={`/jobs/${job.id}`} className="hover:underline">
                      {job.company} — {job.title}
                    </Link>
                  </p>
                  <p className="text-muted-foreground">
                    {job.location ?? "No location"} ·{" "}
                    {job.status ? JOB_STATUS_LABELS[job.status] : "—"}
                  </p>
                  <p className="text-muted-foreground">
                    Posted {formatDate(job.postedAt)}
                  </p>
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium hover:underline"
                    >
                      Apply externally{" "}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">
                  The linked job no longer exists.
                </p>
              )}
              <div className="pt-2">
                <Badge
                  className={cn(
                    "border-transparent",
                    application.status
                      ? APPLICATION_STATUS_CLASSES[application.status]
                      : undefined,
                  )}
                >
                  {application.status
                    ? APPLICATION_STATUS_LABELS[application.status]
                    : "—"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link to={`/applications/${application.id}/resume`}>
                  <FileText className="size-4" aria-hidden />
                  Resume workspace
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/applications/${application.id}/cover-letter`}>
                  <Mail className="size-4" aria-hidden />
                  Cover letter workspace
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this application?</DialogTitle>
            <DialogDescription>
              The application record and its notes will be permanently deleted.
              The job itself is kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteApplication.isPending}
            >
              Delete application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
