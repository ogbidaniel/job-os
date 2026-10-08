/**
 * Provider-neutral contract for structured JSON generation.
 *
 * The canonical schema dialect is Gemini's structured-output format
 * (uppercase OBJECT/STRING/ARRAY/INTEGER, `nullable: true`). It was here
 * first and every prompt already uses it; other providers translate from
 * it rather than the other way round.
 */
export interface AiJsonRequest {
  prompt: string;
  responseSchema: object;
}

export type AiProviderId = 'gemini' | 'openai';

export interface AiAdapter {
  readonly provider: AiProviderId;
  readonly model: string;
  /**
   * Returns raw JSON text, already validated as parseable. The signal
   * carries the chain's per-attempt deadline — adapters must pass it to
   * fetch so a slow model can be abandoned rather than eating the whole
   * 30s AppSync budget.
   */
  generate(request: AiJsonRequest, signal: AbortSignal): Promise<string>;
}

/**
 * Transient means "the same request might succeed on retry" (429, 5xx,
 * empty completion). Everything else — a malformed request, a revoked key,
 * a safety block — is permanent for this model, so the chain moves on to
 * the next model immediately instead of burning the retry budget.
 */
export class AiError extends Error {
  constructor(
    message: string,
    readonly provider: AiProviderId,
    readonly model: string,
    readonly transient: boolean,
  ) {
    super(message);
    this.name = 'AiError';
  }
}
