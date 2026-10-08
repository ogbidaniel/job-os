import type { ReactNode } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/query-client";
import "@aws-amplify/ui-react/styles.css";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Invite code is optional in the form because the backend decides whether
 * it matters: the preSignUp trigger leaves signup open when INVITE_CODE is
 * unset (developer sandboxes) and rejects a mismatch otherwise. Marking it
 * required here would block sandbox signups that need no code.
 */
const formFields = {
  signUp: {
    "custom:inviteCode": {
      label: "Invite code",
      placeholder: "Invite code (leave blank in a dev sandbox)",
      order: 99,
      isRequired: false,
    },
  },
};

/**
 * The whole app is private, so the Authenticator wraps everything once;
 * no per-route guards. QueryClientProvider sits inside it so data hooks
 * only ever run authenticated.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Authenticator formFields={formFields}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </Authenticator>
  );
}
