/**
 * Indic Flourishes — reusable Indian decorative SVG components
 *
 * Industry-practice patterns:
 * - Inline SVG with semantic <defs> for reusable gradients/masks
 * - Proper viewBox for responsive scaling
 * - CSS custom-property-driven colors so they adapt to the theme
 * - Subtle opacities (0.04–0.12) so content remains primary
 * - All motifs are traditional Indian designs in the public domain
 */

/*═══════════════════════════════════════════════════════════════════
  JAALI LATTICE — Mughal geometric pierced-screen pattern
  Repeating hex-star motif. Use as card background or sidebar.
  ═══════════════════════════════════════════════════════════════════*/
export function JaaliPattern({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60" height="60" viewBox="0 0 60 60"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="jaali" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* outer octagon */}
          <path d="M30 2 L45 8 L54 22 L54 38 L45 52 L30 58 L15 52 L6 38 L6 22 L15 8 Z"
            fill="none" stroke="currentColor" strokeWidth="0.6" />
          {/* inner star */}
          <path d="M30 12 L38 18 L42 30 L38 42 L30 48 L22 42 L18 30 L22 18 Z"
            fill="none" stroke="currentColor" strokeWidth="0.4" />
          {/* center dot */}
          <circle cx="30" cy="30" r="1.8" fill="currentColor" />
          {/* corner quarter-stars */}
          <path d="M2 2 L8 2 L8 8" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M58 2 L52 2 L52 8" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M2 58 L8 58 L8 52" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M58 58 L52 58 L52 52" fill="none" stroke="currentColor" strokeWidth="0.4" />
          {/* connecting lines */}
          <line x1="15" y1="8" x2="8" y2="15" stroke="currentColor" strokeWidth="0.3" />
          <line x1="45" y1="8" x2="52" y2="15" stroke="currentColor" strokeWidth="0.3" />
          <line x1="15" y1="52" x2="8" y2="45" stroke="currentColor" strokeWidth="0.3" />
          <line x1="45" y1="52" x2="52" y2="45" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jaali)" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════════════
  MANDALA ORNAMENT — South Indian rangoli / kolam
  8-petal concentric geometric flower. Section divider.
  ═══════════════════════════════════════════════════════════════════*/
export function MandalaOrnament({
  size = 64,
  accentColor = "currentColor",
  opacity = 0.24,
}: {
  size?: number; accentColor?: string; opacity?: number;
}) {
  return (
    <svg
      width={size} height={size / 4}
      viewBox={`0 0 ${size} ${size / 4}`}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    >
      {/* center circle */}
      <circle cx={size / 2} cy={size / 8} r={size / 24} fill={accentColor} />
      {/* petals — 8 equally spaced arcs */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = size / 2 + Math.cos(rad) * size * 0.18;
        const cy = size / 8 + Math.sin(rad) * size * 0.18;
        // skip downward petals — keep ornament horizontal
        if (angle > 180 && angle < 360) return null;
        return (
          <circle key={i} cx={cx} cy={cy} r={size / 40} fill={accentColor} />
        );
      })}
      {/* horizontal guide lines */}
      <line x1={size * 0.05} y1={size / 8} x2={size / 2 - size * 0.12} y2={size / 8}
        stroke={accentColor} strokeWidth="0.3" strokeDasharray="2 3" />
      <line x1={size / 2 + size * 0.12} y1={size / 8} x2={size * 0.95} y2={size / 8}
        stroke={accentColor} strokeWidth="0.3" strokeDasharray="2 3" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════════════
  LOTUS DIVIDER — row of lotus petals as a horizontal section break
  ═══════════════════════════════════════════════════════════════════*/
export function LotusDivider({ color = "currentColor", opacity = 0.18 }: {
  color?: string; opacity?: number;
}) {
  const petals = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg
      width="100%" height="12" viewBox="0 0 480 12" preserveAspectRatio="none"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="lotus-petal" width="40" height="12" patternUnits="userSpaceOnUse">
          <path d="M10 10 Q20 0 30 10" fill="none" stroke={color} strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#lotus-petal)" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════════════
  MEHNDI SCROLL — vine-and-leaf border flourish (used on cards)
  ═══════════════════════════════════════════════════════════════════*/
export function MehndiScrollBorder({
  height = 4, color = "currentColor", opacity = 0.22, side = "top",
}: {
  height?: number; color?: string; opacity?: number; side?: "top" | "bottom";
}) {
  const curls = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div
      style={{
        height: `${height * 4}px`,
        opacity,
        overflow: "hidden",
        marginBottom: side === "top" ? "12px" : 0,
        marginTop: side === "bottom" ? "12px" : 0,
      }}
      aria-hidden="true"
    >
      <svg
        width="100%" height="16" viewBox="0 0 480 16" preserveAspectRatio="none"
        fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="mehndi-scroll" width="30" height="16" patternUnits="userSpaceOnUse">
            {/* main vine */}
            <path d="M0 8 Q7.5 2 15 8 Q22.5 14 30 8"
              fill="none" stroke={color} strokeWidth="0.5" />
            {/* leaves */}
            <path d="M5 8 Q3 4 1 5" fill="none" stroke={color} strokeWidth="0.4" />
            <path d="M10 8 Q8 12 6 11" fill="none" stroke={color} strokeWidth="0.4" />
            <path d="M20 8 Q22 4 24 5" fill="none" stroke={color} strokeWidth="0.4" />
            <path d="M25 8 Q27 12 29 11" fill="none" stroke={color} strokeWidth="0.4" />
            {/* dots */}
            <circle cx="7.5" cy="8" r="0.6" fill={color} />
            <circle cx="22.5" cy="8" r="0.6" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="16" fill="url(#mehndi-scroll)" />
      </svg>
    </div>
  );
}

/*═══════════════════════════════════════════════════════════════════
  PAISLEY ACCENT — small teardrop motif for card corners or bullets
  ═══════════════════════════════════════════════════════════════════*/
export function PaisleyAccent({
  size = 20, color = "currentColor", opacity = 0.3,
}: {
  size?: number; color?: string; opacity?: number;
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M14 22 C18 18 22 12 18 6 C14 2 10 4 10 8 C10 12 14 16 14 22 Z"
        fill={color}
      />
      <circle cx="13" cy="6" r="2" fill={color} opacity="0.6" />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════════════
  MUGHAL ARCH — pointed arch header accent for decision banners
  ═══════════════════════════════════════════════════════════════════*/
export function MughalArch({
  color = "currentColor", opacity = 0.12,
}: {
  color?: string; opacity?: number;
}) {
  return (
    <svg
      width="100%" height="24" viewBox="0 0 480 24" preserveAspectRatio="none"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {/* main arch */}
      <path
        d="M80 24 L80 8 Q240 -8 400 8 L400 24"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* inner arch line */}
      <path
        d="M120 24 L120 12 Q240 4 360 12 L360 24"
        fill="none" stroke={color} strokeWidth="0.6"
      />
    </svg>
  );
}

/*═══════════════════════════════════════════════════════════════════
  DIAMOND STRIPE — like a sari border / zari pattern for card edges
  ═══════════════════════════════════════════════════════════════════*/
export function DiamondStripe({
  color = "currentColor", opacity = 0.15, count = 14,
}: {
  color?: string; opacity?: number; count?: number;
}) {
  const diamonds = Array.from({ length: count }, (_, i) => i);
  const spacing = 100 / count;
  return (
    <div
      style={{ height: "6px", opacity, overflow: "hidden" }}
      aria-hidden="true"
    >
      <svg width="100%" height="6" viewBox="0 0 480 6" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="diamond-stripe" width="34" height="6" patternUnits="userSpaceOnUse">
            <path d="M17 0 L20 3 L17 6 L14 3 Z" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="6" fill="url(#diamond-stripe)" />
      </svg>
    </div>
  );
}

/*═══════════════════════════════════════════════════════════════════
  KANTHA STITCH — running stitch border like Bengali embroidery
  ═══════════════════════════════════════════════════════════════════*/
export function KanthaStitch({
  color = "currentColor", opacity = 0.2,
}: {
  color?: string; opacity?: number;
}) {
  return (
    <div style={{ height: "4px", opacity, overflow: "hidden" }} aria-hidden="true">
      <svg width="100%" height="4" viewBox="0 0 480 4" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="kantha-stitch" width="8" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2" x2="5" y2="2" stroke={color} strokeWidth="0.7" />
            <circle cx="2" cy="2" r="0.4" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="4" fill="url(#kantha-stitch)" />
      </svg>
    </div>
  );
}
