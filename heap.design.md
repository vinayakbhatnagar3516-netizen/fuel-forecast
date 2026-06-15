---
version: alpha
name: "Heap"
website: "https://www.heap.io"
description: >-
  A product-analytics platform running Circular Standard for display and Lettera Text for body prose on a pure-white canvas — the two typefaces split reading context rather than size tier. The system's brand color is electric mint green #31d891, used exclusively as a border and marker highlight rather than as a button fill; primary buttons use an ink-black #111111 fill with a 2px mint border, and the deep-navy background #100841 anchors the only dark section on the page. No shadow system; 4px tight card radius throughout.

seo:
  title: "Heap Design System for React — mint green #31d891, Circular Standard + Lettera Text, 17 components"
  metaDescription: "Heap's marketing design system as a DESIGN.md file — mint green as border voltage, dual typefaces, ink-black CTAs, 16 color tokens, 17 components for React and AI tools."
  highlights:
    - "Border-only brand voltage — mint green #31d891 appears on button borders and text highlights, never as a fill; the button body stays ink-black #111111"
    - "Dual-typeface split — Circular Standard carries display and nav at weight 400; Lettera Text handles body prose and pull quotes; the division is by semantic register, not size"
    - "Weight-400 display headings — the 72px hero h1 runs at weight 400, not 700; Heap signals confidence through scale rather than typographic weight"
    - "Deep-navy section island — #100841 is the single dark band on the page, used for the Contentsquare co-brand block only"
    - "4px tight card radius — smallest radius in the analytics peer group; Mixpanel and Amplitude both use 8px+, Heap runs 4-5px throughout"
  tags:
    - "Analytics & Data"
    - "Developer Tools & IDEs"
  lastUpdated: "2026-05-19"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Heap's marketing site makes a counterintuitive choice: the electric mint green that defines the visual identity never fills a button. The primary CTA uses ink-black fill with a 2px mint border, and when mint appears as text it marks a highlight or a link — never a background swatch. Unlike Mixpanel, which commits its product color to every interactive element, or Amplitude, which tints hero bands with its orange, Heap treats the mint as a precision signal: it shows up on borders and underlines to indicate meaning, not decoration.

    The DESIGN.md file packages the system into a machine-readable spec for React and AI tools. Inside: 16 color tokens built around the ink-black primary, a pure-white canvas, the mint green trio (full saturation, muted, and deep tint), and a deep-navy band color; 13 typography tokens spanning Circular Standard (display, nav, section headings, eyebrow labels) and Lettera Text (body paragraphs, pull quotes, form labels); 5 radius tokens anchored at 4-5px tight; 8 spacing values on a 16-48px scale; and 17 component definitions covering the mint-bordered primary button, the dual-font feature cards, and the Contentsquare co-brand dark block.

    Feed this file to Claude or Cursor and it reproduces Heap's specific moves: ink-black primary CTA with mint border instead of a mint fill, weight-400 display at 72px, Circular Standard for everything structural and Lettera Text for every paragraph, tight 4px rounding, and the deep-navy dark section isolated to the acquisition co-brand block. The dual-typeface split is the most transferable pattern — using a geometric sans for navigation and headings while switching to a text-optimized serif-adjacent for prose is a technique that makes body copy feel editorial without requiring a separate font for display.

  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://www.heap.io"
      title: "Heap — official site"
      description: "Heap's public marketing site — the source of truth for the live tokens captured in this file."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Heap's primary brand color and where does it appear?"
      answer: "Heap's brand voltage is electric mint green at #31d891, wired in CSS as --color-green, --color-bd-btn, --color-hover-bd-btn, and --color-mark-bg. The critical restriction: it appears as a border and marker highlight only, never as a button background fill. The primary CTA button uses it as a 2px border (--bdw-btn: 2px; --color-bd-btn: #31d891) while the body remains ink-black #111111. The mint also appears as a text-mark background (--color-mark-bg) and as link color in its darker form (#31715f). Across the captured page, total mint-green occurrences are 34 — split evenly between text (17) and border (17), zero as background fill."
    - id: "typography"
      title: "What typefaces does Heap use and how are they divided?"
      answer: "Heap runs two distinct typefaces with a semantic rather than size-based split. Circular Standard (a geometric sans from Lineto) carries display headings, nav links, section subheadings, and eyebrow labels — everything structural and navigational. Lettera Text (a slightly warmer sans from the same foundry) carries body paragraphs, pull quotes, form labels, and inline emphasis. The hero h1 uses Circular Standard at 72px / weight 400 with -2.16px letter-spacing. Body prose uses Lettera Text at 16-18px / weight 400. The mono stack (SF Mono, Monaco, Inconsolata) appears only in code contexts. Because both families are Lineto proprietary, the closest open-source substitutes are Inter (for Circular Standard) and Source Serif 4 or IBM Plex Serif (for Lettera Text's editorial register)."
    - id: "canvas-and-dark"
      title: "Why does Heap have a deep-navy band if the site is light-mode only?"
      answer: "The deep-navy section (#100841, wired as --color-bg-dim) appears in exactly one context: the Heap + Contentsquare co-brand acquisition block, which announces the parent company relationship and prompts users toward the combined platform. Outside this single band, the entire page is white (#ffffff) canvas with ink-black text. The navy is not a global dark mode — it is an isolated editorial dark block used to signal a distinct brand relationship. This is a common pattern for acquired products: a contained 'partnership island' in the parent brand's color anchors the narrative transition without committing the page to a full dark-mode palette."
    - id: "button-anatomy"
      title: "How is Heap's primary button constructed?"
      answer: "The primary button uses --color-bg-btn (transparent/black) as the body fill and --color-bd-btn (#31d891) as a 2px mint border. Text is ink-black #111111 (--color-text-btn). On hover, --color-hover-bg-btn-accent becomes #111111 (the fill darkens to full ink) and --color-hover-text-btn-accent flips to #ffffff (text inverts to white). The border transitions to --color-hover-bd-btn-accent which also becomes #111. This means the button hover state is a full ink fill with white text — essentially the inverse of the resting state. Radius sits at 70px pill on the form CTA and 4px on smaller interactive elements."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build a product-analytics landing page?"
      answer: "Yes — the file is designed to be fed into Claude, Cursor, or any AI tool that reads structured design tokens. The agent will reproduce Heap's specific moves: ink-black primary CTA with 2px mint border, Circular Standard for all structural typography and Lettera Text for prose, tight 4px card rounding, pure-white canvas with a single isolated deep-navy dark section, and mint green reserved for borders and text marks only. The dual-typeface split is the most distinctive token choice in this system — it creates an editorial register for body copy without the visual weight of an actual serif font. Most AI tools will correctly apply the typeface split if the tokens name the semantic role (body-paragraph vs. nav-link) rather than just font size."

