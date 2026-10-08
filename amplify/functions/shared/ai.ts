import { AiError, type AiAdapter, type AiJsonRequest } from './ai-types';
import { geminiAdapter } from './gemini';
import { openAiAdapter } from './openai';

/**
 * Provider-agnostic structured-JSON entry point used by every AI handler.
 *
 * Why a chain rather than Gemini's old in-file retry: the failure that
 * prompted this wasn't a rate limit, it was one posting that Gemini
 * refused outright. Retrying the same model can't fix that, so the chain
 * falls over to the NEXT MODEL on any failure — transient or not — and
 * only spends its retry budget on the transient ones.
 *
 * Order is preference order: cheapest capable model first, a different
 * provider last so a provider-wide outage or a model-specific refusal
 * still resolves.
 */

const DEFAULT_CHAIN = [
  'gemini:gemini-3.5-flash-lite',
  'openai:gpt-5.4-mini',
] as const;

const TRANSIENT_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1500;

/**
 * AppSync hard-caps a custom query at 30s and the Lambda times out there
 * too, so the chain has to police itself: without a per-attempt deadline a
 * single slow model eats the entire budget and the fallback never runs —
 * strictly worse than having no fallback at all. Measured on the
 * extract-job prompt: gemini-3.5-flash-lite 1.8s, gemini-2.5-flash 4.0s,
 * gemini-3.5-flash 33-37s — that last one is why 3.5-flash is not in the
 * chain, and why the deadline exists even though nothing in the chain
 * needs it today.
 */
const ATTEMPT_TIMEOUT_MS = Number(process.env.AI_ATTEMPT_TIMEOUT_MS ?? 12_000);
/** Stop starting new attempts once this much of the 30s is gone. */
const TOTAL_BUDGET_MS = Number(process.env.AI_TOTAL_BUDGET_MS ?? 25_000);

export interface AiJsonResult {
  /** Raw JSON text from the model, validated parseable. */
  text: string;
  /** e.g. "gemini:gemini-2.5-flash" — the model that actually answered. */
  model: string;
}

/**
 * Amplify's secret() fails a deploy when the secret is missing, so every
 * sandbox must define every AI key even if its owner only has one. A
 * placeholder stands in for 'not configured' and drops that provider from
 * the chain, rather than wasting an attempt on a key that cannot work.
 */
const PLACEHOLDER_KEYS = new Set(['none', 'unset', 'placeholder', 'todo']);

function configuredKey(value: string | undefined): string | undefined {
  const key = value?.trim();
  if (!key || PLACEHOLDER_KEYS.has(key.toLowerCase())) return undefined;
  return key;
}

function buildChain(): AiAdapter[] {
  const spec = process.env.AI_MODEL_CHAIN?.trim();
  const entries = spec ? spec.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_CHAIN;

  const geminiKey = configuredKey(process.env.GEMINI_API_KEY);
  const openAiKey = configuredKey(process.env.OPENAI_API_KEY);
  const adapters: AiAdapter[] = [];

  for (const entry of entries) {
    const [provider, model] = entry.split(':');
    if (!model) continue;
    // A provider with no key configured is skipped rather than fatal, so
    // the app keeps working before a second key has been set.
    if (provider === 'gemini' && geminiKey) {
      adapters.push(geminiAdapter(model, geminiKey));
    } else if (provider === 'openai' && openAiKey) {
      adapters.push(openAiAdapter(model, openAiKey));
    }
  }

  return adapters;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function failAll(failures: string[]): never {
  throw new Error(`All AI providers failed. ${failures.join(' | ')}`);
}

/**
 * Runs the chain and returns the first successful JSON response.
 * Throws with every model's failure reason attached — an opaque
 * "extraction failed" toast is useless when three models were involved.
 */
export async function callAiJson(
  request: AiJsonRequest,
): Promise<AiJsonResult> {
  const chain = buildChain();
  if (chain.length === 0) {
    throw new Error(
      'No AI provider configured: set the GEMINI_API_KEY or OPENAI_API_KEY secret',
    );
  }

  const failures: string[] = [];
  const startedAt = Date.now();
  const remaining = () => TOTAL_BUDGET_MS - (Date.now() - startedAt);

  for (const adapter of chain) {
    for (let attempt = 0; attempt < TRANSIENT_ATTEMPTS; attempt += 1) {
      const budget = remaining();
      if (budget <= 0) {
        failures.push(
          `budget exhausted before ${adapter.provider}:${adapter.model}`,
        );
        return failAll(failures);
      }

      // Never let one attempt outlive the remaining budget.
      const timeout = Math.min(ATTEMPT_TIMEOUT_MS, budget);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        return {
          text: await adapter.generate(request, controller.signal),
          model: `${adapter.provider}:${adapter.model}`,
        };
      } catch (error) {
        // A model that blew its deadline will blow it again — don't retry
        // it, move on to the next one while there is still budget left.
        const timedOut = controller.signal.aborted;
        failures.push(
          timedOut
            ? `${adapter.provider}:${adapter.model} exceeded ${timeout}ms`
            : error instanceof Error
              ? error.message
              : String(error),
        );
        const transient = !timedOut && error instanceof AiError && error.transient;
        if (!transient) break; // permanent for this model — next model
        if (attempt < TRANSIENT_ATTEMPTS - 1) await sleep(RETRY_DELAY_MS);
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return failAll(failures);
}

/**
 * Convenience wrapper for handlers: runs the chain and stamps `_model`
 * into the returned object so the UI can show which model answered (a
 * silent downgrade to a lighter model is otherwise invisible).
 */
export async function callAiJsonTagged(request: AiJsonRequest): Promise<string> {
  const { text, model } = await callAiJson(request);
  const parsed = JSON.parse(text) as Record<string, unknown>;
  return JSON.stringify({ ...parsed, _model: model });
}
