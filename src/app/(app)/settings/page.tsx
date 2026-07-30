import { PageContainer, PageHeader } from "@/components/layout";
import { SettingsDashboard } from "@/components/settings";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your AI providers, API keys, and workspace preferences."
      />
      <SettingsDashboard />
    </PageContainer>
  );
}
