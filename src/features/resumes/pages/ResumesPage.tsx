import { FileText } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function ResumesPage() {
  return (
    <>
      <PageHeader
        title="Resumes"
        description="Your master resumes and the tailored copies generated from them."
      />
      <EmptyState
        icon={FileText}
        title="No resumes yet"
        description="Create and edit master resume text here in the next milestone."
      />
    </>
  );
}
