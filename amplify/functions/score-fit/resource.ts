import { defineFunction, secret } from '@aws-amplify/backend';

export const scoreFit = defineFunction({
  name: 'score-fit',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
