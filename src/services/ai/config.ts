import type { AiProviderId, AiTask } from "./types";

export interface AiTaskConfig {
  provider: AiProviderId;
  model: string;
  temperature?: number;
}

export interface AiRetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
}

export interface AiRateLimitConfig {
  requestsPerMinute: number;
}

/**
 * Provider selection is configuration, not code: the Settings feature
 * will read and write this shape once the AI milestone lands.
 */
export interface AiConfig {
  defaults: AiTaskConfig;
  perTask: Partial<Record<AiTask, AiTaskConfig>>;
  retry: AiRetryConfig;
  rateLimit: AiRateLimitConfig;
  /** Providers tried in order when the active provider fails. */
  fallbackChain: AiProviderId[];
}
