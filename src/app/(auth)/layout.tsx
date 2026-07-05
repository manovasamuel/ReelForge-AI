import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background illumination gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/profiles" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            RF
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            ReelForge AI <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium ml-1">v2.0</span>
          </span>
        </Link>
        <p className="text-sm text-slate-400 mt-2">Enterprise Social Intelligence & Studio Pipeline</p>
      </div>

      {/* Auth Modal Container */}
      <div className="z-10 w-full max-w-md flex justify-center">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} ReelForge AI. All rights reserved.
      </div>
    </div>
  );
}
