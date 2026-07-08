import { useParams } from "react-router";
import { Mail } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function ApplicationCoverLetterPage() {
  const { applicationId } = useParams<"applicationId">();

  return (
    <>
      <PageHeader
        title="Cover Letter Workspace"
        description={`Cover letter for application ${applicationId ?? "unknown"}`}
      />
      <EmptyState
        icon={Mail}
        title="Cover letter workspace coming soon"
        description="Generate a draft, edit it, and export the text."
      />
    </>
  );
}
