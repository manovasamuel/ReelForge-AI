"use client";

import { useRouter } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export default function ProfilesPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Profiles"
        description="Manage Instagram profiles and run competitor analysis."
      >
        <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40">
          <Plus className="mr-2 h-4 w-4" />
          Analyze Profile
        </Button>
      </PageHeader>

      <EmptyState
        icon={Users}
        title="No profiles yet"
        description="Paste an Instagram profile URL to start your first competitor analysis."
        action={{
          label: "Add Your First Profile",
          onClick: () => {
            // Will open dialog in Phase 1
          },
        }}
      />
    </PageContainer>
  );
}
