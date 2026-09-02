import { MobileNav } from "./sidebar";
import { UserProfileButton } from "@/components/auth/user-profile-button";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Main Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 ml-4">
        <Link href="/pricing" className="inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0">
          Pricing
        </Link>
        <Link href="/about" className="inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0">
          About
        </Link>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions (user profile, status) */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 items-center rounded-md border border-border bg-muted px-3">
          <span className="text-xs font-medium text-muted-foreground">
            v2.0
          </span>
        </div>
        <UserProfileButton />
      </div>
    </header>
  );
}
