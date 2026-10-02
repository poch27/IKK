import { ImageResponse } from "next/og";

import { brand } from "@/lib/brand";

export const alt = brand.og.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const { colors } = brand;

/**
 * Fully static social card built from lib/brand.ts: no request data.
 * Satori supports flexbox only, so every multi-child node uses display:flex.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: colors.dark,
          color: colors.light,
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.12em",
            color: colors.mutedOnDark,
          }}
        >
          {brand.og.kicker}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 240,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            color: colors.light,
          }}
        >
          {brand.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${colors.ruleOnDark}`,
            paddingTop: 36,
          }}
        >
          <div style={{ display: "flex", fontSize: 40, color: colors.light }}>
            {brand.og.tagline}
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: colors.accent,
              color: colors.onAccent,
              fontSize: 36,
              fontWeight: 700,
              padding: "22px 36px",
              textTransform: "uppercase",
            }}
          >
            {brand.og.badge}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
