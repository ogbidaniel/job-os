import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function JobsPage() {
  return (
    <>
      <PageHeader
        title="Jobs"
        description="Saved job postings — imported from a URL or a pasted description."
      />
      <EmptyState
        icon={Briefcase}
        title="No jobs yet"
        description="Job import (paste URL or paste description) arrives in the next milestone."
      />
    </>
  );
}
