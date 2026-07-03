"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { instagramUrlSchema } from "@/lib/validators";
import { AtSign, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileUrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  onInputChange?: () => void;
}

export function ProfileUrlInput({ onAnalyze, isLoading, onInputChange }: ProfileUrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
    // Clear error as user types
    if (error) setError(null);
    onInputChange?.();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = url.trim();
    const result = instagramUrlSchema.safeParse(trimmed);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid URL.");
      return;
    }

    setError(null);
    onAnalyze(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Input group */}
        <div className="relative flex-1">
          {/* Instagram icon prefix */}
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <AtSign
              className={cn(
                "h-4 w-4 transition-colors",
                error ? "text-destructive" : "text-muted-foreground"
              )}
            />
          </div>

          <Input
            id="instagram-url-input"
            type="url"
            value={url}
            onChange={handleChange}
            placeholder="https://instagram.com/username"
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
            className={cn(
              "h-11 pl-10 pr-4 text-sm transition-all",
              "bg-card/50 border-border/60 placeholder:text-muted-foreground/50",
              "focus-visible:border-violet-500/60 focus-visible:ring-violet-500/20",
              error && "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20"
            )}
          />
        </div>

        {/* Analyze button */}
        <Button
          type="submit"
          id="analyze-button"
          disabled={isLoading || !url.trim()}
          className={cn(
            "h-11 shrink-0 gap-2 px-5 font-medium",
            "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
            "shadow-lg shadow-violet-500/20 transition-all",
            "hover:shadow-violet-500/40 hover:brightness-110",
            "disabled:opacity-50 disabled:shadow-none"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze Profile
            </>
          )}
        </Button>
      </div>

      {/* Inline validation error */}
      {error && (
        <p
          id="url-error"
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs text-destructive"
        >
          <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && (
        <p className="mt-2 text-xs text-muted-foreground/60">
          Paste any public Instagram profile URL.
        </p>
      )}
    </form>
  );
}
