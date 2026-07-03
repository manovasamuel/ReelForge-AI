"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
}

export function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const isOpen = prev.includes(value);
        if (type === "single") {
          return isOpen ? [] : [value];
        }
        return isOpen ? prev.filter((item) => item !== value) : [...prev, value];
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const ctx = React.useContext(AccordionContext);
  const isOpen = ctx ? ctx.openItems.includes(value) : false;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div className={cn("border-b", className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  const isOpen = itemCtx?.isOpen ?? false;

  return (
    <div className="flex">
      <button
        type="button"
        onClick={() => {
          if (ctx && itemCtx) {
            ctx.toggleItem(itemCtx.value);
          }
        }}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground", isOpen && "rotate-180")}
        />
      </button>
    </div>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const itemCtx = React.useContext(AccordionItemContext);
  const isOpen = itemCtx?.isOpen ?? false;

  if (!isOpen) return null;

  return (
    <div className={cn("overflow-hidden text-sm transition-all animate-in fade-in duration-200", className)} {...props}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}
