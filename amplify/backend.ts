import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { extractJob } from './functions/extract-job/resource';

const backend = defineBackend({
  auth,
  data,
  extractJob,
});

// Single-user app and the owner accounts exist: close Cognito self-signup
// at the pool level (hideSignUp alone leaves the SignUp API callable).
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

// Data protection: point-in-time recovery (35-day continuous backup) and
// deletion protection, so a destructive schema change (model rename or
// delete) fails the deploy instead of silently dropping a table.
// Note: this applies to sandbox tables too — `ampx sandbox delete`
// requires flipping this off first, by design.
const { amplifyDynamoDbTables } = backend.data.resources.cfnResources;
for (const table of Object.values(amplifyDynamoDbTables)) {
  table.pointInTimeRecoveryEnabled = true;
  table.deletionProtectionEnabled = true;
}
