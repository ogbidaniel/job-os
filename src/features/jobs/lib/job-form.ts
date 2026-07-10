import { z } from "zod";
import { dateInputToIso, isoToDateInput } from "@/lib/dates";
import type { Job, JobStatus } from "@/types/models";
import type { JobCreateInput, JobExtraction } from "../api/jobs-service";
import { JOB_STATUS_ORDER } from "../types";

const optionalUrl = z.union([
  z.literal(""),
  z.url({ error: "Must be a valid URL" }),
]);

export const jobFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  location: z.string(),
  salary: z.string(),
  postedAt: z.string(), // yyyy-MM-dd or empty
  applicationUrl: optionalUrl,
  sourceUrl: optionalUrl,
  sourceSite: z.string(),
  summary: z.string(),
  responsibilities: z.string(), // one item per line
  requiredSkills: z.string(), // one item per line
  preferredSkills: z.string(), // one item per line
  description: z.string(),
  requirements: z.string(),
  status: z.enum(JOB_STATUS_ORDER as readonly [JobStatus, ...JobStatus[]]),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const emptyJobFormValues: JobFormValues = {
  company: "",
  title: "",
  location: "",
  salary: "",
  postedAt: "",
  applicationUrl: "",
  sourceUrl: "",
  sourceSite: "",
  summary: "",
  responsibilities: "",
  requiredSkills: "",
  preferredSkills: "",
  description: "",
  requirements: "",
  status: "NEW",
};

function linesToArray(value: string): string[] | null {
  const items = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

function arrayToLines(items: ReadonlyArray<string | null> | null | undefined): string {
  return (items ?? []).filter((item): item is string => Boolean(item)).join("\n");
}

/** Merge AI-extracted fields into form values; empty results leave fields as-is. */
export function extractionToFormValues(
  extraction: JobExtraction,
  current: JobFormValues,
): JobFormValues {
  return {
    ...current,
    company: extraction.company ?? current.company,
    title: extraction.title ?? current.title,
    location: extraction.location ?? current.location,
    salary: extraction.salary ?? current.salary,
    postedAt: extraction.postedAt ?? current.postedAt,
    applicationUrl: extraction.applicationUrl ?? current.applicationUrl,
    sourceSite: extraction.sourceSite ?? current.sourceSite,
    summary: extraction.summary ?? current.summary,
    responsibilities:
      extraction.responsibilities.length > 0
        ? extraction.responsibilities.join("\n")
        : current.responsibilities,
    requiredSkills:
      extraction.requiredSkills.length > 0
        ? extraction.requiredSkills.join("\n")
        : current.requiredSkills,
    preferredSkills:
      extraction.preferredSkills.length > 0
        ? extraction.preferredSkills.join("\n")
        : current.preferredSkills,
    description: extraction.description ?? current.description,
  };
}

export function jobToFormValues(job: Job): JobFormValues {
  return {
    company: job.company,
    title: job.title,
    location: job.location ?? "",
    salary: job.salary ?? "",
    postedAt: isoToDateInput(job.postedAt),
    applicationUrl: job.applicationUrl ?? "",
    sourceUrl: job.sourceUrl ?? "",
    sourceSite: job.sourceSite ?? "",
    summary: job.summary ?? "",
    responsibilities: arrayToLines(job.responsibilities),
    requiredSkills: arrayToLines(job.requiredSkills),
    preferredSkills: arrayToLines(job.preferredSkills),
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    status: job.status ?? "NEW",
  };
}

export function formValuesToInput(values: JobFormValues): JobCreateInput {
  return {
    company: values.company,
    title: values.title,
    location: values.location || null,
    salary: values.salary || null,
    postedAt: dateInputToIso(values.postedAt),
    applicationUrl: values.applicationUrl || null,
    sourceUrl: values.sourceUrl || null,
    sourceSite: values.sourceSite || null,
    summary: values.summary || null,
    responsibilities: linesToArray(values.responsibilities),
    requiredSkills: linesToArray(values.requiredSkills),
    preferredSkills: linesToArray(values.preferredSkills),
    description: values.description || null,
    requirements: values.requirements || null,
    status: values.status,
  };
}
