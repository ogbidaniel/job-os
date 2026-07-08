import { useParams } from "react-router";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function JobDetailPage() {
  const { jobId } = useParams<"jobId">();

  return (
    <>
      <PageHeader
        title="Job Details"
        description={`Job ID: ${jobId ?? "unknown"}`}
      />
      <EmptyState
        icon={Briefcase}
        title="Job details coming soon"
        description="Company, role, requirements, location, and salary will be reviewed here."
      />
    </>
  );
}
