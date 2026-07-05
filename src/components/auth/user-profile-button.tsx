"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAuthContext } from "@/lib/auth/user-context";

export function UserProfileButton() {
  const { isLoaded, isSignedIn, user, isPlaceholderMode } = useAuthContext();

  if (!isLoaded) {
    return (
      <div className="w-28 h-8 rounded-full bg-slate-800/80 animate-pulse border border-slate-700/50" />
    );
  }

  if (isPlaceholderMode) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold shadow-sm hover:bg-purple-500/20 transition-colors" title="Development Placeholder Mode Active">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <span className="truncate max-w-[120px]">{user?.email || "dev@reelforge.ai"}</span>
        <span className="text-[10px] uppercase bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-200 font-bold tracking-wider">
          Dev
        </span>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[140px]">
            {user?.fullName || "ReelForge User"}
          </span>
          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
            {user?.tier || "Free"} Plan
          </span>
        </div>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-9 h-9 rounded-full ring-2 ring-purple-500/30 hover:ring-purple-500 transition-all shadow-md",
              userButtonPopoverCard: "bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl rounded-2xl",
            },
          }}
        />
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
    >
      Sign In &rarr;
    </Link>
  );
}
