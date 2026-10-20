import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to ReelForge AI to access your content intelligence dashboard, competitor analytics, and AI script generator.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://reel-forge-ai-psi.vercel.app/sign-in",
  },
};

export default function SignInPage() {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (isPlaceholder) {
    return (
      <div className="w-full bg-card border border-border rounded-none p-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo textClassName="text-xl" />
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
        Sign in to ReelForge AI
      </h1>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
