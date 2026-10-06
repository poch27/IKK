"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string | undefined;
  readonly delay?: number;
  readonly eager?: boolean;
  readonly distance?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Shared entrance choreography with an accessible reduced-motion path. */
export function Reveal({
  children,
  className,
  delay = 0,
  eager = false,
  distance = 28,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion() === true;
  const initial = shouldReduceMotion ? false : { opacity: 0, y: distance };
  const visible = { opacity: 1, y: 0 };
  const transition = { duration: shouldReduceMotion ? 0 : 0.8, delay, ease: EASE };

  if (eager) {
    return (
      <motion.div
        className={className}
        initial={initial}
        animate={visible}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={visible}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
