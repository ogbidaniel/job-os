import { z } from "zod";
import { dateInputToIso, isoToDateInput } from "@/lib/dates";
import type { Job, JobExtraction, JobStatus } from "@/types/models";
import type { JobCreateInput } from "../api/jobs-service";
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
  description: "",
  requirements: "",
  status: "NEW",
};

/** Merge AI-extracted fields into form values; nulls leave fields as-is. */
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
    description: extraction.description ?? current.description,
    requirements: extraction.requirements ?? current.requirements,
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
    description: values.description || null,
    requirements: values.requirements || null,
    status: values.status,
  };
}
