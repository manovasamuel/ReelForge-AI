import React from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (isPlaceholder) {
    return (
      <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 text-xl">
          ⚡
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Development Placeholder Mode</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Clerk API keys are currently set to placeholder mode in <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">.env.local</code>.
          You are automatically authenticated as <strong className="text-white">dev@reelforge.ai</strong>.
        </p>
        <Link
          href="/profiles"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/20"
        >
          Launch Studio &rarr;
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
          card: "bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl",
        },
      }}
    />
  );
}
