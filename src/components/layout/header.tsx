import { MobileNav } from "./sidebar";
import { UserProfileButton } from "@/components/auth/user-profile-button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-card/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions (user profile, status) */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 items-center rounded-full border border-border/50 bg-accent/50 px-3 shadow-inner">
          <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            v2.0
          </span>
        </div>
        <UserProfileButton />
      </div>
    </header>
  );
}
