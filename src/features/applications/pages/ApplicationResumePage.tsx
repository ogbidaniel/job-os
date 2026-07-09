import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewResumeDialog } from "@/features/resumes/components/NewResumeDialog";
import { ResumeEditor } from "@/features/resumes/components/ResumeEditor";
import { useResume, useResumes } from "@/features/resumes/hooks/use-resumes";
import { RESUME_KIND_LABELS } from "@/features/resumes/types";
import { useJob } from "@/features/jobs/hooks/use-jobs";
import {
  useApplication,
  useUpdateApplication,
} from "../hooks/use-applications";

export function ApplicationResumePage() {
  const { applicationId } = useParams<"applicationId">();
  const navigate = useNavigate();
  const { data: application, isLoading: applicationLoading } =
    useApplication(applicationId);
  const { data: job } = useJob(application?.jobId ?? undefined);
  const { data: resume, isLoading: resumeLoading } = useResume(
    application?.resumeId ?? undefined,
  );
  const { data: resumes } = useResumes();
  const updateApplication = useUpdateApplication();
  const [newOpen, setNewOpen] = useState(false);

  if (applicationLoading || (application?.resumeId && resumeLoading)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon={FileText}
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

  function handleAttach(resumeId: string | null) {
    updateApplication.mutate({ id: application!.id, resumeId });
  }

  const contextLine = job
    ? `${job.company} — ${job.title}`
    : "Attached to this application";

  return (
    <>
      <PageHeader
        title="Resume Workspace"
        description={contextLine}
        actions={
          <Button variant="outline" asChild>
            <Link to={`/applications/${application.id}`}>
              Back to application
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="w-full max-w-sm space-y-1">
          <Label>Attached resume</Label>
          <Select
            value={application.resumeId ?? "NONE"}
            onValueChange={(value) =>
              handleAttach(value === "NONE" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a resume…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None</SelectItem>
              {(resumes ?? []).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label} ({RESUME_KIND_LABELS[item.kind]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New resume
        </Button>
      </div>

      {resume ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link to={`/resumes/${resume.id}`} className="hover:underline">
                {resume.label}
              </Link>{" "}
              <span className="font-normal text-muted-foreground">
                ({RESUME_KIND_LABELS[resume.kind]})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeEditor resume={resume} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={FileText}
          title="No resume attached"
          description="Attach one of your resumes above, or create a new one for this application."
          action={
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New resume
            </Button>
          }
        />
      )}

      <NewResumeDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={(created) => handleAttach(created.id)}
      />
    </>
  );
}
