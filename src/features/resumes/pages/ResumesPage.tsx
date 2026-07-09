import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/dates";
import { NewResumeDialog } from "../components/NewResumeDialog";
import { useResumes } from "../hooks/use-resumes";
import { RESUME_KIND_LABELS } from "../types";

export function ResumesPage() {
  const navigate = useNavigate();
  const [newOpen, setNewOpen] = useState(false);
  const { data: resumes, isLoading } = useResumes();

  return (
    <>
      <PageHeader
        title="Resumes"
        description="Your master resumes and the tailored copies made from them."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New resume
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !resumes || resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Start with your master resume — paste the full text."
          action={
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New resume
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumes.map((resume) => (
                <TableRow
                  key={resume.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/resumes/${resume.id}`)}
                >
                  <TableCell className="font-medium">{resume.label}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {RESUME_KIND_LABELS[resume.kind]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(resume.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewResumeDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}
