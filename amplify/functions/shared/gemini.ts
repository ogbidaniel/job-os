/**
 * Model preference order: on transient failures (429/5xx) we retry and
 * then fall back to the lighter model — availability beats picking the
 * ideal model, and both handle extraction well.
 */
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;
const RETRY_DELAY_MS = 1500;

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

class TransientGeminiError extends Error {}

async function requestOnce(
  model: string,
  { apiKey, prompt, responseSchema }: GeminiJsonRequest,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
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
    },
  );

  if (!response.ok) {
    const body = await response.text();
    const message = `Gemini request failed (${response.status}): ${body.slice(0, 300)}`;
    if (response.status === 429 || response.status >= 500) {
      throw new TransientGeminiError(message);
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as GeminiResponse;
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new TransientGeminiError('Gemini returned no content');
  }
  JSON.parse(raw); // validate before returning
  return raw;
}

/**
 * Calls Gemini with structured JSON output at temperature 0 and returns
 * the raw JSON text (validated parseable). Retries transient failures,
 * falling back across models. Callers pass the string through to the
 * client, which parses and types it in the feature service.
 */
export async function callGeminiJson(
  request: GeminiJsonRequest,
): Promise<string> {
  let lastError: Error = new Error('Gemini call not attempted');

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await requestOnce(model, request);
      } catch (error) {
        if (!(error instanceof TransientGeminiError)) throw error;
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}

export function requireApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY secret is not configured');
  }
  return apiKey;
}
