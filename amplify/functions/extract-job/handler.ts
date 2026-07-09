import type { Schema } from '../../data/resource';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Prompt version: job-extract.v2
 * v2 (after acceptance test on real LinkedIn/Workday/Indeed pastes):
 * verbatim-only copying, site-noise handling, agency-company rule, and
 * strict relative-date resolution (lower-bound markers like "30+ days
 * ago" become null instead of a guessed date).
 * Anti-fabrication is non-negotiable: only facts present in the pasted
 * text may be returned; everything else must be null.
 */
function buildPrompt(text: string, today: string): string {
  return `You extract structured data from job postings copied from job sites
(LinkedIn, Indeed, Workday career pages, company sites).

Today's date is ${today}.

Pasted text often contains website noise: navigation menus, "Premium"
upsells, applicant counts, "People you can reach out to" blocks, company
follower counts, other job cards, and cookie banners. Ignore the noise.
If more than one job posting appears, extract ONLY the first complete
posting.

Rules — these are strict:
- COPY, DO NOT WRITE. Every extracted value must be copied verbatim from
  the posting. Never summarize, paraphrase, rephrase, reorder, or
  "improve" the wording. Preserve the original line breaks, bullet lines,
  and section headings inside multi-line fields.
- Use ONLY information present in the text. Never guess or invent.
  Return null for anything not present.
- company: the posting company's name exactly as written. For staffing or
  recruitment agencies, use the agency name shown — do not infer the
  client company's name.
- title: the job title. If the posting body contains an explicit
  "Job Title:" field, prefer it over page headers.
- location: as written, keeping remote/hybrid/on-site markers
  (e.g., "United States (Remote)", "Houston, TX (On-site)").
- salary: exactly as written (e.g., "$200K/yr - $350K/yr",
  "Up to $100 an hour", "$112,800.00 - $150,500.00"). null if not stated.
- description: the complete job description body (the "About the job" /
  overview / responsibilities / benefits sections) copied verbatim with
  its original line breaks and bullets. Exclude only website noise.
- requirements: the qualifications/requirements section(s) copied
  verbatim (e.g., "What They're Looking For", "Required Skills",
  "Qualifications", "What You Bring"). Duplicating part of description is
  fine. null if there is no distinct requirements section.
- applicationUrl: only if an explicit application/job URL appears in the
  text.
- postedAt: resolve posting-date markers to an ISO date (YYYY-MM-DD)
  using today's date. "8 hours ago" or "today" → today.
  "Reposted 3 days ago" → 3 days before today. "1 week ago" → 7 days
  before today. Lower-bound markers like "Posted 30+ Days Ago" → null
  (exact date unknown). No marker at all → null.

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
    description: { type: 'STRING', nullable: true },
    requirements: { type: 'STRING', nullable: true },
    applicationUrl: { type: 'STRING', nullable: true },
    postedAt: { type: 'STRING', nullable: true },
  },
  required: [
    'company',
    'title',
    'location',
    'salary',
    'description',
    'requirements',
    'applicationUrl',
    'postedAt',
  ],
} as const;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

interface ExtractionResult {
  company: string | null;
  title: string | null;
  location: string | null;
  salary: string | null;
  description: string | null;
  requirements: string | null;
  applicationUrl: string | null;
  postedAt: string | null;
}

export const handler: Schema['extractJob']['functionHandler'] = async (
  event,
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY secret is not configured');
  }

  // The browser sends its local calendar date so relative markers
  // ("8 hours ago") resolve in the user's timezone, not the Lambda's UTC.
  const today =
    event.arguments.today ?? new Date().toISOString().slice(0, 10);

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(event.arguments.text, today) }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Gemini request failed (${response.status}): ${body.slice(0, 300)}`,
    );
  }

  const payload = (await response.json()) as GeminiResponse;
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error('Gemini returned no content');
  }

  return JSON.parse(raw) as ExtractionResult;
};