mockups:
  - "marketing-hero"
  - "dashboard-card-grid"

colors:
  primary: "#31d891"
  primary-muted: "#31a679"
  primary-dark: "#31715f"
  primary-link-hover: "#1b4438"
  ink: "#111111"
  canvas: "#ffffff"
  surface-dim: "#100841"
  hairline: "#dfdfdf"
  hairline-muted: "#c4c9ce"
  ink-muted: "#4f525d"
  ink-dim: "#868c95"
  placeholder: "#6b707a"
  surface-tint: "#efefff"
  surface-gray: "#a7abb3"
  error: "#df0134"
  error-dark: "#a80125"

typography:
  display-xl:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 72px
    fontWeight: 400
    lineHeight: 70px
    letterSpacing: "-2.16px"
  display-lg:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 56px
    fontWeight: 400
    lineHeight: 61.6px
    letterSpacing: "-1.68px"
  display-md:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 48px
    fontWeight: 400
    lineHeight: 50px
    letterSpacing: "-1.44px"
  heading-lg:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 40px
    letterSpacing: "-0.96px"
  heading-sm:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: "-0.6px"
  eyebrow:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: "1.8px"
  nav-link:
    fontFamily: "\"Circular Standard\", \"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  body-lg:
    fontFamily: "\"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0
  body-md:
    fontFamily: "\"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-sm:
    fontFamily: "\"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  label-bold:
    fontFamily: "\"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 20px
    letterSpacing: 0
  pull-quote:
    fontFamily: "\"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 30px
    letterSpacing: 0
  caption:
    fontFamily: "\"Lettera Text\", system-ui, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0

