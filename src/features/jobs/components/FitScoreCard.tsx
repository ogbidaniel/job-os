import { Gauge, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/models";
import { PROFILE_CONTEXT } from "@/content/profile";
import type { FitReport } from "../api/jobs-service";
import { useScoreFit } from "../hooks/use-jobs";
import { fitScoreClasses } from "../lib/job-context";

function parseFitReport(job: Job): FitReport | null {
  if (!job.fitReport) return null;
  try {
    return JSON.parse(job.fitReport) as FitReport;
  } catch {
    return null;
  }
}

interface FitScoreCardProps {
  job: Job;
}

export function FitScoreCard({ job }: FitScoreCardProps) {
  const scoreFit = useScoreFit();
  const report = parseFitReport(job);

  function handleScore() {
    // The profile is hard-coded (single-user app): src/content/profile.ts
    scoreFit.mutate({ job, profileContext: PROFILE_CONTEXT });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Fit with your profile</CardTitle>
        <Button
          size="sm"
          variant={report ? "outline" : "default"}
          onClick={handleScore}
          disabled={scoreFit.isPending}
        >
          {scoreFit.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Gauge className="size-4" aria-hidden />
          )}
          {scoreFit.isPending
            ? "Scoring…"
            : report
              ? "Re-score"
              : "Score my fit"}
        </Button>
      </CardHeader>
      <CardContent>
        {!report || job.fitScore == null ? (
          <p className="text-sm text-muted-foreground">
            Not scored yet. The AI compares this job's requirements against
            your profile and names matches and gaps honestly.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "text-5xl font-semibold tabular-nums",
                  fitScoreClasses(job.fitScore),
                )}
              >
                {job.fitScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-base leading-7">{report.summary}</p>
            {report.matchedSkills.length > 0 ? (
              <div>
                <p className="mb-1.5 text-sm font-medium">You bring</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.matchedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {report.gaps.length > 0 ? (
              <div>
                <p className="mb-1.5 text-sm font-medium">Gaps</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.gaps.map((gap) => (
                    <Badge
                      key={gap}
                      className="border-transparent bg-red-500/15 text-red-700 dark:text-red-300"
                    >
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
