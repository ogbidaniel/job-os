import type { Schema } from '../../data/resource';
import { callGeminiJson, requireApiKey } from '../shared/gemini';

/**
 * Prompt version: profile-extract.v1.1
 * Splits a pasted master career document into the Profile singleton,
 * Experience entries, and Evidence entries. Verbatim-leaning: bullets are
 * copied as written; nothing is invented.
 * v1.1: bullets must be newline-separated inside description (v1 joined
 * them into one line, breaking the bullet-list rendering).
 */
function buildPrompt(text: string): string {
  return `You split a personal career document (a "master resume" or
career profile) into structured records. Copy wording verbatim from the
document — never invent, embellish, or infer facts that are not written.

Return three parts:

1. profile — contact/header info:
   fullName, headline (their professional one-liner, may be taken from a
   summary heading), location, email, phone, linkedin, github, website
   (full URLs when present; prefix "https://" if the document shows a
   bare domain), summary (their professional summary paragraph verbatim).
   Missing fields → null.

2. experiences — one entry per role, degree, or substantial project:
   - kind: "WORK" (jobs, internships, research assistant roles),
     "EDUCATION" (degrees, diplomas), "PROJECT" (personal/independent
     projects), "VOLUNTEER" (volunteering, community, student leadership),
     "OTHER" when unclear.
   - title (role or degree name), organization, location.
   - startDate/endDate as ISO dates: "January 2025" → "2025-01-01",
     year-only → "YYYY-01-01"; null when absent. isCurrent = true for
     "Present"/ongoing.
   - description: that entry's bullet points copied verbatim. Each bullet
     MUST be its own line: separate bullets with the newline character
     ("\\n" inside the JSON string). Do not merge bullets into one line,
     do not include bullet characters like "-" or "•".
   - skills: technologies/skills explicitly named in that entry's text.

3. evidence — verifiable artifacts:
   - kind: "CERTIFICATE" (certifications), "PAPER" (publications,
     preprints, papers under review), "VIDEO" (YouTube/video content),
     "POST" (social/blog posts), "ARTICLE" (blogs, write-ups),
     "RECOMMENDATION" (recommendations/references), "OTHER" (conference
     presentations, awards, hackathon placements, live project links).
   - title, url (only if written in the document), source (e.g. "arXiv",
     "AWS", "YouTube", "IEEE Access"), date (ISO, null when absent),
     description (verbatim, brief), skills.
   - Publications and certifications belong here (not in experiences).
     A personal project may appear BOTH as a PROJECT experience and, when
     it has a public URL, as an evidence item linking to it.

Career document:
"""
${text}
"""`;
}

const experienceSchema = {
  type: 'OBJECT',
  properties: {
    kind: { type: 'STRING' },
    title: { type: 'STRING' },
    organization: { type: 'STRING', nullable: true },
    location: { type: 'STRING', nullable: true },
    startDate: { type: 'STRING', nullable: true },
    endDate: { type: 'STRING', nullable: true },
    isCurrent: { type: 'BOOLEAN', nullable: true },
    description: { type: 'STRING', nullable: true },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['kind', 'title', 'skills'],
} as const;

const evidenceSchema = {
  type: 'OBJECT',
  properties: {
    kind: { type: 'STRING' },
    title: { type: 'STRING' },
    url: { type: 'STRING', nullable: true },
    source: { type: 'STRING', nullable: true },
    date: { type: 'STRING', nullable: true },
    description: { type: 'STRING', nullable: true },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['kind', 'title', 'skills'],
} as const;

const responseSchema = {
  type: 'OBJECT',
  properties: {
    profile: {
      type: 'OBJECT',
      properties: {
        fullName: { type: 'STRING', nullable: true },
        headline: { type: 'STRING', nullable: true },
        location: { type: 'STRING', nullable: true },
        email: { type: 'STRING', nullable: true },
        phone: { type: 'STRING', nullable: true },
        linkedin: { type: 'STRING', nullable: true },
        github: { type: 'STRING', nullable: true },
        website: { type: 'STRING', nullable: true },
        summary: { type: 'STRING', nullable: true },
      },
    },
    experiences: { type: 'ARRAY', items: experienceSchema },
    evidence: { type: 'ARRAY', items: evidenceSchema },
  },
  required: ['profile', 'experiences', 'evidence'],
} as const;

export const handler: Schema['extractProfile']['functionHandler'] = async (
  event,
) => {
  return callGeminiJson({
    apiKey: requireApiKey(),
    prompt: buildPrompt(event.arguments.text),
    responseSchema,
  });
};
