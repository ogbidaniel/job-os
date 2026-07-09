import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useDashboardCounts,
  type DashboardCounts,
} from "../hooks/use-dashboard-counts";

// Application-centric on purpose: jobs only matter here once pursued.
const cards: ReadonlyArray<{
  label: string;
  key: keyof DashboardCounts;
  to: string;
}> = [
  { label: "Applications", key: "applications", to: "/applications" },
  { label: "Applied", key: "applied", to: "/applications?status=APPLIED" },
  { label: "Interviews", key: "interviews", to: "/applications?status=INTERVIEWING" },
  { label: "Offers", key: "offers", to: "/applications?status=OFFER" },
];

export function DashboardPage() {
  const { counts, isLoading } = useDashboardCounts();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your job search pipeline."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.key} to={card.to}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !counts ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  <p className="text-3xl font-semibold">{counts[card.key]}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
