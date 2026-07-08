import { useParams } from "react-router";
import { FileStack } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function ApplicationDetailPage() {
  const { applicationId } = useParams<"applicationId">();

  return (
    <>
      <PageHeader
        title="Application"
        description={`Application ID: ${applicationId ?? "unknown"}`}
      />
      <EmptyState
        icon={FileStack}
        title="Application hub coming soon"
        description="Linked job, status history, notes, resume, cover letter, and recruiter will live here."
      />
    </>
  );
}
