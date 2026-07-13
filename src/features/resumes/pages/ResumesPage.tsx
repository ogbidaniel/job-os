import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { RESUME_CATEGORIES } from "@/content/resume-categories";
import { LatexStudio } from "../components/LatexStudio";
import { OverviewTab } from "../components/OverviewTab";

const OVERVIEW = "Overview";

export function ResumesPage() {
  const [selected, setSelected] = useState<string>(OVERVIEW);
  const sections = [OVERVIEW, ...RESUME_CATEGORIES];

  return (
    <>
      <PageHeader
        title="Resumes"
        description="One tailored LaTeX resume per job category — edit, generate the PDF, download."
      />

      {/* Mobile: dropdown */}
      <div className="mb-4 md:hidden">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        {/* Desktop: vertical category nav */}
        <nav className="hidden w-56 shrink-0 space-y-1 md:block">
          {sections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setSelected(section)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                selected === section
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {section}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {selected === OVERVIEW ? (
            <OverviewTab />
          ) : (
            <LatexStudio key={selected} category={selected} />
          )}
        </div>
      </div>
    </>
  );
}
