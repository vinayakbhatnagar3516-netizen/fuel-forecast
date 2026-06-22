# Dashboard Redesign — 3 Theme Variants

> Three distinct visual directions for Fuel Forecast. Pick one (or mix elements from multiple).

## How to view

Open any file directly in a browser:

| Theme | File | Open Command |
|-------|------|-------------|
| Technopunk Neon (tech-forward) | `themes/01-technopunk-neon.html` | `open themes/01-technopunk-neon.html` |
| Industrial Utility (middle) | `themes/02-industrial-utility.html` | `open themes/02-industrial-utility.html` |
| Rustic Modern (rustic-forward) | `themes/03-rustic-modern.html` | `open themes/03-rustic-modern.html` |

## Head-to-head comparison

| Dimension | Technopunk Neon | Industrial Utility | Rustic Modern |
|-----------|----------------|-------------------|---------------|
| **Background** | Deep navy `#0a0e17` | Charcoal `#1a1c1e` | Warm cream `#f5f0eb` |
| **Accent color** | Cyan + magenta neon | Amber + warm orange | Clay terracotta + brown |
| **Typography** | Space Grotesk (sans) | Barlow Condensed (display) + Inter | Source Serif 4 (serif) |
| **Data font** | JetBrains Mono | JetBrains Mono | JetBrains Mono |
| **Cards** | Surface panels with glow hover | Thick panel borders, top indicator | Rounded white cards with subtle shadow |
| **Visual texture** | Scanlines + grid overlay | Solid engineering | Paper noise texture |
| **Primary action** | Gradient text + glow | Thick amber border | Warm dark gradient card |
| **Feel** | Futuristic, night club for data | Control room, heavy equipment | Heritage brand meets modern analytics |
| **Best for** | Tech-forward operators, night shifts | Engineering mindset, industrial ops | Traditional businesses, premium feel |
| **Readability** | High contrast (cyan on dark) | Very high (amber on charcoal) | High (dark text on cream) |

## Design decisions applied to all themes

1. **Removed all decorative SVG patterns** (kolam dots, mandalas, paisley banners) — zero external image files
2. **Two Google Fonts only** (body + display) + JetBrains Mono from CDN — fast loading
3. **Inline SVG for charts** (no charting library dependency)
4. **Responsive** — collapses gracefully on mobile (sidebar shrinks, grids go 1-column)
5. **No emoji icons**, no decorative-only elements
6. **Data-ink maximized** — every element carries information
7. **Consistent layout** across all 3 themes (same content structure, same data, same 5-second scan path)

## Content layout (same across all themes)

```
TOP STRIP:  Pump name → location → DB status → date
DECISION BANNER:  What to order + confidence tag
PRODUCT TABS:  Petrol / High-Speed Diesel
STATS ROW (4):  Forecast | Stock | Days to Stockout | Commission
CHARTS ROW (2-col):  Quantile fan chart | Tank gauge + P&L
MID ROW (2-col):  Order card | Policy selector + early warning
TABLE:  Forecast vs actual (last 7 days)
FOOTER:  Version info + data sources
```

## Design principles distilled (see DESIGN-PRINCIPLES.md)

- Preattentive processing: length & 2D position > area > color (NNGroup)
- Operational dashboard: at-a-glance decision support, minimal cognitive load
- 5-second rule: status → metrics → detail
- Data-ink ratio maximized (Tufte)
- Technopunk neon as signal, not decoration
