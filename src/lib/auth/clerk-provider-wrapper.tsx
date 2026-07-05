"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { PlaceholderAuthProvider, LiveClerkAuthProvider } from "./user-context";

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isPlaceholder = !publishableKey || publishableKey.includes("placeholder");

  // In development placeholder mode, render children directly with PlaceholderAuthProvider
  // to prevent runtime missing key exceptions while supplying dev@reelforge.ai context.
  if (isPlaceholder) {
    return <PlaceholderAuthProvider>{children}</PlaceholderAuthProvider>;
  }

  return (
    <ClerkProvider>
      <LiveClerkAuthProvider>{children}</LiveClerkAuthProvider>
    </ClerkProvider>
  );
}
