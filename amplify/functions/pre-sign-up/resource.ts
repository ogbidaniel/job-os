import { defineFunction, secret } from '@aws-amplify/backend';

export const preSignUp = defineFunction({
  name: 'pre-sign-up',
  entry: './handler.ts',
  timeoutSeconds: 10,
  memoryMB: 128,
  environment: {
    // Gate for real deployments. Set per sandbox with
    // `npx ampx sandbox secret set INVITE_CODE`; a sandbox may set it to
    // `none` to leave self-signup open for local development.
    INVITE_CODE: secret('INVITE_CODE'),
  },
});
