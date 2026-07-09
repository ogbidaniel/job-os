import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileStack, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dates";
import type { ApplicationStatus } from "@/types/models";
import { NewApplicationDialog } from "../components/NewApplicationDialog";
import { useApplicationsWithJobs } from "../hooks/use-applications";
import { filterApplications } from "../lib/filter-applications";
import {
  APPLICATION_STATUS_CLASSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from "../types";

export function ApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);
  const { data: rows, isLoading } = useApplicationsWithJobs();

  const query = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status") as ApplicationStatus | null;
  const status: ApplicationStatus | "ALL" =
    statusParam && APPLICATION_STATUS_ORDER.includes(statusParam)
      ? statusParam
      : "ALL";

  const filtered = useMemo(
    () => filterApplications(rows ?? [], { query, status }),
    [rows, query, status],
  );

  function setParam(key: string, value: string) {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value);
        else params.delete(key);
        return params;
      },
      { replace: true },
    );
  }

  return (
    <>
      <PageHeader
        title="Applications"
        description="Every application you are tracking, across the whole pipeline."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New application
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setParam("q", event.target.value)}
          placeholder="Search company, title, notes…"
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) => setParam("status", value === "ALL" ? "" : value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {APPLICATION_STATUS_ORDER.map((value) => (
              <SelectItem key={value} value={value}>
                {APPLICATION_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !rows || rows.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No applications yet"
          description="Create one from a job's page, or start here."
          action={
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New application
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No applications match your filters"
          description="Try a different search or status."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ application, job }) => (
                <TableRow
                  key={application.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/applications/${application.id}`)}
                >
                  <TableCell className="font-medium">
                    {job?.company ?? "Unknown company"}
                  </TableCell>
                  <TableCell>{job?.title ?? "Unknown job"}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "border-transparent",
                        application.status
                          ? APPLICATION_STATUS_CLASSES[application.status]
                          : undefined,
                      )}
                    >
                      {application.status
                        ? APPLICATION_STATUS_LABELS[application.status]
                        : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(application.appliedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewApplicationDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}
