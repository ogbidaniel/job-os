import { Settings } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Application preferences, including AI provider and model selection later."
      />
      <EmptyState
        icon={Settings}
        title="No settings yet"
        description="AI provider selection (Gemini, OpenAI, Anthropic, Ollama, ...) will be configured here."
      />
    </>
  );
}
