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
 * The whole app is private, so the Authenticator wraps everything once;
 * no per-route guards. QueryClientProvider sits inside it so data hooks
 * only ever run authenticated.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Authenticator>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </Authenticator>
  );
}
