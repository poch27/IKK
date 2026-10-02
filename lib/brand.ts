/**
 * Brand configuration: the one file to edit when you start a new brand from
 * this template. Name, copy, colors, products, and messages all live here.
 *
 * Other brand-specific files:
 * - lib/fonts.ts        typefaces (next/font needs literal options)
 * - public/images/      hero and product artwork
 *
 * Browser-safe plain data. Never put secrets here.
 */

export interface BrandProduct {
  readonly id: string;
  /** Two-digit display index, e.g. "01". */
  readonly index: string;
  readonly name: string;
  readonly colorway: string;
  /** Whole units of `brand.currency`, e.g. 1450 = ₱1,450. */
  readonly price: number;
  /** Display size range, e.g. "S–XL". */
  readonly sizes: string;
  /** 1200 × 1500 (4:5) image path under public/. */
  readonly image: string;
  readonly alt: string;
}

export interface BrandStep {
  readonly number: string;
  readonly title: string;
  readonly body: string;
}

export interface BrandColors {
  /** Page background and dark sections. */
  readonly dark: string;
  /** Light sections and text on dark. */
  readonly light: string;
  /** Product image tiles. */
  readonly lightAlt: string;
  readonly mutedOnLight: string;
  readonly mutedOnDark: string;
  readonly ruleOnDark: string;
  /** Buttons, highlights, bullets. */
  readonly accent: string;
  /** Text on accent buttons. Must pass 4.5:1 against `accent`. */
  readonly onAccent: string;
  readonly error: string;
  /** Error text on dark sections. */
  readonly errorOnDark: string;
}

export interface Brand {
  readonly name: string;
  /** Wordmark split into a light and a heavy part, e.g. "In" + "CTRL". */
  readonly wordmark: { readonly light: string; readonly heavy: string };
  /** BCP 47 locale for <html lang> and price formatting. */
  readonly locale: string;
  /** Open Graph locale, e.g. "en_PH". */
  readonly ogLocale: string;
  /** ISO 4217 currency code for product prices. */
  readonly currency: string;
  readonly colors: BrandColors;
  /** Bump whenever the consent label or privacy notice wording changes. */
  readonly consentVersion: string;
  readonly meta: {
    readonly title: string;
    readonly description: (fromPrice: string) => string;
  };
  readonly og: {
    readonly alt: string;
    readonly kicker: string;
    readonly tagline: string;
    readonly badge: string;
  };
  readonly strip: string;
  readonly headerCta: string;
  readonly hero: {
    readonly kicker: string;
    readonly titleLead: string;
    readonly titleAccent: string;
    readonly sub: (fromPrice: string) => string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
    readonly meta: (pieceCount: number, fromPrice: string) => string;
    readonly image: { readonly src: string; readonly alt: string };
  };
  readonly drop: {
    readonly heading: string;
    readonly line: string;
    readonly note: string;
    readonly listLabel: string;
  };
  readonly products: readonly BrandProduct[];
  readonly idea: {
    readonly label: string;
    readonly notLabel: string;
    readonly notItems: readonly string[];
    readonly inLabel: string;
    readonly inItems: readonly string[];
    readonly closing: string;
  };
  readonly how: {
    readonly label: string;
    readonly steps: readonly BrandStep[];
  };
  readonly signup: {
    readonly heading: string;
    readonly sub: string;
  };
  readonly form: {
    readonly submit: string;
    readonly pending: string;
    readonly consentLabel: string;
    /** Privacy notice text before the privacy email link. */
    readonly privacyBeforeEmail: string;
    /** Privacy notice text after the privacy email link. */
    readonly privacyAfterEmail: string;
  };
  readonly messages: {
    readonly success: string;
    readonly duplicate: string;
    readonly consentRequired: string;
  };
  readonly footer: {
    readonly instagramLabel: string;
    readonly copyright: string;
  };
  readonly notFound: {
    readonly title: string;
    readonly cta: string;
  };
}

