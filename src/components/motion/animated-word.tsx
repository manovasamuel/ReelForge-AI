"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedWordProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function AnimatedWord({
  words,
  interval = 3000,
  className,
}: AnimatedWordProps) {
  const [index, setIndex] = useState(0);
  const [wordWidths, setWordWidths] = useState<number[] | null>(null);
  const staticRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Measure all word widths accurately once web fonts are fully loaded
  useEffect(() => {
    const measure = () => {
      const el = staticRef.current;
      if (!el) return;

      const parent = el.parentElement;
      if (!parent) return;

      const measurer = document.createElement("span");
      measurer.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none";
      const cs = window.getComputedStyle(el);
      measurer.style.font = cs.font;
      measurer.style.letterSpacing = cs.letterSpacing;
      measurer.style.fontWeight = cs.fontWeight;
      parent.appendChild(measurer);

      const widths = words.map((word) => {
        measurer.textContent = word;
        return Math.ceil(measurer.getBoundingClientRect().width) + 2;
      });

      measurer.remove();
      setWordWidths(widths);
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure);
    } else {
      measure();
    }
  }, [words]);

  // Cycle words continuously every `interval` ms
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval, prefersReducedMotion]);

  // Reduced motion: static first word, no animation
  if (prefersReducedMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  // Pre-measurement: static render that matches SSR output
  if (!wordWidths) {
    return (
      <span ref={staticRef} className={cn("inline-block", className)}>
        {words[0]}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(
        "inline-grid [grid-template-areas:'word'] align-bottom text-left",
        className
      )}
      animate={{ width: wordWidths[index] }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          className="[grid-area:word] whitespace-nowrap will-change-transform"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          exit={{
            opacity: 0,
            y: -10,
            transition: {
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
