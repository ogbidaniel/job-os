import type { PreSignUpTriggerHandler } from 'aws-lambda';

/**
 * Invite gate for self-signup.
 *
 * Job OS is open to people the owner invites, not the public: the AI and
 * LaTeX paths cost real money per call, so an ungated signup form is an
 * open tab on someone else's bill.
 *
 * Disabled deliberately when INVITE_CODE is absent or `none`, which is how
 * a developer sandbox runs — a teammate needs to register an account in
 * their own stack to use the app at all, and making them configure a
 * shared code first just to log into their own sandbox is friction with no
 * security value (the stack is already private to them).
 */
const OPEN_SIGNUP_SENTINELS = new Set(['', 'none', 'unset', 'placeholder']);

export const handler: PreSignUpTriggerHandler = async (event) => {
  const required = (process.env.INVITE_CODE ?? '').trim();

  if (OPEN_SIGNUP_SENTINELS.has(required.toLowerCase())) {
    return event;
  }

  const submitted = (
    event.request.validationData?.inviteCode ??
    event.request.clientMetadata?.inviteCode ??
    event.request.userAttributes['custom:inviteCode'] ??
    ''
  ).trim();

  if (submitted !== required) {
    // Surfaced verbatim to the signup form by Cognito, so it has to read
    // as user-facing copy rather than an internal error.
    throw new Error('That invite code is not valid. Ask the Job OS owner for a current one.');
  }

  return event;
};
