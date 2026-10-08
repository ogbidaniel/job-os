import { AiError, type AiAdapter, type AiJsonRequest } from './ai-types';

/**
 * OpenAI adapter — the fallback provider when Gemini exhausts its models.
 *
 * Prompts and schemas are authored in Gemini's dialect (see ./ai-types.ts),
 * so this file translates the schema on the way out.
 */

interface OpenAiResponse {
  choices?: Array<{
    message?: { content?: string; refusal?: string | null };
    finish_reason?: string;
  }>;
  error?: { message?: string };
}

/** Gemini's uppercase type names → JSON Schema's lowercase ones. */
const TYPE_MAP: Record<string, string> = {
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
  INTEGER: 'integer',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
};

interface GeminiSchemaNode {
  type?: string;
  nullable?: boolean;
  description?: string;
  enum?: string[];
  items?: GeminiSchemaNode;
  properties?: Record<string, GeminiSchemaNode>;
  required?: string[];
}

/**
 * Translates a Gemini structured-output schema into the JSON Schema that
 * OpenAI's strict mode accepts. Strict mode is unforgiving in three ways
 * the Gemini dialect is not: types are lowercase, `nullable` has to become
 * a type union, and EVERY property must be listed in `required` with
 * `additionalProperties: false` alongside it.
 */
export function geminiSchemaToJsonSchema(schema: object): object {
  return translate(schema as GeminiSchemaNode);
}

function translate(node: GeminiSchemaNode): Record<string, unknown> {
  const baseType = TYPE_MAP[node.type ?? 'STRING'] ?? 'string';
  const out: Record<string, unknown> = {
    type: node.nullable ? [baseType, 'null'] : baseType,
  };
  if (node.description) out.description = node.description;
  if (node.enum) out.enum = node.enum;

  if (baseType === 'array' && node.items) {
    out.items = translate(node.items);
  }

  if (baseType === 'object' && node.properties) {
    const properties: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node.properties)) {
      properties[key] = translate(value);
    }
    out.properties = properties;
    // Strict mode requires every key present, not just the ones Gemini
    // marked required. Optionality is expressed by nullable types instead.
    out.required = Object.keys(node.properties);
    out.additionalProperties = false;
  }

  return out;
}

export function openAiAdapter(model: string, apiKey: string): AiAdapter {
  return {
    provider: 'openai',
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
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      // Temperature is deliberately omitted: the reasoning-era models
      // reject a non-default value with a 400, which would be a permanent
      // failure on our last-resort provider. Strict schema + a verbatim
      // prompt already constrain the output.
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'job_os_response',
          strict: true,
          schema: geminiSchemaToJsonSchema(responseSchema),
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AiError(
      `OpenAI ${model} failed (HTTP ${response.status}): ${body.slice(0, 300)}`,
      'openai',
      model,
      response.status === 429 || response.status >= 500,
    );
  }

  const payload = (await response.json()) as OpenAiResponse;
  const choice = payload.choices?.[0];

  if (choice?.message?.refusal) {
    throw new AiError(
      `OpenAI ${model} refused: ${choice.message.refusal.slice(0, 200)}`,
      'openai',
      model,
      false,
    );
  }

  const raw = choice?.message?.content;
  if (!raw) {
    const finish = choice?.finish_reason;
    throw new AiError(
      `OpenAI ${model} returned no content${finish ? ` (finish_reason ${finish})` : ''}`,
      'openai',
      model,
      finish !== 'length',
    );
  }

  try {
    JSON.parse(raw);
  } catch {
    throw new AiError(
      `OpenAI ${model} returned unparseable JSON: ${raw.slice(0, 200)}`,
      'openai',
      model,
      false,
    );
  }
  return raw;
}
