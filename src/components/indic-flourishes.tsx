/**
 * Indic Flourishes — traditional Indian decorative patterns
 *
 * All motifs are authentic Indian art forms in the public domain.
 * Built with proper SVG <defs>/<pattern> — scale-responsive, accessible.
 * Opacities raised to 0.2-0.5 range so patterns are clearly visible.
 */

import React from "react";

/*════════════════════════════════════════════════════════════════════════
  JAALI LATTICE — Mughal hexagonal pierced-screen
  Dense interlocking octagon + star + connecting lines.
  Use at opacity 0.08-0.15 for backgrounds, 0.25 for card accents.
  ════════════════════════════════════════════════════════════════════════*/
export function JaaliPattern({
  opacity = 0.12,
  scale = 1,
}: {
  opacity?: number; scale?: number;
}) {
  const s = 60 * scale;
  return (
    <svg
      width={s} height={s} viewBox="0 0 60 60"
      style={{ opacity, position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="jaali-full" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* outer octagon */}
          <path d="M30 2 L45 8 L54 22 L54 38 L45 52 L30 58 L15 52 L6 38 L6 22 L15 8 Z"
            fill="none" stroke="currentColor" strokeWidth="0.7" />
          {/* inner star */}
          <path d="M30 10 L40 16 L44 30 L40 44 L30 50 L20 44 L16 30 L20 16 Z"
            fill="none" stroke="currentColor" strokeWidth="0.5" />
          {/* center ring + dot */}
          <circle cx="30" cy="30" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="1.5" fill="currentColor" />
          {/* corner stars */}
          <path d="M2 2 L8 3 L10 8 L7 10 L2 7 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M58 2 L52 3 L50 8 L53 10 L58 7 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M2 58 L8 57 L10 52 L7 50 L2 53 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M58 58 L52 57 L50 52 L53 50 L58 53 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
          {/* connecting diagonals */}
          <line x1="15" y1="8" x2="6" y2="15" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" />
          <line x1="45" y1="8" x2="54" y2="15" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" />
          <line x1="15" y1="52" x2="6" y2="45" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" />
          <line x1="45" y1="52" x2="54" y2="45" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jaali-full)" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  MANDALA — 16-petal concentric rangoli, horizontal orientation
  ════════════════════════════════════════════════════════════════════════*/
export function MandalaOrnament({
  size = 100,
  accentColor = "currentColor",
  opacity = 0.35,
}: {
  size?: number; accentColor?: string; opacity?: number;
}) {
  const cx = size / 2;
  const cy = size * 0.15;
  const rings = [0.08, 0.16, 0.26];
  const petals = 16;
  return (
    <svg
      width={size} height={size * 0.3}
      viewBox={`0 0 ${size} ${size * 0.3}`}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block", margin: "0 auto" }}
      aria-hidden="true"
    >
      {/* concentric rings */}
      {rings.map((r, i) => (
        <circle key={`ring-${i}`} cx={cx} cy={cy} r={size * r}
          fill="none" stroke={accentColor} strokeWidth={i === 0 ? 0.8 : 0.4}
          strokeDasharray={i === 2 ? "3 4" : undefined} />
      ))}
      {/* petals */}
      {Array.from({ length: petals }, (_, i) => {
        const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
        const midR = size * 0.19;
        const px = cx + Math.cos(angle) * midR;
        const py = cy + Math.sin(angle) * midR;
        if (py > cy + size * 0.1) return null; // skip downward petals
        return (
          <ellipse key={i} cx={px} cy={py} rx={size * 0.018} ry={size * 0.032}
            transform={`rotate(${(angle * 180) / Math.PI}, ${px}, ${py})`}
            fill={accentColor} />
        );
      })}
      {/* center dot */}
      <circle cx={cx} cy={cy} r={size * 0.025} fill={accentColor} />
      {/* side guide lines */}
      <line x1={size * 0.03} y1={cy} x2={cx - size * 0.14} y2={cy}
        stroke={accentColor} strokeWidth="0.4" strokeDasharray="3 4" />
      <line x1={cx + size * 0.14} y1={cy} x2={size * 0.97} y2={cy}
        stroke={accentColor} strokeWidth="0.4" strokeDasharray="3 4" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  PAISLEY — larger teardrop motif, more ornate
  ════════════════════════════════════════════════════════════════════════*/
export function PaisleyAccent({
  size = 24, color = "currentColor", opacity = 0.35,
}: {
  size?: number; color?: string; opacity?: number;
}) {
  return (
    <svg
      width={size} height={size * 1.1} viewBox="0 0 28 30"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* main teardrop */}
      <path
        d="M16 26 C22 20 26 10 22 4 C18 0 14 2 14 6 C14 12 18 18 16 26 Z"
        fill={color} opacity="0.8"
      />
      {/* inner highlight */}
      <path
        d="M18 22 C22 18 23 12 20 7 C18 4 15 6 15 8 C15 12 17 16 18 22 Z"
        fill={color} opacity="0.5"
      />
      {/* top dot ornament */}
      <circle cx="20" cy="6" r="2.5" fill={color} opacity="0.7" />
      <circle cx="20" cy="6" r="1" fill="white" opacity="0.6" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  TORAN BORDER — auspicious mango-leaf + marigold garland
  Used as a full-width header/footer decorative band.
  ════════════════════════════════════════════════════════════════════════*/
export function ToranBorder({
  color = "currentColor", opacity = 0.3,
}: {
  color?: string; opacity?: number;
}) {
  return (
    <svg
      width="100%" height="20" viewBox="0 0 480 20" preserveAspectRatio="none"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="toran-pattern" width="32" height="20" patternUnits="userSpaceOnUse">
          {/* mango leaf left */}
          <path d="M4 16 Q8 6 14 10 Q8 14 4 16 Z" fill={color} opacity="0.5" />
          {/* mango leaf right */}
          <path d="M28 16 Q24 6 18 10 Q24 14 28 16 Z" fill={color} opacity="0.5" />
          {/* marigold center */}
          <circle cx="16" cy="10" r="3" fill={color} opacity="0.6" />
          <circle cx="16" cy="10" r="1.2" fill="white" opacity="0.4" />
          {/* connecting line */}
          <line x1="0" y1="14" x2="32" y2="14" stroke={color} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="20" fill="url(#toran-pattern)" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  BANDHANI DOTS — Rajasthani tie-dye clustered dot pattern
  ════════════════════════════════════════════════════════════════════════*/
export function BandhaniDots({
  color = "currentColor", opacity = 0.3, density = 12,
}: {
  color?: string; opacity?: number; density?: number;
}) {
  return (
    <svg
      width="100%" height="100%" viewBox="0 0 60 60"
      style={{ opacity, position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="bandhani" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* cluster of 4 dots */}
          <circle cx="8" cy="8" r="1.8" fill={color} />
          <circle cx="14" cy="14" r="1.2" fill={color} opacity="0.6" />
          <circle cx="6" cy="16" r="1.0" fill={color} opacity="0.5" />
          <circle cx="16" cy="6" r="1.0" fill={color} opacity="0.5" />
          {/* repeating clusters */}
          <circle cx="38" cy="38" r="1.8" fill={color} />
          <circle cx="44" cy="44" r="1.2" fill={color} opacity="0.6" />
          <circle cx="36" cy="46" r="1.0" fill={color} opacity="0.5" />
          <circle cx="46" cy="36" r="1.0" fill={color} opacity="0.5" />
          {/* offset clusters */}
          <circle cx="38" cy="8" r="1.4" fill={color} opacity="0.7" />
          <circle cx="44" cy="6" r="0.9" fill={color} opacity="0.5" />
          <circle cx="8" cy="38" r="1.4" fill={color} opacity="0.7" />
          <circle cx="6" cy="44" r="0.9" fill={color} opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bandhani)" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  LOTUS DIVIDER — row of blooming lotus petals
  ════════════════════════════════════════════════════════════════════════*/
export function LotusDivider({
  color = "#C47335", opacity = 0.3,
}: {
  color?: string; opacity?: number;
}) {
  return (
    <svg
      width="100%" height="16" viewBox="0 0 480 16" preserveAspectRatio="none"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="lotus-div" width="36" height="16" patternUnits="userSpaceOnUse">
          {/* lotus petal */}
          <path d="M8 14 Q18 -2 28 14" fill="none" stroke={color} strokeWidth="1" />
          <path d="M12 14 Q18 2 24 14" fill="none" stroke={color} strokeWidth="0.5" />
          {/* center dot */}
          <circle cx="18" cy="14" r="1.2" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill="url(#lotus-div)" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  MEHNDI VINE — flowing henna scroll with leaves and buds
  ════════════════════════════════════════════════════════════════════════*/
export function MehndiScrollBorder({
  color = "#C47335", opacity = 0.35,
}: {
  color?: string; opacity?: number;
}) {
  return (
    <svg
      width="100%" height="28" viewBox="0 0 480 28" preserveAspectRatio="none"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="mehndi-vine" width="52" height="28" patternUnits="userSpaceOnUse">
          {/* main vine — sine wave */}
          <path d="M0 14 Q13 2 26 14 Q39 26 52 14"
            fill="none" stroke={color} strokeWidth="0.8" />
          {/* leaves */}
          <path d="M8 8 Q3 2 -1 4" fill="none" stroke={color} strokeWidth="0.6" />
          <path d="M18 20 Q14 25 10 23" fill="none" stroke={color} strokeWidth="0.6" />
          <path d="M34 8 Q37 2 41 4" fill="none" stroke={color} strokeWidth="0.6" />
          <path d="M44 20 Q48 25 52 23" fill="none" stroke={color} strokeWidth="0.6" />
          {/* buds (small circles) */}
          <circle cx="13" cy="14" r="2.2" fill={color} opacity="0.7" />
          <circle cx="13" cy="14" r="0.8" fill="white" opacity="0.5" />
          <circle cx="39" cy="14" r="2.2" fill={color} opacity="0.7" />
          <circle cx="39" cy="14" r="0.8" fill="white" opacity="0.5" />
          {/* vine dots */}
          <circle cx="6" cy="7" r="1.0" fill={color} opacity="0.5" />
          <circle cx="20" cy="18" r="1.0" fill={color} opacity="0.5" />
          <circle cx="32" cy="7" r="1.0" fill={color} opacity="0.5" />
          <circle cx="46" cy="18" r="1.0" fill={color} opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="28" fill="url(#mehndi-vine)" />
    </svg>
  );
}

/*════════════════════════════════════════════════════════════════════════
  BORDER DIAMOND STRIPE
  ════════════════════════════════════════════════════════════════════════*/
export function DiamondStripe({ color = "#C47335", opacity = 0.3 }: { color?: string; opacity?: number }) {
  return (
    <svg width="100%" height="8" viewBox="0 0 480 8" preserveAspectRatio="none" fill="none"
      style={{ opacity, display: "block" }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diamond-stripe" width="28" height="8" patternUnits="userSpaceOnUse">
          <path d="M14 0 L17 4 L14 8 L11 4 Z" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="8" fill="url(#diamond-stripe)" />
    </svg>
  );
}
