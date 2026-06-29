/**
 * Slate design tokens for Fuel Forecast
 *
 * Principles:
 * - Single typeface: Inter (sans) throughout
 * - Blue accent (#2563eb) for primary actions and data highlights
 * - Cool grey backgrounds, white cards, high contrast
 * - No decorative patterns, no serif, no warm tones
 * - Tight 4px radius dominant; 8px for cards
 */

export const colors = {
  /* Core palette */
  blue:        "#2563eb",
  blueHover:   "#1d4ed8",
  blueSoft:    "rgba(74,111,165,0.08)",
  green:       "#059669",
  greenSoft:   "rgba(5,150,105,0.08)",
  red:         "#dc2626",
  redSoft:     "rgba(220,38,38,0.06)",
  amber:       "#d97706",
  amberSoft:   "rgba(217,119,6,0.08)",

  /* Greys */
  slate50:  "#f5f6f8",
  slate100: "#eef1f4",
  slate200: "#e4e8ed",
  slate300: "#d0d5db",
  slate400: "#b0b8c2",
  slate500: "#8a94a0",
  slate600: "#5a626d",
  slate700: "#3a4149",
  slate800: "#1a1d21",
  slate900: "#0d0f12",

  /* Semantic */
  textPrimary:    "#1a1d21",
  textSecondary:  "#5a626d",
  textTertiary:   "#8a94a0",
  bgCanvas:       "#eef1f4",
  bgCard:         "#ffffff",
  borderDefault:  "#d0d5db",
  borderInput:    "#d0d5db",
} as const;

export const typography = {
  headingLg: {
    fontFamily: "var(--font-inter)",
    fontSize: "22px", fontWeight: "600",
    lineHeight: "28px", letterSpacing: "-0.3px",
  },
  headingMd: {
    fontFamily: "var(--font-inter)",
    fontSize: "16px", fontWeight: "600",
    lineHeight: "22px", letterSpacing: "-0.2px",
  },
  headingSm: {
    fontFamily: "var(--font-inter)",
    fontSize: "14px", fontWeight: "600",
    lineHeight: "20px",
  },
  body: {
    fontFamily: "var(--font-inter)",
    fontSize: "13px", fontWeight: "400",
    lineHeight: "20px",
  },
  bodySm: {
    fontFamily: "var(--font-inter)",
    fontSize: "12px", fontWeight: "400",
    lineHeight: "18px",
  },
  label: {
    fontFamily: "var(--font-inter)",
    fontSize: "10px", fontWeight: "600",
    letterSpacing: "0.5px", textTransform: "uppercase" as const,
  },
  statValue: {
    fontFamily: "var(--font-inter)",
    fontSize: "24px", fontWeight: "500",
    lineHeight: "28px", letterSpacing: "-0.3px",
    fontVariantNumeric: "tabular-nums" as const,
  },
} as const;

export const radii = {
  none:  "0px",
  xs:    "3px",
  sm:    "4px",
  md:    "8px",
  lg:    "12px",
} as const;

export const spacing = {
  xs:   "8px",
  sm:   "12px",
  md:   "16px",
  base: "20px",
  lg:   "24px",
  xl:   "32px",
} as const;
