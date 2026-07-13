import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EVIDENCE_LINKS,
  EXPERIENCE_ENTRIES,
  PROFILE_DETAILS,
  PROFILE_SUMMARY,
} from "@/content/profile";

/** Static render of the hard-coded profile: details, experience, evidence. */
export function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{PROFILE_DETAILS.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {PROFILE_DETAILS.headline}
          </p>
          <p className="text-sm">
            {PROFILE_DETAILS.location} · {PROFILE_DETAILS.email} ·{" "}
            {PROFILE_DETAILS.phone}
          </p>
          <div className="flex flex-wrap gap-2">
            {PROFILE_DETAILS.links.map((link) => (
              <Button key={link.url} variant="outline" size="sm" asChild>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </Button>
            ))}
          </div>
          <p className="max-w-prose text-base leading-7">{PROFILE_SUMMARY}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {EXPERIENCE_ENTRIES.map((entry) => (
            <div key={`${entry.kind}-${entry.title}`}>
              <p className="font-medium">
                {entry.title}
                {entry.organization ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {entry.organization}
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <Badge variant="secondary" className="mr-2">
                  {entry.kind}
                </Badge>
                {[entry.dates, entry.location].filter(Boolean).join(" · ")}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence & links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {EVIDENCE_LINKS.map((item) => (
            <div key={item.title} className="text-sm">
              <p className="font-medium">
                <Badge variant="secondary" className="mr-2">
                  {item.kind}
                </Badge>
                {item.title}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center align-middle text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    <span className="sr-only">Open link</span>
                  </a>
                ) : null}
                {item.source ? (
                  <span className="text-muted-foreground"> — {item.source}</span>
                ) : null}
              </p>
              {item.note ? (
                <p className="mt-0.5 text-muted-foreground">{item.note}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
