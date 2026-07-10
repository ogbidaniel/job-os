const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

export interface GeminiJsonRequest {
  apiKey: string;
  prompt: string;
  /** Gemini structured-output schema (OBJECT/ARRAY/STRING/INTEGER...). */
  responseSchema: object;
}

/**
 * Calls Gemini with structured JSON output at temperature 0 and returns
 * the raw JSON text (validated parseable). Callers pass it through to the
 * client, which parses and types it in the feature service.
 */
export async function callGeminiJson({
  apiKey,
  prompt,
  responseSchema,
}: GeminiJsonRequest): Promise<string> {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
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
  JSON.parse(raw); // validate before returning
  return raw;
}

export function requireApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY secret is not configured');
  }
  return apiKey;
}
