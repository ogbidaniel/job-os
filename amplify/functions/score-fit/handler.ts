import type { Schema } from '../../data/resource';
import { callGeminiJson, requireApiKey } from '../shared/gemini';

/**
 * Prompt version: fit-score.v1
 * Scores how well the user's profile matches a job. Judgement may ONLY
 * use what the profile states — no assumed or implied skills.
 */
function buildPrompt(jobContext: string, profileContext: string): string {
  return `You assess how well a candidate profile matches a job posting.

Rules:
- Judge ONLY from the provided profile. Never credit a skill or
  experience that is not explicitly evidenced in the profile text.
- Be conservative and honest: name real gaps plainly. A missing hard
  requirement (e.g. years of experience, a required technology) must
  lower the score and appear in gaps.
- score: integer 0-100. Calibration: 85+ = meets essentially all hard
  requirements with direct evidence; 60-84 = strong overlap with some
  gaps; 40-59 = partial match, several hard requirements unevidenced;
  below 40 = weak match.
- matchedSkills: skills/requirements from the JOB that the profile
  directly evidences (short phrases).
- gaps: job requirements the profile does not evidence (short phrases).
- summary: 2-3 plain sentences explaining the score, written to the
  candidate ("You ...").

JOB:
"""
${jobContext}
"""

CANDIDATE PROFILE:
"""
${profileContext}
"""`;
}

const responseSchema = {
  type: 'OBJECT',
  properties: {
    score: { type: 'INTEGER' },
    summary: { type: 'STRING' },
    matchedSkills: { type: 'ARRAY', items: { type: 'STRING' } },
    gaps: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['score', 'summary', 'matchedSkills', 'gaps'],
} as const;

export const handler: Schema['scoreFit']['functionHandler'] = async (
  event,
) => {
  return callGeminiJson({
    apiKey: requireApiKey(),
    prompt: buildPrompt(
      event.arguments.jobContext,
      event.arguments.profileContext,
    ),
    responseSchema,
  });
};
