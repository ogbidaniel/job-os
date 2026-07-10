import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Briefcase, Plus } from "lucide-react";
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
import type { JobStatus } from "@/types/models";
import { AddJobDialog } from "../components/AddJobDialog";
import { useJobs } from "../hooks/use-jobs";
import { filterJobs } from "../lib/filter-jobs";
import { fitScoreBadgeClasses } from "../lib/job-context";
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER } from "../types";

export function JobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const { data: jobs, isLoading } = useJobs();

  const query = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status") as JobStatus | null;
  const status: JobStatus | "ALL" =
    statusParam && JOB_STATUS_ORDER.includes(statusParam) ? statusParam : "ALL";

  const filtered = useMemo(
    () => filterJobs(jobs ?? [], { query, status }),
    [jobs, query, status],
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
        title="Jobs"
        description="Saved job postings — paste a posting and let AI fill in the details."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Add job
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setParam("q", event.target.value)}
          placeholder="Search company, title, location…"
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) => setParam("status", value === "ALL" ? "" : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {JOB_STATUS_ORDER.map((value) => (
              <SelectItem key={value} value={value}>
                {JOB_STATUS_LABELS[value]}
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
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Add your first job — paste the posting and AI fills the form."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Add job
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs match your filters"
          description="Try a different search or status."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <TableCell className="font-medium">{job.company}</TableCell>
                  <TableCell>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell>{job.location ?? "—"}</TableCell>
                  <TableCell>{formatDate(job.postedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {job.status ? JOB_STATUS_LABELS[job.status] : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.fitScore != null ? (
                      <Badge
                        className={cn(
                          "border-transparent tabular-nums",
                          fitScoreBadgeClasses(job.fitScore),
                        )}
                      >
                        {job.fitScore}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddJobDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
