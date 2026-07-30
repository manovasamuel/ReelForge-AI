import { PageContainer, PageHeader } from "@/components/layout";
import { ExportCenter } from "@/components/export";

export default function ExportPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Export Center"
        description="Download your generated content packages and analysis reports."
      />
      <ExportCenter project={null} />
    </PageContainer>
  );
}
