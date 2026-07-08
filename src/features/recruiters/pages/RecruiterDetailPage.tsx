import { useParams } from "react-router";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function RecruiterDetailPage() {
  const { recruiterId } = useParams<"recruiterId">();

  return (
    <>
      <PageHeader
        title="Recruiter"
        description={`Recruiter ID: ${recruiterId ?? "unknown"}`}
      />
      <EmptyState
        icon={Users}
        title="Recruiter details coming soon"
        description="Contact info, notes, and linked applications will live here."
      />
    </>
  );
}
