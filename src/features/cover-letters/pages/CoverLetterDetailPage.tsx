import { useParams } from "react-router";
import { Mail } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function CoverLetterDetailPage() {
  const { coverLetterId } = useParams<"coverLetterId">();

  return (
    <>
      <PageHeader
        title="Cover Letter"
        description={`Cover letter ID: ${coverLetterId ?? "unknown"}`}
      />
      <EmptyState
        icon={Mail}
        title="Cover letter editor coming soon"
        description="Edit cover letter text and export it."
      />
    </>
  );
}
