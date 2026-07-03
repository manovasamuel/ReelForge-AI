"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Menu,
  X,
  Film,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pattern: RegExp;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.HOME,
    icon: LayoutDashboard,
    pattern: /^\/$/,
  },
  {
    label: "Profiles",
    href: ROUTES.PROFILES,
    icon: Users,
    pattern: /^\/profiles/,
  },
];

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href={ROUTES.HOME} className="flex items-center gap-2.5 px-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
        <Film className="h-4 w-4 text-white" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">
            ReelForge
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
            AI
          </span>
        </div>
      )}
    </Link>
  );
}

function NavLink({
  item,
  isActive,
  collapsed = false,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed?: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-violet-500/10 text-violet-400"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-500" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive
            ? "text-violet-400"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

// Desktop sidebar
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden border-r border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Logo collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-7 w-7 text-muted-foreground hover:text-foreground lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={item.pattern.test(pathname)}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-border/50 px-3 py-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 p-3",
            collapsed && "justify-center p-2"
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                AI Powered
              </span>
              <span className="text-[10px] text-muted-foreground">
                Intelligence Engine
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Mobile navigation
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<span />}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-16 items-center justify-between px-4">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="opacity-50" />

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.href} onClick={() => setOpen(false)}>
                <NavLink
                  item={item}
                  isActive={item.pattern.test(pathname)}
                />
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
