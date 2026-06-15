/**
 * Heap-inspired design tokens for Fuel Forecast
 *
 * Principles:
 * - Dual typeface split: Inter (structural) / Source Serif 4 (prose)
 * - Brand color (saffron) is border/text only — never a button fill
 * - No shadow system — elevation via 2px borders
 * - Tight 4px radius dominant; 10px for cards
 * - Weight-400 display headings; scale = hierarchy, not weight
 * - Single dark band for editorial punctuation
 */

export const colors = {
  /* Anchor palette */
  primary:     "#C47335", // saffron terracotta — border & highlight only
  primaryDeep: "#A85F2A", // hover / active
  primaryDark: "#8B4513", // link color
  ink:         "#1A1F2E", // primary text, button fill
  canvas:      "#FAFAF8", // page floor (warm off‑white)
  surfaceDim:  "#1A1F2E", // single dark band
  hairline:    "#E5E7EB", // card & input borders
  hairlineDim: "#D1D5DB", // muted border
  inkMuted:    "#64748B", // secondary text
  inkDim:      "#94A3B8", // placeholder / metadata
  sage:        "#4A7C59", // positive / buy accent
  burgundy:    "#8B3A3A", // negative / sell accent
  amber:       "#946C00", // warning / hold accent
  gold:        "#DAA520", // highlight

  /* Semantic aliases */
  textPrimary:    "#1A1F2E",
  textSecondary:  "#64748B",
  textPlaceholder:"#94A3B8",
  borderCard:     "#E5E7EB",
  borderButton:   "#C47335",
  bgButtonPrimary:"#1A1F2E",
  bgButtonHover:  "#2D3348",
  bgDarkBand:     "#1A1F2E",
  bgCanvas:       "#FAFAF8",
} as const;

export const typography = {
  /* Structural: Inter (geometric sans) — display, nav, eyebrow, headings */
  displayLg: {
    fontFamily: "var(--font-inter)",
    fontSize: "48px",
    fontWeight: "400",
    lineHeight: "50px",
    letterSpacing: "-1.44px",
  },
  headingLg: {
    fontFamily: "var(--font-inter)",
    fontSize: "32px",
    fontWeight: "400",
    lineHeight: "40px",
    letterSpacing: "-0.96px",
  },
  headingSm: {
    fontFamily: "var(--font-inter)",
    fontSize: "20px",
    fontWeight: "400",
    lineHeight: "28px",
    letterSpacing: "-0.6px",
  },
  eyebrow: {
    fontFamily: "var(--font-inter)",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "18px",
    letterSpacing: "1.3px",
    textTransform: "uppercase" as const,
  },
  navLink: {
    fontFamily: "var(--font-inter)",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    letterSpacing: "0",
  },

  /* Prose: Source Serif 4 — body, captions, descriptions, pull quotes */
  bodyLg: {
    fontFamily: "var(--font-source-serif)",
    fontSize: "18px",
    fontWeight: "400",
    lineHeight: "28px",
    letterSpacing: "0",
  },
  bodyMd: {
    fontFamily: "var(--font-source-serif)",
    fontSize: "15px",
    fontWeight: "400",
    lineHeight: "24px",
    letterSpacing: "0",
  },
  bodySm: {
    fontFamily: "var(--font-source-serif)",
    fontSize: "13px",
    fontWeight: "400",
    lineHeight: "20px",
    letterSpacing: "0",
  },
  caption: {
    fontFamily: "var(--font-source-serif)",
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "18px",
    letterSpacing: "0",
  },
  label: {
    fontFamily: "var(--font-inter)",
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "18px",
    letterSpacing: "0",
  },
} as const;

export const radii = {
  none:  "0px",
  xs:    "4px",    // inputs, form elements, chips — dominant radius
  sm:    "6px",
  md:    "10px",   // cards
  lg:    "16px",
  pill:  "9999px", // buttons
} as const;

export const spacing = {
  xs:   "8px",
  sm:   "16px",
  md:   "24px",
  base: "32px",
  lg:   "40px",
  xl:   "48px",
  "2xl":"64px",
  "3xl":"96px",
} as const;

export const borders = {
  card:   "1px solid var(--border-card, #E5E7EB)",
  button: "1.5px solid var(--border-button, #C47335)",
  hairline: "1px solid var(--hairline, #E5E7EB)",
} as const;

export const componentTokens = {
  card: {
    padding: spacing.base,
    radius: radii.md,
    border: borders.card,
    background: colors.canvas,
  },
  statMetric: {
    fontFamily: "var(--font-inter)",
    fontSize: "48px",
    fontWeight: "400",
    lineHeight: "50px",
    letterSpacing: "-1.44px",
  },
  buttonPrimary: {
    background: colors.bgButtonPrimary,
    color: "#FFFFFF",
    radius: radii.pill,
    border: `1.5px solid ${colors.primary}`,
    padding: "10px 24px",
    height: "42px",
  },
  buttonSecondary: {
    background: "transparent",
    color: colors.ink,
    radius: radii.pill,
    border: `1.5px solid ${colors.primary}`,
    padding: "10px 24px",
    height: "42px",
  },
  textInput: {
    radius: radii.xs,
    border: `1px solid ${colors.hairline}`,
    padding: "6px 12px",
    height: "38px",
    fontSize: "14px",
  },
} as const;
