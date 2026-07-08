import { useParams } from "react-router";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function ApplicationResumePage() {
  const { applicationId } = useParams<"applicationId">();

  return (
    <>
      <PageHeader
        title="Resume Workspace"
        description={`Tailored resume for application ${applicationId ?? "unknown"}`}
      />
      <EmptyState
        icon={FileText}
        title="Resume workspace coming soon"
        description="Generate a tailored draft from your master resume, edit it, and export the text."
      />
    </>
  );
}
