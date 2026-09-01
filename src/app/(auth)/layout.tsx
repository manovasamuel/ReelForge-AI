import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
          <Logo textClassName="text-xl" />
        </Link>
        <p className="text-sm text-muted-foreground mt-2">Content Intelligence Platform</p>
      </div>

      {/* Auth Modal Container */}
      <div className="w-full max-w-md flex justify-center">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} ReelForge AI. All rights reserved.
      </div>
    </div>
  );
}
