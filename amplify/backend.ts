import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { compileLatex } from './functions/compile-latex/resource';
import { extractJob } from './functions/extract-job/resource';
import { preSignUp } from './functions/pre-sign-up/resource';
import { scoreFit } from './functions/score-fit/resource';

const backend = defineBackend({
  auth,
  data,
  compileLatex,
  extractJob,
  preSignUp,
  scoreFit,
});

/**
 * 'sandbox' for a developer's personal stack (`ampx sandbox`), 'branch' for
 * a CI/CD deploy of a git branch. Several guards below depend on the
 * difference: a sandbox is disposable and private to one developer, a
 * branch deploy holds real user data.
 */
const deploymentType = backend.stack.node.tryGetContext('amplify-backend-type');
const isSandbox = deploymentType === 'sandbox';

/**
 * Data protection for real deployments only: point-in-time recovery
 * (35-day continuous backup) and deletion protection, so a destructive
 * schema change (model rename or delete) fails the deploy instead of
 * silently dropping a table.
 *
 * Deliberately skipped in sandboxes. Applying it there makes
 * `ampx sandbox delete` fail until a developer edits this file — a trap
 * every teammate would hit the first time they try to clean up, and it
 * also leaves orphaned tables behind in the account.
 */
const { amplifyDynamoDbTables } = backend.data.resources.cfnResources;
for (const table of Object.values(amplifyDynamoDbTables)) {
  table.pointInTimeRecoveryEnabled = !isSandbox;
  table.deletionProtectionEnabled = !isSandbox;
}
