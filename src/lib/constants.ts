/**
 * Fuel Forecast — design constants and palette
 *
 * Indian institutional design system inspired by:
 * - Kolam dot-grid motifs (Tamil geometric floor patterns)
 * - Mughal jaali lattice screens
 * - Mandala radial symmetry
 * - Private bank portal aesthetic
 */

export const PALETTE = {
  primary: "#C47335",       // Saffron terracotta
  secondary: "#5B7B9A",     // Muted slate
  gold: "#B8860B",          // Warm amber
  sage: "#4A7C59",          // Forest green
  burgundy: "#8B3A3A",      // Deep red
  grid: "#E8E0D4",          // Warm parchment grid
  bg: "#FAFAF8",           // Warm off-white
  text: "#4B5563",         // Muted charcoal
  textDark: "#1A1F2E",     // Dark headings
  border: "#E5E7EB",       // Hairline border
} as const;

export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
  TRENDS: "/dashboard/trends",
  ORDERS: "/dashboard/orders",
  SETTINGS: "/dashboard/settings",
  DIAGNOSTICS: "/dashboard/diagnostics",
  ACCOUNT: "/dashboard/account",
} as const;

export const FUEL_TYPES = [
  { value: "combined", label: "Combined" },
  { value: "Petrol", label: "Petrol" },
  { value: "High-Speed Diesel", label: "High-Speed Diesel" },
] as const;

export const SITE = {
  name: "Fuel Forecast",
  tagline: "Demand intelligence for petrol pump operators",
  location: "Kandaghat-Chail · Shimla District · Himachal Pradesh",
  altitude: "1,450 m · NH-22 corridor",
} as const;
