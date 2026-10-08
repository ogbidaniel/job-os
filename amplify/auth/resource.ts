import { defineAuth } from '@aws-amplify/backend';
import { preSignUp } from '../functions/pre-sign-up/resource';

/**
 * Cognito email login.
 *
 * Self-signup is open at the pool level and gated by the preSignUp
 * trigger instead (see that handler for why). The previous
 * `allowAdminCreateUserOnly` override in backend.ts closed the SignUp API
 * outright — that suited a one-person app, but it also means a developer
 * cannot create an account in their own sandbox, which blocks local work
 * on anything behind the login.
 *
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    // Carries the invite code to the preSignUp trigger. Immutable: it is
    // proof of invitation at signup, not a profile field.
    'custom:inviteCode': {
      dataType: 'String',
      mutable: false,
      maxLen: 64,
      minLen: 0,
    },
  },
  triggers: {
    preSignUp,
  },
});
