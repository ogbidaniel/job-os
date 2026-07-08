# AI provider implementations

One file per provider (`gemini.ts`, `openai.ts`, `anthropic.ts`,
`ollama.ts`, `lmstudio.ts`, `openrouter.ts`), each implementing the
`AiProvider` interface from `../provider.ts`.

Security rule: cloud providers must NOT hold API keys in browser code.
They call an Amplify Function (Lambda) proxy that owns the keys. Local
providers (Ollama, LM Studio, OpenAI-compatible localhost endpoints) may
call their HTTP endpoint directly from the browser.
