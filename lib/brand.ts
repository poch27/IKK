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
  /** Text fallback used where the image lockup is not rendered. */
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
    readonly benefits: readonly string[];
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
    readonly heading: string;
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
  name: "IKK",
  wordmark: { light: "I", heavy: "KK" },
  locale: "en-PH",
  ogLocale: "en_PH",
  currency: "PHP",

  colors: {
    dark: "#0B0D0C",
    light: "#F5F3EE",
    lightAlt: "#E7E9E4",
    mutedOnLight: "#565E59",
    mutedOnDark: "#909A94",
    ruleOnDark: "#29352E",
    accent: "#005C35",
    onAccent: "#F5F3EE",
    error: "#B4233A",
    errorOnDark: "#FFB4BD",
  },

  consentVersion: "ikk-first-drop-v2",

  meta: {
    title: "IKK — First Drop waitlist",
    description: (from) =>
      `Join the IKK First Drop waitlist for early access to the I Know Kung-fu tee, launching from ${from} in the Philippines.`,
  },

  og: {
    alt: "IKK — Ink Knit Kult First Drop waitlist",
    kicker: "FIRST DROP — WAITLIST OPEN",
    tagline: "First access before the public release.",
    badge: "Waitlist open",
  },

  strip: "Ink Knit Kult · First Drop waitlist · Philippines",
  headerCta: "Join the waitlist",

  hero: {
    kicker: "The First Drop — waitlist open",
    titleLead: "I know",
    titleAccent: "Kung-fu.",
    sub: (from) =>
      `The IKK First Drop begins with the I Know Kung-fu tee, launching from ${from}. Join the waitlist for first access before the public release.`,
    benefits: [
      "First access before public release",
      "Release date and drop details by email",
      "Drop updates only. Unsubscribe anytime",
    ],
    primaryCta: "Join the First Drop waitlist",
    secondaryCta: "Preview the first piece",
    meta: (count, from) =>
      `Waitlist open · ${String(count).padStart(2, "0")} piece · From ${from} · Philippines`,
    image: {
      src: "/images/ikk_logo.jpg",
      alt: "IKK — Ink Knit Kult geometric logo.",
    },
  },

  drop: {
    heading: "The First Drop",
    line: "The I Know Kung-fu tee turns a familiar line into a coded signal for the people who know.",
    note: "Launch price in PHP. Final production details and release date go to the waitlist first.",
    listLabel: "IKK First Drop preview",
  },

  products: [
    {
      id: "i-know-kung-fu-tee",
      index: "01",
      name: "I Know Kung-fu Tee",
      colorway: "Ink Black / Kult Green",
      price: 1450,
      sizes: "S–XL",
      image: "",
      alt: "Final IKK I Know Kung-fu tee visual coming soon.",
    },
  ],

  idea: {
    label: "The code behind the First Drop",
    notLabel: "At first glance",
    notItems: ["A black tee.", "A line of type.", "A familiar phrase."],
    inLabel: "If you know",
    inItems: ["Choice.", "Belief.", "Awakening."],
    closing: "The people who recognize the line, recognize each other.",
  },

  how: {
    label: "How first access works",
    heading: "Three steps to the First Drop.",
    steps: [
      {
        number: "01",
        title: "Join the waitlist",
        body: "Leave your email and confirm that you want IKK First Drop updates.",
      },
      {
        number: "02",
        title: "Get first access",
        body: "We email the release date and access details before the public launch.",
      },
      {
        number: "03",
        title: "Choose your size",
        body: "Order your preferred size when the First Drop opens. Ships within the Philippines.",
      },
    ],
  },

  signup: {
    heading: "Join the First Drop waitlist.",
    sub: "Get the release date, final product details, and first access before the drop goes public.",
  },

  form: {
    submit: "Join the waitlist",
    pending: "Joining…",
    consentLabel: "Email me about the IKK First Drop and future IKK clothing releases.",
    privacyBeforeEmail:
      "We collect your email only for IKK release updates. We keep it until you unsubscribe or ask us to delete it, and never longer than 12 months. Questions or deletion:",
    privacyAfterEmail: ".",
  },

  messages: {
    success: "You’re on the First Drop waitlist. Watch your inbox for first-access details.",
    duplicate: "You’re already on the First Drop waitlist. We’ll email you before the public release.",
    consentRequired: "Check the box to receive IKK First Drop emails.",
  },

  footer: {
    instagramLabel: "Instagram",
    copyright: "© 2026 IKK — Ink Knit Kult",
  },

  notFound: {
    title: "This page is not part of the First Drop.",
    cta: "Return to IKK",
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
