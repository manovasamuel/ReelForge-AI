"use client";

import React, { createContext, useContext } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export interface AuthUser {
  id: string;
  fullName: string | null;
  email: string | null;
  imageUrl: string | null;
  tier: string;
}

export interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: AuthUser | null;
  isPlaceholderMode: boolean;
}

const defaultPlaceholderUser: AuthUser = {
  id: "dev_user_placeholder",
  fullName: "Development User",
  email: "dev@reelforge.ai",
  imageUrl: null,
  tier: "free",
};

const AuthContext = createContext<AuthContextType>({
  isLoaded: true,
  isSignedIn: true,
  userId: defaultPlaceholderUser.id,
  user: defaultPlaceholderUser,
  isPlaceholderMode: true,
});

export function useAuthContext(): AuthContextType {
  return useContext(AuthContext);
}

/**
 * Provider used when Clerk API keys are missing or set to placeholder.
 * Supplies a deterministic development user (dev@reelforge.ai) so local dev,
 * npm run build, and Playwright tests execute without authentication failures.
 */
export function PlaceholderAuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextType = {
    isLoaded: true,
    isSignedIn: true,
    userId: defaultPlaceholderUser.id,
    user: defaultPlaceholderUser,
    isPlaceholderMode: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Provider used when live Clerk API keys are configured.
 * Retrieves real user identity and session state from Clerk SDK.
 */
export function LiveClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: isUserLoaded, user, isSignedIn } = useUser();
  const { isLoaded: isAuthLoaded, userId } = useAuth();

  const isLoaded = isUserLoaded && isAuthLoaded;

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        fullName: user.fullName || "ReelForge User",
        email: user.primaryEmailAddress?.emailAddress || null,
        imageUrl: user.imageUrl || null,
        tier: ((user.publicMetadata?.tier as string) || "free").toLowerCase(),
      }
    : null;

  const value: AuthContextType = {
    isLoaded,
    isSignedIn: !!isSignedIn,
    userId: userId || null,
    user: authUser,
    isPlaceholderMode: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