rounded:
  none: "0px"
  xs: "4px"
  sm: "5px"
  md: "10px"
  lg: "16px"
  pill: "70px"

spacing:
  xs: "16px"
  sm: "20px"
  md: "24px"
  base: "32px"
  lg: "40px"
  xl: "48px"
  2xl: "96px"
  3xl: "96px"

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.pill}"
    padding: "11.4px 24px"
    height: "44px"
    borderColor: "{colors.primary}"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.pill}"
    padding: "11.4px 24px"
    height: "44px"
    borderColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.pill}"
    padding: "11.4px 24px"
    height: "44px"
    borderColor: "{colors.primary}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    padding: "0px 48px"
    height: "70px"
    borderColor: "{colors.hairline}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    padding: "24px"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "0"
  section-heading:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.heading-lg}"
    padding: "0"
  body-paragraph:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
  eyebrow-label:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow}"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "32px"
    borderColor: "{colors.hairline}"
  dark-band:
    backgroundColor: "{colors.surface-dim}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-md}"
    padding: "48px 32px"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: "2px 10px"
    height: "32px"
    borderColor: "{colors.hairline}"
  pull-quote-block:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.pull-quote}"
    padding: "0"
  stat-metric:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
  highlight-mark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "2px 4px"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    padding: "48px 32px"
---

## Overview

Heap's marketing page runs a two-typeface system where the division follows semantic register rather than type size — a choice that positions the brand as editorial rather than purely technical. **Typeface as register split.** Circular Standard (a geometric sans from Lineto) handles everything structural: display headings, nav links, section subheadings, eyebrow labels in uppercase. Lettera Text (a slightly warmer companion from the same foundry) handles everything expressive: body paragraphs, pull quotes, form labels. The system never mixes them at the same hierarchical level. Where Mixpanel uses a single typeface throughout, and Amplitude uses a geometric for all tiers, Heap achieves tonal depth through font-family switching rather than weight switching.

