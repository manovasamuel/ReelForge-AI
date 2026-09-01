import React from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (isPlaceholder) {
    return (
      <div className="w-full bg-card border border-border rounded-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo textClassName="text-xl" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Development Mode</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Clerk API keys are set to placeholder mode in <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">.env.local</code>.
          You are automatically authenticated as <strong className="text-foreground">dev@reelforge.ai</strong>.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-md bg-foreground text-background font-semibold text-sm transition-colors hover:opacity-90"
        >
          Launch Dashboard &rarr;
        </Link>
      </div>
    );
  }

  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-card border border-border shadow-none rounded-md",
        },
      }}
    />
  );
}
