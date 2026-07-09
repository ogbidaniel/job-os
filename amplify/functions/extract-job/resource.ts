import { defineFunction, secret } from '@aws-amplify/backend';

export const extractJob = defineFunction({
  name: 'extract-job',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
