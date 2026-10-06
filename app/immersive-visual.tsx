"use client";

import { useRef } from "react";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

import styles from "./immersive-visual.module.css";

const RecognitionCanvas = dynamic(
  () => import("./recognition-canvas").then((module) => module.RecognitionCanvas),
  { ssr: false },
);

interface ImmersiveVisualProps {
  readonly logoSrc: string;
  readonly logoAlt: string;
  readonly transmissionLabel: string;
}

/** Static-first visual stage that progressively enhances to the R3F scene. */
export function ImmersiveVisual({
  logoSrc,
  logoAlt,
  transmissionLabel,
}: ImmersiveVisualProps) {
  const root = useRef<HTMLDivElement>(null);
  const isInView = useInView(root, { margin: "140px 0px", amount: 0.15 });
  const shouldReduceMotion = useReducedMotion() === true;

  return (
    <div ref={root} className={styles["stage"]} role="img" aria-label={logoAlt}>
      <motion.div
        className={styles["fallback"]}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: isInView ? 0.18 : 0.08, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src={logoSrc} alt="" fill sizes="(min-width: 64rem) 56vw, 100vw" priority />
      </motion.div>

      <div className={styles["canvas"]} aria-hidden="true">
        {isInView ? (
          <RecognitionCanvas active={!shouldReduceMotion} logoSrc={logoSrc} />
        ) : null}
      </div>

      <div className={styles["frame"]} aria-hidden="true">
        <span>{transmissionLabel}</span>
        <span>R3F / LIVE FIELD</span>
      </div>
      <div className={styles["reticle"]} aria-hidden="true" />
    </div>
  );
}
