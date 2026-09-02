"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  width?: "fit-content" | "100%";
  variant?: "heroHeadline" | "supportingText" | "subtleClip" | "buttonEnter" | "cardEnter";
}

export function Reveal({
  children,
  delay = 0,
  className,
  width = "100%",
  variant = "supportingText",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const getHiddenState = () => {
    if (prefersReducedMotion) return { opacity: 0 };
    
    switch (variant) {
      case "heroHeadline": return { opacity: 0, y: 15, clipPath: "inset(100% 0% 0% 0%)" };
      case "subtleClip": return { opacity: 0, y: 8, clipPath: "inset(100% 0% 0% 0%)" };
      case "supportingText": return { opacity: 0, y: 8 };
      case "buttonEnter": return { opacity: 0, x: -8 };
      case "cardEnter": return { opacity: 0, y: 12 };
      default: return { opacity: 0, y: 8 };
    }
  };

  const getVisibleState = () => {
    if (prefersReducedMotion) return { opacity: 1 };
    
    switch (variant) {
      case "heroHeadline":
      case "subtleClip": return { opacity: 1, y: 0, clipPath: "inset(-20% 0% -20% 0%)" }; // prevent shadow clipping
      case "supportingText": return { opacity: 1, y: 0 };
      case "buttonEnter": return { opacity: 1, x: 0 };
      case "cardEnter": return { opacity: 1, y: 0 };
      default: return { opacity: 1, y: 0, x: 0 };
    }
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
        viewport={{ once: true, margin: "-5%" }}
        transition={{
          duration: variant === "heroHeadline" ? 0.6 : 0.5,
          delay: delay,
          ease: [0.16, 1, 0.3, 1], // Apple/Linear signature easing
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
