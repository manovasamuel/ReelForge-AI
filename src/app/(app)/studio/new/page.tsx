"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewStudioPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a new ID and redirect to the specific studio workspace
    const newId = crypto.randomUUID();
    router.replace(`/studio/${newId}?step=profile`);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-transparent" />
    </div>
  );
}
