import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

/*
 * Brand typefaces, self-hosted at build time. next/font requires literal
 * options, so fonts live here instead of lib/brand.ts. When you swap fonts,
 * keep the three CSS variable names: the page styles reference them.
 * Display headings use the "wdth" axis; fonts without it simply ignore it.
 */

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

const label = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

const accent = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-accent",
  display: "swap",
});

export const fontVariables = `${display.variable} ${label.variable} ${accent.variable}`;
