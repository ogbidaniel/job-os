import { Users } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function RecruitersPage() {
  return (
    <>
      <PageHeader
        title="Recruiters"
        description="Recruiters and hiring contacts linked to your applications."
      />
      <EmptyState
        icon={Users}
        title="No recruiters yet"
        description="Track recruiter contacts here in the next milestone."
      />
    </>
  );
}
