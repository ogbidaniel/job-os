/** The job categories the user targets — one tailored resume per category. */
export const RESUME_CATEGORIES = [
  "AWS Cloud / Solutions Architect",
  "DevOps / Site Reliability Engineer",
  "Backend Software Engineer",
  "Software Engineer (Python/general)",
  "Data Engineer",
  "MLOps Engineer",
  "Machine Learning Engineer",
  "Data Scientist / Applied Scientist",
  "Computer Vision Engineer",
  "Research Engineer / Applied Research",
  "IoT / Embedded Systems Engineer (entry-level)",
] as const;

export type ResumeCategory = (typeof RESUME_CATEGORIES)[number];
