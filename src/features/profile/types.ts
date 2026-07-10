import type { EvidenceKind, ExperienceKind } from "@/types/models";

export const EXPERIENCE_KIND_ORDER: readonly ExperienceKind[] = [
  "WORK",
  "PROJECT",
  "EDUCATION",
  "CERTIFICATION",
  "VOLUNTEER",
  "OTHER",
];

export const EXPERIENCE_KIND_LABELS: Record<ExperienceKind, string> = {
  WORK: "Work",
  PROJECT: "Project",
  EDUCATION: "Education",
  CERTIFICATION: "Certification",
  VOLUNTEER: "Volunteer",
  OTHER: "Other",
};

export const EVIDENCE_KIND_ORDER: readonly EvidenceKind[] = [
  "CERTIFICATE",
  "PAPER",
  "VIDEO",
  "POST",
  "ARTICLE",
  "RECOMMENDATION",
  "OTHER",
];

export const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  CERTIFICATE: "Certificate",
  PAPER: "Paper",
  VIDEO: "Video",
  POST: "Post",
  ARTICLE: "Article",
  RECOMMENDATION: "Recommendation",
  OTHER: "Other",
};
