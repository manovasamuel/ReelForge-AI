"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedWord } from "@/components/motion/animated-word";
import { Reveal } from "@/components/motion/reveal";

// ──────────────────────────────────────────────────────────
// 10 curated hero variants — each a distinct copywriting angle.
// One is randomly selected per page load.
// ──────────────────────────────────────────────────────────
const HERO_VARIANTS = [
  // 1. Curiosity hook
  {
    tagline: "What makes content impossible to scroll past?",
    description:
      "Break down the hooks, structures, and retention patterns behind content that actually wins — then use those patterns to build your next script.",
  },
  // 2. Pain-point hook
  {
    tagline: "Stop guessing why content works.",
    description:
      "Reverse-engineer proven hooks, formats, and retention triggers before you write your next script.",
  },
  // 3. Competitive-intelligence hook
  {
    tagline: "Your competitors already tested the formula.",
    description:
      "Study what worked, understand why it worked, and build your content from the evidence.",
  },
  // 4. Data / evidence hook
  {
    tagline: "Build content from evidence, not instinct.",
    description:
      "Analyze high-performing posts and extract the creative patterns that drive real retention.",
  },
  // 5. Pattern-discovery hook
  {
    tagline: "Find the pattern behind winning content.",
    description:
      "Reveal the hooks, structures, and retention signals hiding inside proven posts.",
  },
  // 6. Creator-focused hook
  {
    tagline: "Before you write the next script, study what won.",
    description:
      "Turn real performance data into sharper hooks, stronger structures, and smarter creative decisions.",
  },
  // 7. Direct-response hook
  {
    tagline: "Reverse-engineer what gets attention.",
    description:
      "Analyze winning content. Extract the mechanics. Build scripts from the evidence.",
  },
  // 8. Contrarian hook
  {
    tagline: "The best content isn't original. It's engineered.",
    description:
      "Study the structural patterns behind viral content and use them to write smarter scripts.",
  },
  // 9. Outcome hook
  {
    tagline: "Write scripts that work before you press record.",
    description:
      "Ground every creative decision in proven engagement data and structural analysis.",
  },
  // 10. Authority hook
  {
    tagline: "Content intelligence for serious creators.",
    description:
      "Professional-grade analysis of hooks, formats, and retention mechanics across any niche.",
  },
];

// Rotating word set — all grammatically compatible with "Engineer __ with Data."
const ROTATING_WORDS = [
  "Content",
  "Scripts",
  "Hooks",
  "Stories",
  "Reels",
  "Formats",
  "Angles",
];

export function HeroSection() {
  const [variantIndex, setVariantIndex] = useState(0);

  // Select a random hero variant on mount.
  // The Reveal wrapper starts at opacity 0, so the client-side
  // switch from index 0 → random index is invisible to the user.
  useEffect(() => {
    setVariantIndex(Math.floor(Math.random() * HERO_VARIANTS.length));
  }, []);

  const variant = HERO_VARIANTS[variantIndex];

  return (
    <section className="pt-20 pb-12 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
      {/* Editorial kicker — changes every refresh */}
      <Reveal variant="supportingText">
        <p
          className="text-lg md:text-xl text-muted-foreground font-medium mb-4 max-w-2xl"
          suppressHydrationWarning
        >
          {variant.tagline}
        </p>
      </Reveal>

      {/* H1 with smooth rotating word */}
      <Reveal variant="heroHeadline" delay={0.05}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Engineer{" "}
          <AnimatedWord words={ROTATING_WORDS} />
          {" "}with Data.
        </h1>
      </Reveal>

      {/* Supporting description — matches the kicker */}
      <Reveal variant="supportingText" delay={0.12}>
        <p
          className="max-w-2xl text-base md:text-lg text-muted-foreground mb-10 leading-relaxed"
          suppressHydrationWarning
        >
          {variant.description}
        </p>
      </Reveal>

      {/* CTA — genuinely centered */}
      <Reveal variant="buttonEnter" delay={0.2}>
        <div className="flex justify-center w-full">
          <Link
            href="/studio/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 px-8 text-lg font-semibold shadow-none rounded-none border border-foreground group transition-transform duration-200 ease-out hover:-translate-y-[1px]"
            )}
          >
            Start Analysis Workflow
            <span className="ml-2 h-5 w-5 border border-foreground inline-flex items-center justify-center font-mono text-sm leading-none pt-0.5 transition-transform duration-200 ease-out group-hover:translate-x-[3px]">
              &rarr;
            </span>
          </Link>
        </div>
      </Reveal>

      {/* Capability indicators */}
      <Reveal variant="supportingText" delay={0.28}>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-foreground" />
            <span>Live Apify Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-foreground" />
            <span>Gemini/Groq Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-foreground" />
            <span>Open Data Model</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
