import { FileStack } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function ApplicationsPage() {
  return (
    <>
      <PageHeader
        title="Applications"
        description="Every application you are tracking, across the whole pipeline."
      />
      <EmptyState
        icon={FileStack}
        title="No applications yet"
        description="The application pipeline (status, filters, search) arrives in the next milestone."
      />
    </>
  );
}
