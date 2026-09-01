"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  Film,
  ChevronLeft,
  BarChart3,
  Settings as SettingsIcon,
  Download,
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
    href: "/dashboard",
    icon: LayoutDashboard,
    pattern: /^\/dashboard/,
  },
  {
    label: "Workspace",
    href: "/workspace",
    icon: Users, // Or any appropriate icon like LayoutGrid
    pattern: /^\/workspace/,
  },
  {
    label: "Studio",
    href: "/studio/new",
    icon: Film,
    pattern: /^\/studio/,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    pattern: /^\/analytics/,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    pattern: /^\/settings/,
  },
  {
    label: "Export",
    href: "/export",
    icon: Download,
    pattern: /^\/export/,
  },
];

import { Logo } from "@/components/ui/logo";

function SidebarLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="px-2">
      <Logo showText={!collapsed} />
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
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-accent/50 text-foreground"
          : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-0 h-full w-[2px] bg-foreground" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive
            ? "text-foreground"
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
        "hidden border-r border-border bg-sidebar transition-all duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <SidebarLogo collapsed={collapsed} />
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

      {/* Removed decorative AI gradient box */}
    </aside>
  );
}

// Mobile navigation
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-16 items-center justify-between px-4">
          <SidebarLogo />
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
