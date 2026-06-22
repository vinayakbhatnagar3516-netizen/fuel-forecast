# Dashboard Redesign — Design Principles

Distilled from NNGroup, dashboard design research, and technopunk aesthetics.

## Sourced Principles (from NNGroup + dashboard research)

### 1. Preattentive Processing — Length & 2D Position > Area > Color
- Human vision processes length and x/y position preattentively (in <200ms)
- Bar charts > pie/donut for precise comparison
- Use color sparingly for category distinction, not quantity (NNGroup, 2017)

### 2. Operational vs Analytical — Know Which You're Building
- **Operational**: at-a-glance, time-sensitive, minimal cognitive load (what to do NOW)
- **Analytical**: exploration, comparison, trend discovery
- This dashboard is **operational** — the primary question is "What should I order today?"

### 3. The 5-Second Rule
- A user should grasp the current state within 5 seconds
- Three tiers of information: (1) status/alerts, (2) key metrics, (3) supporting detail

### 4. Data-Ink Ratio (Tufte)
- Maximize data-ink, minimize non-data ink
- Every decorative element must earn its place
- Remove chart junk: 3D effects, unnecessary gridlines, excessive borders

### 5. Nielsen's Heuristics for Dashboards
- **Visibility of system status**: real-time data freshness indicators
- **Match between system and real world**: readable labels, natural units
- **Consistency and standards**: same metric, same position, same format
- **Aesthetic and minimalist design**: no irrelevant information

### 6. Pre-Chunking
- Group related metrics visually (proximity, container, background tint)
- Decision banner + key metrics + supporting detail = natural reading flow

## Technopunk Aesthetic — Own Principles

### 7. Dark-First, Not Dark-Only
- Default to dark backgrounds — reduces eye strain, makes data glow
- But use sufficient contrast ratios (WCAG AA: 4.5:1 for body text)

### 8. Neon as Signal, Not Decoration
- One accent neon color = primary action/data
- Second accent = warning/alert state
- No "decorative" neon — every glow carries meaning

### 9. Typography as Atmosphere
- Monospace for data (tabular numbers align)
- Clean sans for navigation/labels
- Display/novelty type used ONLY for page/brand headings, at suitable size

### 10. Glassmorphism + Backdrop Filters (Sparingly)
- Frosted glass effect for modals/overlays only
- Not for every card — reduces contrast

### 11. Grid Transparency
- Subtle grid backgrounds reference terminal/CRT heritage
- Opacity < 5% — felt not seen

### 12. Motion with Purpose
- Loading: skeleton shimmer or data fade-in
- State change: cross-fade, no flash
- Hover: lift + glow, no bounce/spin

## What Was Removed from Original

| Element | Why Removed |
|---------|-------------|
| Kolam dot-grid sidebar bg | Unreadable at small sizes, added page weight |
| Mandala SVG patterns | Large files, decorative but meaningless |
| Saffron ornament dividers | Not data, not navigational |
| Gradient border-images | Inconsistent across browsers, added complexity |
| Kolam dot ornaments | Decorative circles with no data purpose |
| Paisley accent backgrounds | Large pattern images exported from Freepik |

## Color System (applied to all themes)

Each theme has exactly:
- 1 base dark (background)
- 1 surface dark (cards/panels)
- 1 elevated dark (hover/active)
- 1 primary neon (data highlights)
- 1 accent neon (warnings/alerts)
- 1 success green (positive metrics)
- 1 danger red (negative metrics)
- 1 info blue (neutral indicators)
- Body text (high contrast white/light)
- Muted text (secondary labels)
