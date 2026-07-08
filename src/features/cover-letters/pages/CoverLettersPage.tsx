import { Mail } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function CoverLettersPage() {
  return (
    <>
      <PageHeader
        title="Cover Letters"
        description="Reusable templates and the tailored letters generated from them."
      />
      <EmptyState
        icon={Mail}
        title="No cover letters yet"
        description="Create and edit cover letter text here in the next milestone."
      />
    </>
  );
}
