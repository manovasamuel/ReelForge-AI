"use client";

import { useState, useEffect } from "react";
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
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {words[0]}
      </span>
    );
  }

  // Find the longest word to use as a static spacer for stable width
  const longestWord = [...words].sort((a, b) => b.length - a.length)[0];

  return (
    <span className="inline-grid [grid-template-areas:'word'] justify-items-start overflow-hidden align-bottom text-left">
      {/* Invisible spacer for width stability */}
      <span className="invisible [grid-area:word] whitespace-nowrap" aria-hidden="true">
        {longestWord}
      </span>
      
      {/* Animating word */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          className={cn("[grid-area:word] whitespace-nowrap", className)}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

