"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  width?: "fit-content" | "100%";
  variant?: "fadeUp" | "clipPath" | "opacityDelay" | "scaleUp";
}

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
  width = "100%",
  variant = "fadeUp",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const getHiddenState = () => {
    if (prefersReducedMotion || direction === "none") return { opacity: 0 };
    if (variant === "opacityDelay") return { opacity: 0, y: 0 };
    if (variant === "clipPath") return { opacity: 0, y: 30, clipPath: "inset(100% 0% 0% 0%)" };
    if (variant === "scaleUp") return { opacity: 0, y: 10, scale: 0.95 };
    
    switch (direction) {
      case "up": return { opacity: 0, y: 20 };
      case "down": return { opacity: 0, y: -20 };
      case "left": return { opacity: 0, x: 20 };
      case "right": return { opacity: 0, x: -20 };
      default: return { opacity: 0, y: 20 };
    }
  };

  const getVisibleState = () => {
    if (prefersReducedMotion || direction === "none") return { opacity: 1 };
    if (variant === "clipPath") return { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" };
    if (variant === "scaleUp") return { opacity: 1, y: 0, scale: 1 };
    return { opacity: 1, y: 0, x: 0 };
  };

  return (
    <div style={{ width }} className={className}>
      <motion.div
        variants={{
          hidden: getHiddenState(),
          visible: getVisibleState(),
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        transition={{
          duration: variant === "clipPath" ? 0.7 : 0.5,
          delay: delay,
          ease: [0.16, 1, 0.3, 1], // Apple/Linear signature easing
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
