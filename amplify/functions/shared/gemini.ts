import { AiError, type AiAdapter, type AiJsonRequest } from './ai-types';

/**
 * Gemini adapter. One model, one attempt — retries and model fallback are
 * the chain's job (see ./ai.ts), not this file's.
 */

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

export function geminiAdapter(model: string, apiKey: string): AiAdapter {
  return {
    provider: 'gemini',
    model,
    generate: (request, signal) => generate(model, apiKey, request, signal),
  };
}

async function generate(
  model: string,
  apiKey: string,
  { prompt, responseSchema }: AiJsonRequest,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      signal,
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
    throw new AiError(
      `Gemini ${model} failed (HTTP ${response.status}): ${body.slice(0, 300)}`,
      'gemini',
      model,
      response.status === 429 || response.status >= 500,
    );
  }

  const payload = (await response.json()) as GeminiResponse;

  // A safety block returns 200 with no candidate text. Permanent for this
  // model — retrying the identical prompt blocks again, so fail over.
  const blockReason = payload.promptFeedback?.blockReason;
  if (blockReason) {
    throw new AiError(
      `Gemini ${model} blocked the prompt (${blockReason})`,
      'gemini',
      model,
      false,
    );
  }

  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    const finish = payload.candidates?.[0]?.finishReason;
    // MAX_TOKENS means the output was truncated mid-JSON: a bigger budget
    // or a smaller ask is needed, so retrying unchanged is pointless.
    throw new AiError(
      `Gemini ${model} returned no content${finish ? ` (finishReason ${finish})` : ''}`,
      'gemini',
      model,
      finish !== 'MAX_TOKENS',
    );
  }

  try {
    JSON.parse(raw); // validate before handing it on
  } catch {
    throw new AiError(
      `Gemini ${model} returned unparseable JSON: ${raw.slice(0, 200)}`,
      'gemini',
      model,
      false,
    );
  }
  return raw;
}
