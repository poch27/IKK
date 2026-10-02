import { brand } from "@/lib/brand";

/**
 * Public, non-secret site configuration for the drop waitlist.
 *
 * Values come from deployment configuration. When `VERCEL_ENV` is
 * `production`, a missing or invalid value fails the build with an error that
 * names the variables to fix. Every other environment falls back to local
 * placeholders so development and preview builds keep working.
 *
 * Never add a secret here: these values are rendered into HTML and metadata.
 */

export interface SiteConfig {
  /** Exact canonical origin, e.g. `https://brand.example`. */
  readonly appOrigin: string;
  /** Approved brand Instagram profile URL. */
  readonly instagramUrl: string;
  /** Monitored contact for consent withdrawal, deletion, and privacy questions. */
  readonly privacyContactEmail: string;
}

/**
 * The single configured primary visual. Approved photography replaces only
 * `src` and `alt`; dimensions stay 4:5 so layout and reading order are stable.
 */
export interface PrimaryVisual {
  readonly src: string;
  readonly width: 1200;
  readonly height: 1500;
  readonly alt: string;
}

/** Hero image; set its path and alt text in lib/brand.ts. */
export const primaryVisual: PrimaryVisual = {
  src: brand.hero.image.src,
  width: 1200,
  height: 1500,
  alt: brand.hero.image.alt,
};

type SiteEnv = Readonly<Record<string, string | undefined>>;

const PLACEHOLDERS = {
  APP_ORIGIN: "http://localhost:3000",
  APPROVED_INSTAGRAM_URL: "https://www.instagram.com/",
  PRIVACY_CONTACT_EMAIL: "privacy@example.com",
} as const;

type SiteVariable = keyof typeof PLACEHOLDERS;
type Parser = (raw: string, production: boolean) => string | undefined;

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);
const INSTAGRAM_PROFILE_PATH = /^\/[A-Za-z0-9._]{1,30}\/?$/;
// Conservative on purpose: the value is placed in a `mailto:` href.
const CONTACT_EMAIL =
  /^[A-Za-z0-9._+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const PLACEHOLDER_EMAIL_DOMAIN = /(?:^|\.)(?:example\.(?:com|net|org)|localhost|invalid|test)$/i;

function parseUrl(raw: string): URL | undefined {
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

const parseOrigin: Parser = (raw, production) => {
  const url = parseUrl(raw);
  if (url === undefined) {
    return undefined;
  }
  const protocolAllowed =
    url.protocol === "https:" || (!production && url.protocol === "http:");
  const originOnly =
    url.username === "" &&
    url.password === "" &&
    url.pathname === "/" &&
    url.search === "" &&
    url.hash === "";
  return protocolAllowed && originOnly ? url.origin : undefined;
};

const parseInstagramUrl: Parser = (raw, production) => {
  const url = parseUrl(raw);
  if (
    url === undefined ||
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    !INSTAGRAM_HOSTS.has(url.hostname)
  ) {
    return undefined;
  }
  if (production && !INSTAGRAM_PROFILE_PATH.test(url.pathname)) {
    return undefined;
  }
  return url.href;
};

const parseContactEmail: Parser = (raw, production) => {
  if (raw.length > 254 || !CONTACT_EMAIL.test(raw)) {
    return undefined;
  }
  const domain = raw.slice(raw.lastIndexOf("@") + 1);
  if (production && PLACEHOLDER_EMAIL_DOMAIN.test(domain)) {
    return undefined;
  }
  return raw;
};

/**
 * Resolves public site configuration from an environment map.
 * Throws in production when any value is missing or invalid.
 */
export function resolveSiteConfig(env: SiteEnv): SiteConfig {
  const production = env["VERCEL_ENV"] === "production";
  const problems: string[] = [];

  const read = (name: SiteVariable, parse: Parser): string => {
    const raw = env[name]?.trim() ?? "";
    const parsed = raw === "" ? undefined : parse(raw, production);
    if (parsed !== undefined) {
      return parsed;
    }
    problems.push(`${name} (${raw === "" ? "missing" : "invalid"})`);
    return PLACEHOLDERS[name];
  };

  const config: SiteConfig = {
    appOrigin: read("APP_ORIGIN", parseOrigin),
    instagramUrl: read("APPROVED_INSTAGRAM_URL", parseInstagramUrl),
    privacyContactEmail: read("PRIVACY_CONTACT_EMAIL", parseContactEmail),
  };

  if (problems.length > 0 && production) {
    throw new Error(
      `${brand.name} waitlist production configuration is incomplete: ${problems.join(", ")}. ` +
        "Set APP_ORIGIN (exact https origin), APPROVED_INSTAGRAM_URL (https Instagram profile), " +
        "and PRIVACY_CONTACT_EMAIL (monitored address) in the Vercel production environment.",
    );
  }

  return config;
}

export const siteConfig: SiteConfig = resolveSiteConfig(process.env);
