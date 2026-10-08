import { defineFunction, secret } from '@aws-amplify/backend';

export const extractJob = defineFunction({
  name: 'extract-job',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
    // Fallback provider: the chain in shared/ai.ts skips a provider whose
    // key is blank, so this stays safe before the secret is set.
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
});
