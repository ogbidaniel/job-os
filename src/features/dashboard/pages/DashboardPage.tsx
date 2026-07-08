import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

interface StatCard {
  label: string;
  value: number;
}

// Static placeholders until the dashboard counts service lands in M2.
// Application-centric on purpose: jobs only matter here once pursued.
const stats: readonly StatCard[] = [
  { label: "Applications", value: 0 },
  { label: "Applied", value: 0 },
  { label: "Interviews", value: 0 },
  { label: "Offers", value: 0 },
];

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your job search pipeline."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
