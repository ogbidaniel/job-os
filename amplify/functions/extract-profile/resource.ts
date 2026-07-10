import { defineFunction, secret } from '@aws-amplify/backend';

export const extractProfile = defineFunction({
  name: 'extract-profile',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 256,
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
});