The brand voltage is mint green (#31d891) — and it never fills a button. The primary CTA carries a 2px mint border on an ink-black body with ink-black text; hover inverts the body to full ink with white text. The mint appears on borders and text marks. This is the opposite of how most analytics brands handle their voltage (Mixpanel uses purple fills on CTAs, Amplitude uses orange backgrounds) — Heap treats the mint as a structural annotation, not a paint bucket.

**Key Characteristics:**
- Mint green (`{colors.primary}` — #31d891) used as border and text-highlight only; ink-black fills the primary CTA body.
- 72px Circular Standard hero h1 at weight 400 with -2.16px letter-spacing — the heaviest display moment uses no extra weight.
- Two-family split: Circular Standard for structure, Lettera Text for prose — divided by semantic role, not type size.
- Pure-white canvas with a single deep-navy dark band (#100841) anchoring the Contentsquare co-brand section.
- Tight 4px card radius across feature modules — the tightest in the analytics peer group.
- Uppercase eyebrow labels at 18px / 700 / 1.8px letter-spacing — Circular Standard in its most compressed form.
- No shadow system; elevation comes entirely from 2px `{colors.hairline}` borders.

## Colors

### Brand Greens

- **Primary** (`{colors.primary}` — #31d891): frequency 34. Used as text (17), border (17), bg (0). The mint is exclusively structural — border voltage and text highlight, never a background. Wired as `--color-green`, `--color-bd-btn`, `--color-mark-bg`.
- **Primary Muted** (`{colors.primary-muted}` — #31a679): frequency 4. Used as text (2), border (2). Mid-tone of the mint family — secondary link states and inline emphasis.
- **Primary Dark** (`{colors.primary-dark}` — #31715f): frequency 5. Used as text (3), border (2). The link color for standard body links (`--color-link`) and success text (`--color-text-success`).
- **Primary Link Hover** (`{colors.primary-link-hover}` — #1b4438): frequency 0. The deep forest-green hover state for links (`--color-link-hover`).

### Ink & Canvas

- **Ink** (`{colors.ink}` — #111111): frequency 719. Used as text (363), border (356). The dominant color on the page — every headline, nav link, body paragraph, card border, and primary button fill. Wired across 11 CSS variables including `--color-text`, `--color-dark`, `--color-accent`, `--color-bd`.
- **Canvas** (`{colors.canvas}` — #ffffff): frequency 391. Used as text (187), bg (15), border (187), gradient (2). The page floor and the inverse-text color on dark surfaces. The extraction merged near-white variants into this token; inputs render the faintest tonal offset against the page floor.

### Dark Surface

- **Surface Dim** (`{colors.surface-dim}` — #100841): frequency 9. Used as background (5), text (2), border (2). The deep-navy band for the Contentsquare acquisition section only — the one dark island on the page. Wired as `--color-bg-dim`.

### Hairlines

- **Hairline** (`{colors.hairline}` — #dfdfdf): frequency 7. Used as border (7). The standard card border (`--color-list-bd`). All feature-section separators use this tone.
- **Hairline Muted** (`{colors.hairline-muted}` — #c4c9ce): frequency 0. Declared as `--color-bd-dim` for disabled or secondary border states.

### Text Mutes

- **Ink Muted** (`{colors.ink-muted}` — #4f525d): frequency 2. Used as text (1), border (1). Mid-level secondary text for supporting captions.
- **Ink Dim** (`{colors.ink-dim}` — #868c95): frequency 1. Used as text (1). The dimmest text tone (`--color-text-dim`). Input placeholder text and meta labels.
- **Placeholder** (`{colors.placeholder}` — #6b707a): frequency 0. Declared as `--color-placeholder-txt` for form inputs.

### Status

- **Error** (`{colors.error}` — #df0134): frequency 0. Declared as `--color-text-critical` for critical error states.
- **Error Dark** (`{colors.error-dark}` — #a80125): frequency 0. Declared as `--color-text-error` for error text.

## Typography

### Font Families

The system runs two proprietary typefaces from Lineto. **Circular Standard** (`--ff-sans-display`) covers the display and navigation register: headlines, nav items, section subheadings, eyebrow labels. **Lettera Text** (`--ff-sans`) covers the prose register: body paragraphs, pull quotes, form labels, captions. The two families share a similar x-height and weight range, so they mix at adjacent sizes without clashing, but Circular Standard's geometric construction reads as structured while Lettera Text's slight warmth reads as editorial. The mono stack (`--ff-mono`: SF Mono, Monaco, Inconsolata, Fira Mono, Source Code Pro) appears in code contexts only.

### Hierarchy

| Token | Family | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|---|
| `{typography.display-xl}` | Circular Standard | 72px | 400 | 70px | -2.16px | Hero h1 |
| `{typography.display-lg}` | Circular Standard | 56px | 400 | 61.6px | -1.68px | Large section headers |
| `{typography.display-md}` | Circular Standard | 48px | 400 | 50px | -1.44px | Section h2 |
| `{typography.heading-lg}` | Circular Standard | 32px | 400 | 40px | -0.96px | Sub-section h2 and h3 |
| `{typography.heading-sm}` | Circular Standard | 20px | 400 | 28px | -0.6px | h3 card headers |
| `{typography.eyebrow}` | Circular Standard | 18px | 700 | 28px | 1.8px | Uppercase eyebrow labels |
| `{typography.nav-link}` | Circular Standard | 16px | 400 | 16px | 0 | Top-nav links and CTA labels |
| `{typography.body-lg}` | Lettera Text | 18px | 400 | 28px | 0 | Primary body prose |
| `{typography.body-md}` | Lettera Text | 16px | 400 | 24px | 0 | Card body text |
| `{typography.body-sm}` | Lettera Text | 14px | 400 | 20px | 0 | Supporting captions |
| `{typography.label-bold}` | Lettera Text | 14px | 700 | 20px | 0 | Form labels |
| `{typography.pull-quote}` | Lettera Text | 20px | 700 | 30px | 0 | Testimonial / stat callouts |
| `{typography.caption}` | Lettera Text | 14px | 400 | 21px | 0 | Fine metadata |

### Principles

Circular Standard carries the structural skeleton at weight 400 throughout — only the eyebrow label goes to 700. The display hierarchy is achieved through size and letter-spacing, not weight: the 72px hero at -2.16px reads as dominant through geometry alone. Lettera Text mirrors this restraint: pull quotes go to 700, everything else stays 400.

### Note on Font Substitutes

Both Circular Standard and Lettera Text are Lineto proprietary faces. For Circular Standard, **Inter** or **DM Sans** are the closest open-source geometric substitutes; for Lettera Text's editorial warmth, **Plus Jakarta Sans** carries a similar character. Preserve the negative letter-spacing values — they are critical to the heading's personality.

## Layout

### Spacing System

- **Base module:** 16px, with 48px as the section-level dominant (21 occurrences).
- **Tokens:** `{spacing.xs}` 16px · `{spacing.sm}` 20px · `{spacing.md}` 24px · `{spacing.base}` 32px · `{spacing.lg}` 40px · `{spacing.xl}` 48px · `{spacing.2xl}` 96px.
- **Section padding (vertical):** 96px (--space-outer-v) for major section breaks; 48px (--space-gutter-v) for internal section padding.
- **Card internal padding:** 32px (`{spacing.base}`) on feature cards; 24px on smaller metric tiles.
- **Nav height:** 70px (--nav-height: 4.375rem).

### Grid & Container

- **Max content width:** 83.75rem / ~1340px (`--maw`).
- **12-column grid:** `--grid: repeat(12, minmax(10px, 1fr))` — standard editorial grid.
- **Feature section:** alternating left/right two-column layouts with product UI screenshots on one side and prose on the other.
- **Metric strip:** 4-stat horizontal row using `{typography.display-md}` for numbers.

### Rhythm

The page is a pure-white editorial surface that breaks exactly once — the Contentsquare dark band. Every other section change is signaled by vertical spacing only (96px gaps) rather than background color. The dark band acts as a single strong punctuation mark: one tonal island in a long white editorial document.

## Elevation

The system has no shadow tokens. Depth comes from two signals only:

- **2px ink-black border** (`{colors.hairline}` and a 2px-wide `{colors.ink}` edge in some contexts): the dominant edge definition across cards and buttons. Not a hairline at 0.5px — the 2px border is deliberately visible.
- **Tonal surface shift:** the white canvas vs. very lightly tinted inputs creates a subtle depth in form contexts — the input background is a near-white shade clustered into `{colors.canvas}` by the extractor.

Heap's mint-bordered buttons are not elevation signals — they are interaction markers. The absence of shadow keeps the page flat and editorial, consistent with a data-analytics product that trusts its charts to provide visual complexity.

## Shapes

The radius scale is **tight-tight**: 4-5px for nearly everything, with a single pill for CTAs:

- `{rounded.none}` 0px — section dividers and flush image panels.
- `{rounded.xs}` 4px (`--bdrs-s: 0.3125rem`) — inputs, small chips, form elements. 9 instances — the dominant radius.
- `{rounded.sm}` 5px — secondary form element rounding.
- `{rounded.md}` 10px (`--bdrs: 0.625rem`) — feature cards and panels. 6 instances.
- `{rounded.lg}` 16px — larger feature panels and the Contentsquare dark block.
- `{rounded.pill}` 70px (`--bdrs-l: 1.25rem`) — the primary CTA button and rounded action chips.

The 4px-dominant scale is the tightest in the analytics-tools peer group. Mixpanel and Amplitude both default to 8-12px; Heap's tight radius gives form elements and cards a data-table precision.

## Components

**`button-primary`** — Ink-black `{colors.ink}` fill, white text, 2px `{colors.primary}` mint border, `{rounded.pill}` 70px radius, 11.4x24 padding, 44px height. The mint border is the only place brand green appears on an interactive element.

**`button-primary-hover`** — Same ink fill, white text, 2px ink border (the mint transitions away on hover). Hover makes the button fully monochrome — the color signal disappears on engagement.

**`button-secondary`** — Transparent fill, ink text, 2px `{colors.primary}` mint border. Used for secondary CTAs — the mint border does double duty as both brand accent and interactive affordance.

**`top-nav`** — White canvas background, 70px height, 0x48 padding. Ink-black nav links at `{typography.nav-link}` (16px / 400). A 2px bottom border in hairline separates it from the hero.

**`hero-heading`** — Transparent background, ink-black text, `{typography.display-xl}` (72px / 400 / -2.16px tracking). The weight-400 constraint at 72px is the single most distinctive token in the system.

**`section-heading`** — Ink-black text, `{typography.heading-lg}` (32px / 400 / -0.96px). Used for "Complete data, automatically," "Spot hidden opportunities," "See problems in action."

**`eyebrow-label`** — Transparent background, ink-black text, `{typography.eyebrow}` (18px / 700 / 1.8px letter-spacing, uppercase). The uppercase-with-tracking style is the visual key for section openers.

**`card`** — White fill, ink-black text, `{rounded.md}` 10px radius, 32px padding, 2px `{colors.hairline}` border. Feature content cards throughout the capability sections.

**`dark-band`** — Deep-navy `{colors.surface-dim}` fill, white text, 48x32 padding. Used exclusively for the Heap + Contentsquare acquisition announcement section.

**`text-input`** — White fill, ink-black text, `{rounded.xs}` 4px radius, 2x10 padding, 32px height, 1px hairline border.

**`highlight-mark`** — Mint-green `{colors.primary}` fill, ink-black text, `{rounded.none}`, 2x4 padding. Used inline as a text marker (the `--color-mark-bg` usage).

**`pull-quote-block`** — Transparent background, `{typography.pull-quote}` (20px / Lettera Text / 700). Used for testimonial excerpts and statistical callouts.

**`footer`** — Ink-black `{colors.ink}` fill, white text, 48x32 padding. The footer inverts the page — dark fill mirrors the Contentsquare band color family.

## Do's and Don'ts

**Do** keep the primary button body ink-black with a mint border. The 2px mint border is carrying the entire brand identity for the button — removing it to use a mint-fill instead breaks the signal pattern the page establishes. If you need a stronger CTA emphasis, increase the border to 3px; don't switch to a mint fill.

**Do** use Circular Standard for display headings and nav, Lettera Text for body prose. The font-family switch at the heading/body boundary is the system's editorial register signal. Mixing — using Circular Standard for body, or Lettera Text for headings — collapses the distinction.

**Do** keep display heading weight at 400 even at 72px. The scale communicates hierarchy, not the weight. Adding bold (700) to the hero h1 converts it from an editorial opening to a typical SaaS shout.

**Do** reserve the dark-navy `{colors.surface-dim}` for exactly one section. The deep-navy band works because it is the single tonal break in a long white page. Using it for multiple sections removes its punctuation function.

**Don't** use `{colors.primary}` (#31d891) as a button background fill. The mint is structurally wired as a border-only token (--color-bd-btn, --color-mark-bg) — it appears 17 times as border and 17 times as text mark, zero times as background fill. A mint button fill would look like a data visualization color accidentally applied to UI.

**Don't** apply the -2.16px letter-spacing below 48px. The tight tracking is calibrated for the 72px hero; at 24px it makes text illegible. Below 32px, letter-spacing should be at 0 or lightly negative (no tighter than -0.5px).

**Don't** add box shadows to cards. The system has no shadow tokens — elevation comes from the 2px hairline border alone. Adding shadows creates a visual depth model that contradicts the flat-editorial page aesthetic.

**Don't** use `{colors.ink-dim}` (#868c95) for secondary headings. It appears once on the page as a declared variable for placeholder text. For secondary text, use `{colors.primary-dark}` (#31715f) when green tint is appropriate, or `{colors.ink-muted}` (#4f525d) for neutral secondary text.

## Known Gaps

- **Mobile typography scale:** the extracted CSS includes responsive font-size variables (--fz-headline-100 through -600 in rem units) but no captured breakpoint values; the mobile type scale is not represented.
- **Dark mode:** the page is light-mode only on the marketing surface; the product app likely carries a dark theme not captured here.
- **Button animation:** the --trs transition token (all 0.3s ease-in-out) is declared but the full hover-state motion matrix is not captured.
- **Form validation states:** error and warning colors are declared in CSS variables (`--color-text-critical`, `--color-text-warning`) but not visible on the marketing surface; error inputs and form feedback UI are not represented.
- **Product UI screenshots:** the feature sections include product UI screenshots with their own color system (dashboards, funnels, journey maps) that is not captured in this marketing-surface extraction.
- **Acquisition-era tokens:** some CSS variables may reflect Contentsquare's design system; the boundary between original Heap tokens and Contentsquare-merged tokens is not determinable from the marketing surface alone.
