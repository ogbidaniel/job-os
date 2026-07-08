import type {
  AiGenerateRequest,
  AiProviderId,
  AiResult,
  AiStreamChunk,
} from "./types";

/**
 * Contract every AI provider implements. The rest of the app never knows
 * which provider is active; it only speaks this interface.
 *
 * Transport-agnostic on purpose: local providers (Ollama, LM Studio) may
 * call the model directly from the browser, while cloud providers
 * (Gemini, OpenAI, Anthropic, OpenRouter) must go through a backend proxy
 * (Amplify Function) so API keys never reach the client.
 */
export interface AiProvider {
  readonly id: AiProviderId;
  generate(request: AiGenerateRequest): Promise<AiResult>;
  stream(request: AiGenerateRequest): AsyncIterable<AiStreamChunk>;
}
