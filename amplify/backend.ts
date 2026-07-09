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
