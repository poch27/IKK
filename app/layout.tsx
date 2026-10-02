import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";

import { brand, brandCssVariables } from "@/lib/brand";
import { formatPrice, fromPrice } from "@/lib/drop";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site";

import "@styles/globals.css";

const title = brand.meta.title;
const description = brand.meta.description(formatPrice(fromPrice()));

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.appOrigin),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: brand.ogLocale,
    url: "/",
    siteName: brand.name,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: brand.colors.dark,
};

const htmlStyle = { ...brandCssVariables(), background: brand.colors.dark } as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={brand.locale} className={fontVariables} style={htmlStyle}>
      <body style={{ background: brand.colors.dark }}>{children}</body>
    </html>
  );
}