export const brand: Brand = {
  name: "InCTRL",
  wordmark: { light: "In", heavy: "CTRL" },
  locale: "en-PH",
  ogLocale: "en_PH",
  currency: "PHP",

  colors: {
    dark: "#0E0E0C",
    light: "#F2EFE8",
    lightAlt: "#E7E3DA",
    mutedOnLight: "#6B675F",
    mutedOnDark: "#9A968D",
    ruleOnDark: "#3A3934",
    accent: "#FF4D00",
    onAccent: "#0E0E0C",
    error: "#C8102E",
    errorOnDark: "#FFB4A8",
  },

  consentVersion: "inctrl-drop-v2",

  meta: {
    title: "InCTRL — Drop 01 waitlist",
    description: (from) =>
      `InCTRL Drop 01: four everyday pieces from ${from}. Join the waitlist for first access before it goes public.`,
  },

  og: {
    alt: "InCTRL — Drop 01 waitlist",
    kicker: "DROP 01 — PRE-LAUNCH",
    tagline: "Four pieces. First access for the list.",
    badge: "Waitlist open",
  },

  strip: "Drop 01 · Pre-launch · Philippines",
  headerCta: "Get first access",

  hero: {
    kicker: "N°01 — The first drop",
    titleLead: "Wear what you",
    titleAccent: "control.",
    sub: (from) =>
      `InCTRL is a clothing label built on one idea: own the part that's yours. Drop 01 is four everyday pieces, from ${from}.`,
    primaryCta: "Get first access",
    secondaryCta: "See the pieces",
    meta: (count, from) => `${count} pieces · From ${from} · Ships within the Philippines`,
    image: {
      src: "/images/drop/hero.svg",
      alt: "Frame Tee in black on an orange backdrop — InCTRL Drop 01.",
    },
  },

  drop: {
    heading: "Drop 01",
    line: "Four pieces, built to be worn together.",
    note: "Prices in PHP. Final details confirmed on drop day.",
    listLabel: "Drop 01 pieces",
  },

  products: [
    {
      id: "frame-tee",
      index: "01",
      name: "Frame Tee",
      colorway: "Black",
      price: 1450,
      sizes: "S–XL",
      image: "/images/drop/frame-tee.svg",
      alt: "Frame Tee in black, front view.",
    },
    {
      id: "index-hoodie",
      index: "02",
      name: "Index Hoodie",
      colorway: "Bone",
      price: 2950,
      sizes: "S–XL",
      image: "/images/drop/index-hoodie.svg",
      alt: "Index Hoodie in bone, front view.",
    },
    {
      id: "signal-overshirt",
      index: "03",
      name: "Signal Overshirt",
      colorway: "Black",
      price: 3250,
      sizes: "S–XL",
      image: "/images/drop/signal-overshirt.svg",
      alt: "Signal Overshirt in black, front view.",
    },
    {
      id: "form-trouser",
      index: "04",
      name: "Form Trouser",
      colorway: "Charcoal",
      price: 2650,
      sizes: "28–36",
      image: "/images/drop/form-trouser.svg",
      alt: "Form Trouser in charcoal, front view.",
    },
  ],

  idea: {
    label: "The idea",
    notLabel: "Not in your control",
    notItems: ["The weather.", "EDSA at 6 PM.", "What people think."],
    inLabel: "In your control",
    inItems: ["What you wear.", "How you show up.", "Your next move."],
    closing: "We make clothes for the second list.",
  },

  how: {
    label: "How it works",
    steps: [
      { number: "01", title: "Join the list", body: "Leave your email. Takes ten seconds." },
      { number: "02", title: "Get first access", body: "We email you before Drop 01 goes public." },
      {
        number: "03",
        title: "Order on drop day",
        body: "Pick your size, check out, done. Ships within the Philippines.",
      },
    ],
  },

  signup: {
    heading: "Get first access to Drop 01.",
    sub: "Drop news only. Unsubscribe anytime.",
  },

  form: {
    submit: "Get first access",
    pending: "Joining…",
    consentLabel: "Email me about Drop 01 and related InCTRL clothing updates.",
    privacyBeforeEmail:
      "We only collect your email, to send Drop 01 news and related InCTRL clothing updates. We keep it until you unsubscribe or ask us to delete it, and never longer than 12 months. Questions or deletion:",
    privacyAfterEmail: ".",
  },

  messages: {
    success: "You're in. We'll email you before Drop 01 goes public.",
    duplicate: "You're already on the list. We'll be in touch before the drop.",
    consentRequired: "Check the box to agree to receive InCTRL drop emails.",
  },

  footer: {
    instagramLabel: "Instagram",
    copyright: "© InCTRL — Philippines",
  },

  notFound: {
    title: "This page isn't part of Drop 01.",
    cta: "Back to InCTRL",
  },
};

/** CSS custom properties consumed by the page and form stylesheets. */
export function brandCssVariables(colors: BrandColors = brand.colors): Record<string, string> {
  return {
    "--c-dark": colors.dark,
    "--c-light": colors.light,
    "--c-light-2": colors.lightAlt,
    "--c-muted-on-light": colors.mutedOnLight,
    "--c-muted-on-dark": colors.mutedOnDark,
    "--c-rule-on-dark": colors.ruleOnDark,
    "--c-accent": colors.accent,
    "--c-on-accent": colors.onAccent,
    "--c-error": colors.error,
    "--c-error-on-dark": colors.errorOnDark,
  };
}
