"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { PlaceholderAuthProvider, LiveClerkAuthProvider } from "./user-context";
import { isOfflineDevMode } from "./config";

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const isPlaceholder = isOfflineDevMode();

  // In development placeholder mode, render children directly with PlaceholderAuthProvider
  // to prevent runtime missing key exceptions while supplying dev@reelforge.ai context.
  if (isPlaceholder) {
    return <PlaceholderAuthProvider>{children}</PlaceholderAuthProvider>;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(240, 5.9%, 10%)", // matches light mode foreground
          colorBackground: "hsl(0, 0%, 100%)", // matches light mode background
        },
        elements: {
          card: "border border-border shadow-none rounded-none",
          primaryButton: "bg-primary text-primary-foreground hover:opacity-90 rounded-none",
          footerActionLink: "text-primary hover:text-primary/90",
        }
      }}
    >
      <LiveClerkAuthProvider>{children}</LiveClerkAuthProvider>
    </ClerkProvider>
  );
}
