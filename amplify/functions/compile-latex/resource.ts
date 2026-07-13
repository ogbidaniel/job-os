import { defineFunction } from '@aws-amplify/backend';

export const compileLatex = defineFunction({
  name: 'compile-latex',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
});
