"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAuthContext } from "@/lib/auth/user-context";

export function UserProfileButton() {
  const { isLoaded, isSignedIn, user, isPlaceholderMode } = useAuthContext();

  if (!isLoaded) {
    return (
      <div className="w-28 h-8 rounded-full bg-card border border-border" />
    );
  }

  if (isPlaceholderMode) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-semibold shadow-sm hover:bg-muted transition-colors" title="Development Placeholder Mode Active">
        <span className="w-2 h-2 rounded-full bg-muted" />
        <span className="truncate max-w-[120px]">{user?.email || "dev@reelforge.ai"}</span>
        <span className="text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded text-primary-200 font-bold tracking-wider">
          Dev
        </span>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[140px]">
            {user?.fullName || "ReelForge User"}
          </span>
          <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
            {user?.tier || "Free"} Plan
          </span>
        </div>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-9 h-9 rounded-full ring-2 ring-border hover:ring-border transition-all shadow-md",
              userButtonPopoverCard: "bg-card border border-border text-slate-100 shadow-none rounded-md",
            },
          }}
        />
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-muted hover: hover: text-white text-xs font-bold transition-all shadow-md"
    >
      Sign In &rarr;
    </Link>
  );
}
