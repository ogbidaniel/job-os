import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FilePlus2,
  Pencil,
  Trash2,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/dates";
import { useCreateApplication } from "@/features/applications/hooks/use-applications";
import { EditJobDialog } from "../components/EditJobDialog";
import { FitScoreCard } from "../components/FitScoreCard";
import { useDeleteJob, useJob } from "../hooks/use-jobs";
import { condenseLocation } from "../lib/job-context";
import { JOB_STATUS_LABELS } from "../types";

function cleanList(
  items: ReadonlyArray<string | null> | null | undefined,
): string[] {
  return (items ?? []).filter((item): item is string => Boolean(item));
}

interface BulletCardProps {
  title: string;
  items: string[];
}

function BulletCard({ title, items }: BulletCardProps) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-base leading-7">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function JobDetailPage() {
  const { jobId } = useParams<"jobId">();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId);
  const createApplication = useCreateApplication();
  const deleteJob = useDeleteJob();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showFullPosting, setShowFullPosting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="It may have been deleted."
        action={<Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>}
      />
    );
  }

  const location = condenseLocation(job.location);
  const responsibilities = cleanList(job.responsibilities);
  const requiredSkills = cleanList(job.requiredSkills);
  const preferredSkills = cleanList(job.preferredSkills);
  const hasStructured =
    Boolean(job.summary) ||
    responsibilities.length > 0 ||
    requiredSkills.length > 0;
  const fullPosting = job.rawPosting ?? job.description;

  function handleCreateApplication() {
    createApplication.mutate(
      { jobId: job!.id },
      { onSuccess: (application) => navigate(`/applications/${application.id}`) },
    );
  }

  function handleDelete() {
    deleteJob.mutate(job!.id, { onSuccess: () => navigate("/jobs") });
  }

  return (
    <>
      <PageHeader
        title={job.title}
        description={
          [job.company, location.display].filter(Boolean).join(" · ") ||
          undefined
        }
        actions={
          <>
            <Button
              onClick={handleCreateApplication}
              disabled={createApplication.isPending}
            >
              <FilePlus2 className="size-4" aria-hidden />
              Create application
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" aria-hidden />
              Delete
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="secondary">
                  {job.status ? JOB_STATUS_LABELS[job.status] : "—"}
                </Badge>
                {job.sourceSite ? (
                  <Badge variant="outline">{job.sourceSite}</Badge>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Posted on</p>
              <p className="mt-1 text-sm font-medium">{formatDate(job.postedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="mt-1 text-sm font-medium">{job.salary ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Links</p>
              <div className="mt-1 flex gap-3 text-sm">
                {job.applicationUrl ? (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    Apply <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null}
                {job.sourceUrl ? (
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    Source <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null}
                {!job.applicationUrl && !job.sourceUrl ? "—" : null}
              </div>
            </div>
            {location.display !== location.full ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-sm text-muted-foreground">All locations</p>
                <p className="mt-1 text-sm">{location.full}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <FitScoreCard job={job} />

        {job.summary ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About this job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7">{job.summary}</p>
            </CardContent>
          </Card>
        ) : null}

        <BulletCard title="What you'll do" items={responsibilities} />
        <BulletCard title="Required skills" items={requiredSkills} />
        <BulletCard title="Preferred skills" items={preferredSkills} />

        {!hasStructured ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This job was saved before structured extraction. Open Edit,
                  re-paste the posting, and hit "Extract with AI" to upgrade it.
                </p>
                {job.description ? (
                  <p className="max-w-prose text-base leading-7 whitespace-pre-wrap">
                    {job.description}
                  </p>
                ) : null}
              </CardContent>
            </Card>
            {job.requirements ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-prose text-base leading-7 whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}

        {hasStructured && fullPosting ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Full posting</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullPosting((current) => !current)}
              >
                {showFullPosting ? (
                  <ChevronUp className="size-4" aria-hidden />
                ) : (
                  <ChevronDown className="size-4" aria-hidden />
                )}
                {showFullPosting ? "Hide" : "Show"}
              </Button>
            </CardHeader>
            {showFullPosting ? (
              <CardContent>
                <p className="max-w-prose text-sm leading-relaxed whitespace-pre-wrap">
                  {fullPosting}
                </p>
              </CardContent>
            ) : null}
          </Card>
        ) : null}
      </div>

      <EditJobDialog job={job} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this job?</DialogTitle>
            <DialogDescription>
              “{job.title}” at {job.company} will be permanently deleted.
              Applications linked to it are not deleted but lose their job
              details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteJob.isPending}
            >
              Delete job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
