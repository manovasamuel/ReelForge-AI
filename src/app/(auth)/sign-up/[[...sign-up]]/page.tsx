import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your ReelForge AI account to start analyzing competitor reels and generating high-converting video scripts with AI.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://reel-forge-ai-psi.vercel.app/sign-up",
  },
};

export default function SignUpPage() {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (isPlaceholder) {
    return (
      <div className="w-full bg-card border border-border rounded-none p-8 text-center">
        <div className="w-12 h-12 rounded-none bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
          RF
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Development Mode</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Clerk API keys are set to placeholder mode in <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">.env.local</code>.
          You are automatically authenticated as <strong className="text-foreground">dev@reelforge.ai</strong>.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-none bg-foreground text-background font-semibold text-sm transition-colors hover:opacity-90"
        >
          Launch Dashboard &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4 text-center">
        Create your ReelForge AI Account
      </h1>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
