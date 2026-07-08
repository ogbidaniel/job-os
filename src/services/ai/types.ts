/** Tasks the AI layer performs for the app. */
export type AiTask =
  | "resume-draft"
  | "cover-letter"
  | "bullet-rewrite"
  | "summary-improve"
  | "keyword-extract";

export type AiProviderId =
  | "gemini"
  | "openai"
  | "anthropic"
  | "ollama"
  | "lmstudio"
  | "openrouter";

export interface AiGenerateRequest {
  task: AiTask;
  /** Versioned prompt template id, e.g. "resume-draft.v1". */
  promptVersion: string;
  /** Template variables (job description, master resume text, ...). */
  input: Record<string, string>;
  /** Overrides the configured model for this call. */
  model?: string;
  signal?: AbortSignal;
}

export interface AiResult {
  text: string;
  model: string;
  provider: AiProviderId;
}

export interface AiStreamChunk {
  delta: string;
  done: boolean;
}
