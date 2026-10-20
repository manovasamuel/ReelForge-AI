"use client";

import React, { useState, useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { PlaceholderAuthProvider, LiveClerkAuthProvider } from "./user-context";
import { isOfflineDevMode } from "./config";
import { getClerkAppearance } from "./clerk-theme";

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const isPlaceholder = isOfflineDevMode();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // In development placeholder mode, render children directly with PlaceholderAuthProvider
  // to prevent runtime missing key exceptions while supplying dev@reelforge.ai context.
  if (isPlaceholder) {
    return <PlaceholderAuthProvider>{children}</PlaceholderAuthProvider>;
  }

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const appearance = getClerkAppearance(isDark);

  return (
    <ClerkProvider
      key={isDark ? "clerk-dark" : "clerk-light"}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_c3VidGxlLWpvZXktMjUuY2xlcmsuYWNjb3VudHMuZGV2JA"}
      appearance={appearance}
    >
      <LiveClerkAuthProvider>{children}</LiveClerkAuthProvider>
    </ClerkProvider>
  );
}
