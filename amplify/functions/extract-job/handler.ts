import type { Schema } from '../../data/resource';
import { callGeminiJson, requireApiKey } from '../shared/gemini';

/**
 * Prompt version: job-extract.v3.1
 * v3: structured sections (summary + verbatim bullet arrays), job-site
 * signature awareness (LinkedIn/Workday/Indeed/...), sourceSite detection.
 * `summary` is the ONE field the model writes itself; everything else is
 * copied verbatim. Anti-fabrication is non-negotiable: only facts present
 * in the pasted text; null/empty for anything missing.
 * v3.1: stop echoing the full description back (the client already keeps
 * the paste as rawPosting) — halves output tokens and keeps long postings
 * inside AppSync's 30s query limit.
 */
function buildPrompt(text: string, today: string): string {
  return `You extract structured data from job postings copied from job
sites. Today's date is ${today}.

SITE SIGNATURES — first, recognize where the paste came from:
- LinkedIn: header like "Title / Company · Location (Remote)", markers
  like "· Reposted 8 hours ago · Over 100 applicants", "About the job",
  "Meet the hiring team", Premium upsells, "People you can reach out to".
- Workday career pages: "job requisition id", "posted on / Posted X Days
  Ago", "locations" list, "time type"; the body may contain an explicit
  "Job Title:" field — prefer it over the page header when both exist.
- Indeed: "Job details", "Pay", "Job type", "Shift and schedule",
  "Benefits / Pulled from the full job description", star ratings.
- Greenhouse/Lever/company career pages: minimal chrome, sections like
  "Overview / Responsibilities / Qualifications / What's Offered".
Return sourceSite as one of: "LinkedIn", "Indeed", "Workday",
"Greenhouse", "Lever", "Company site", "Other".

Ignore all site noise (navigation, ads, upsells, applicant counts,
follower blocks, other job cards). If several postings appear, extract
ONLY the first complete one.

FIELD RULES:
- COPY, DO NOT WRITE (every field except "summary"). Values are copied
  verbatim from the posting. Never paraphrase, reorder, or "improve".
- Use ONLY information present in the text. Never invent. Missing scalar
  fields → null; missing list fields → [].
- company: exactly as written; for staffing/recruitment agencies use the
  agency name shown, never an inferred client name.
- title: the job title (prefer an explicit "Job Title:" body field).
- location: as written, keeping remote/hybrid/on-site markers. If many
  cities are listed, include them all separated by "; ".
- salary: exactly as written, but ONLY the amounts/ranges — you may trim
  surrounding legal boilerplate sentences, never alter the numbers
  (e.g. "$126,000 - $196,000 (California); $103,500 - $186,500 (US
  outside CA); $131,500 - $174,500 CAD (Canada)" style condensation of a
  multi-region paragraph is allowed: numbers verbatim, prose trimmed).
- summary: the ONE field you write yourself — 2 to 3 plain sentences
  saying what the company/team does and what this role is about. Strictly
  derived from the posting, neutral tone, no hype, no invented facts.
- responsibilities: the posting's own "what you'll do"/responsibilities
  bullets, one array item per bullet, each copied verbatim.
- requiredSkills: the required/minimum qualifications bullets, verbatim,
  one per item.
- preferredSkills: preferred/bonus/nice-to-have qualifications bullets,
  verbatim, one per item ("Bonus:" prefixed items belong here).
- applicationUrl: only if an explicit application/job URL appears.
- postedAt: resolve posting-date markers to ISO (YYYY-MM-DD) using
  today's date. "8 hours ago"/"today" → today; "Reposted 3 days ago" → 3
  days back; "1 week ago" → 7 days back. Lower-bound markers ("Posted
  30+ Days Ago") → null. No marker → null.

Job posting text:
"""
${text}
"""`;
}

const responseSchema = {
  type: 'OBJECT',
  properties: {
    company: { type: 'STRING', nullable: true },
    title: { type: 'STRING', nullable: true },
    location: { type: 'STRING', nullable: true },
    salary: { type: 'STRING', nullable: true },
    summary: { type: 'STRING', nullable: true },
    responsibilities: { type: 'ARRAY', items: { type: 'STRING' } },
    requiredSkills: { type: 'ARRAY', items: { type: 'STRING' } },
    preferredSkills: { type: 'ARRAY', items: { type: 'STRING' } },
    applicationUrl: { type: 'STRING', nullable: true },
    postedAt: { type: 'STRING', nullable: true },
    sourceSite: { type: 'STRING', nullable: true },
  },
  required: [
    'company',
    'title',
    'location',
    'salary',
    'summary',
    'responsibilities',
    'requiredSkills',
    'preferredSkills',
    'applicationUrl',
    'postedAt',
    'sourceSite',
  ],
} as const;

export const handler: Schema['extractJob']['functionHandler'] = async (
  event,
) => {
  // The browser sends its local calendar date so relative markers
  // ("8 hours ago") resolve in the user's timezone, not the Lambda's UTC.
  const today =
    event.arguments.today ?? new Date().toISOString().slice(0, 10);

  return callGeminiJson({
    apiKey: requireApiKey(),
    prompt: buildPrompt(event.arguments.text, today),
    responseSchema,
  });
};
