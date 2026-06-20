/**
 * Indic Motifs — refined, modern interpretations of classical Indian geometry.
 *
 * These are designed to feel like museum labels or architectural drawings:
 * quiet, structural, and used as single accents rather than wallpaper.
 * All components are SVG-based, scale-independent, and aria-hidden.
 */

import React from "react";

/*═══════════════════════════════════════════════════════════
  YANTRA MARK
  A minimal sacred-geometry emblem: concentric circles, a downward-pointing
  stabilising triangle, and a blooming lotus centre. Used as the brand glyph.
  ═══════════════════════════════════════════════════════════*/
export function YantraMark({
  size = 48,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* outer ring */}
      <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="0.8" opacity="0.25" />
      {/* inner ring */}
      <circle cx="24" cy="24" r="17" stroke={color} strokeWidth="0.5" opacity="0.35" />
      {/* stabilising triangle */}
      <path
        d="M24 8 L38 36 H10 Z"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.45"
      />
      {/* lotus petals */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180 - Math.PI / 2;
        const r = 9;
        const x1 = 24 + Math.cos(angle) * 4;
        const y1 = 24 + Math.sin(angle) * 4;
        const x2 = 24 + Math.cos(angle) * r;
        const y2 = 24 + Math.sin(angle) * r;
        return (
          <path
            key={i}
            d={`M${x1} ${y1} Q${24 + Math.cos(angle - 0.35) * (r + 2)} ${24 + Math.sin(angle - 0.35) * (r + 2)} ${x2} ${y2} Q${24 + Math.cos(angle + 0.35) * (r + 2)} ${24 + Math.sin(angle + 0.35) * (r + 2)} ${x1} ${y1}`}
            fill={color}
            opacity="0.18"
          />
        );
      })}
      {/* centre bindu */}
      <circle cx="24" cy="24" r="2.5" fill={color} opacity="0.9" />
      <circle cx="24" cy="24" r="1" fill="#FAFAF8" opacity="0.7" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════
  KOLAM GRID
  A Tamil/South-Indian dot-grid floor pattern. Rendered as a full-bleed
  background; pair with a radial mask so it only breathes at the edges.
  ═══════════════════════════════════════════════════════════*/
export function KolamGrid({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="kolam"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          {/* dots */}
          {[
            [0, 0],
            [20, 0],
            [40, 0],
            [0, 20],
            [20, 20],
            [40, 20],
            [0, 40],
            [20, 40],
            [40, 40],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1" fill="currentColor" opacity="0.35" />
          ))}
          {/* connecting arcs */}
          <path
            d="M0 20 Q10 10 20 20 Q30 30 40 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.18"
          />
          <path
            d="M20 0 Q30 10 20 20 Q10 30 20 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.18"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kolam)" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════
  JAALI CORNER
  A Mughal pierced-screen quarter motif. Use absolute-positioned in a card
  corner with opacity 0.06-0.10.
  ═══════════════════════════════════════════════════════════*/
export function JaaliCorner({
  position = "top-right",
  size = 120,
  color = "currentColor",
  className = "",
}: {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: number;
  color?: string;
  className?: string;
}) {
  const rotations: Record<string, number> = {
    "top-right": 0,
    "top-left": -90,
    "bottom-left": -180,
    "bottom-right": 90,
  };
  const translate = {
    "top-right": { x: 0, y: 0 },
    "top-left": { x: size, y: 0 },
    "bottom-left": { x: size, y: size },
    "bottom-right": { x: 0, y: size },
  }[position];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute pointer-events-none ${className}`}
      style={{
        color,
        transform: `translate(${translate.x}px, ${translate.y}px) rotate(${rotations[position]}deg)`,
        transformOrigin: "0 0",
        ...(position === "top-right" ? { top: 0, right: 0 } : {}),
        ...(position === "top-left" ? { top: 0, left: 0 } : {}),
        ...(position === "bottom-left" ? { bottom: 0, left: 0 } : {}),
        ...(position === "bottom-right" ? { bottom: 0, right: 0 } : {}),
      }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="jaali-corner"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M15 2 L26 8 L26 22 L15 28 L4 22 L4 8 Z"
            stroke={color}
            strokeWidth="0.6"
            opacity="0.35"
          />
          <path
            d="M15 6 L21 10 L21 20 L15 24 L9 20 L9 10 Z"
            stroke={color}
            strokeWidth="0.4"
            opacity="0.25"
          />
          <circle cx="15" cy="15" r="1.5" fill={color} opacity="0.4" />
        </pattern>
      </defs>
      <rect width="120" height="120" fill="url(#jaali-corner)" />
      {/* radial fade so it melts into the card */}
      <rect
        width="120"
        height="120"
        fill="url(#corner-fade)"
        style={{ mixBlendMode: "normal" }}
      />
      <defs>
        <radialGradient id="corner-fade" cx="0" cy="0" r="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="70%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════
  LOTUS RULE
  A single blooming-lotus divider. Calm, symmetrical, horizontal.
  ═══════════════════════════════════════════════════════════*/
export function LotusRule({
  color = "currentColor",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width="100%"
      height="16"
      viewBox="0 0 480 16"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="lotus-rule"
          width="48"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M12 14 Q24 -2 36 14"
            stroke={color}
            strokeWidth="0.8"
            opacity="0.45"
          />
          <path
            d="M18 14 Q24 4 30 14"
            stroke={color}
            strokeWidth="0.4"
            opacity="0.35"
          />
          <circle cx="24" cy="14" r="1.2" fill={color} opacity="0.55" />
          <line x1="0" y1="15" x2="10" y2="15" stroke={color} strokeWidth="0.4" opacity="0.25" />
          <line x1="38" y1="15" x2="48" y2="15" stroke={color} strokeWidth="0.4" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill="url(#lotus-rule)" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════
  DIAMOND STITCH
  A tiny repeating diamond band for micro-borders under headings.
  ═══════════════════════════════════════════════════════════*/
export function DiamondStitch({
  color = "currentColor",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width="72"
      height="6"
      viewBox="0 0 72 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="diamond-stitch"
          width="12"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M6 0 L8 3 L6 6 L4 3 Z"
            fill={color}
            opacity="0.45"
          />
        </pattern>
      </defs>
      <rect width="72" height="6" fill="url(#diamond-stitch)" />
    </svg>
  );
}
