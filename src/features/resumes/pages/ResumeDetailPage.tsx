import { useParams } from "react-router";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function ResumeDetailPage() {
  const { resumeId } = useParams<"resumeId">();

  return (
    <>
      <PageHeader
        title="Resume"
        description={`Resume ID: ${resumeId ?? "unknown"}`}
      />
      <EmptyState
        icon={FileText}
        title="Resume editor coming soon"
        description="Edit resume text and export it for your Word template."
      />
    </>
  );
}
