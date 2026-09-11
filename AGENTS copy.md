# AGENTS.md — Chaos Computer Club India

## Design System, Architecture Rules & Agent Guidelines

> This file governs all AI agent behavior, design decisions, and code conventions
> for `chaoscomputerclub.in` and all sub-organization domains.
> Inspired by the original [Chaos Computer Club Germany](https://www.ccc.de/).

---

## 1. PROJECT OVERVIEW

**chaoscomputerclub.in** is the parent portfolio website for the Chaos Computer Club India —
a private, student-focused technical organization providing practical, competitive, and
industry-oriented exposure to B.Tech students through offline DSA contests, hackathons,
technical events, and community activities.

### Domain Architecture

```
chaoscomputerclub.in                  ← Parent portfolio (THIS REPO)
│
├── medicaps.chaoscomputerclub.in     ← Medi-Caps University organization
├── ips.chaoscomputerclub.in          ← IPS Academy
├── sgsits.chaoscomputerclub.in       ← SGSITS Indore
└── [org].chaoscomputerclub.in        ← Any university that registers
```

### Phase Plan

- **Phase 1 (this repo):** `chaoscomputerclub.in` — Parent portfolio/landing site only.
  Static HTML/CSS, no backend. Think brand manifesto, not app.
- **Phase 2:** Per-university subdomains — full-stack apps with auth, events, payments, leaderboards.

---

## 2. DESIGN SYSTEM — SOURCED FROM CCC.DE

The visual identity is **directly inspired by** [ccc.de](https://www.ccc.de/).
All design decisions must honor the following tokens extracted from the original CCC CSS source.

### 2.1 Color Palette

```css
/* ─── BRAND COLORS ─────────────────────────────────────────── */
--ccc-orange: #f8921e; /* PRIMARY accent. Nav links, CTAs, highlights */
--ccc-blue-hover: #5b8ca7; /* Link hover state */

/* ─── SEMANTIC SYSTEM COLORS (adaptive light/dark) ────────── */
--bg: Canvas; /* System adaptive background */
--text: CanvasText; /* System adaptive foreground */
--text-muted: color-mix(in srgb, CanvasText, #808080 25%);
--text-dimmer: color-mix(in srgb, CanvasText, #808080 50%);
--text-italic-meta: color-mix(in srgb, CanvasText, #808080); /* dates, author, captions */
--border: color-mix(in srgb, CanvasText, Canvas 60%);
--border-subtle: color-mix(in srgb, CanvasText, Canvas 70%);
--stripe-bg: color-mix(in srgb, CanvasText, Canvas 94%);

/* ─── PAPER / CARD TREATMENT ───────────────────────────────── */
/* Light mode defaults */
--paper-edge: rgba(128, 128, 128, 0.4);
--paper-shadow: 2px 3px 8px rgba(0, 0, 0, 0.25);

/* Dark mode overrides */
--paper-edge-dark: rgba(200, 200, 200, 0.35);
--paper-shadow-dark: 0 0 0 1px rgba(255, 255, 255, 0.06), 4px 6px 16px rgba(0, 0, 0, 0.8);

/* ─── GRAY SCALE ────────────────────────────────────────────── */
--gray-mid: #808080;
--gray-border: #808080; /* Input border, burger stripes */
--gray-meta: rgba(128, 128, 128, 0.95); /* Card metadata text */
```

**Palette Rules:**

- `#F8921E` (orange) is the **only** saturated brand color. Use sparingly but unmistakably.
- All backgrounds, text, and borders must use `Canvas`/`CanvasText` CSS system keywords
  to support automatic light/dark switching.
- No bright blues, greens, or reds except for status/badge semantics.
- Images in sidebar widgets are rendered with `filter: grayscale(1)` — keep interface
  monochromatic, let content speak.

---

### 2.2 Typography

```css
/* ─── FONT STACK ───────────────────────────────────────────── */
/* Body: old-school web-safe stack — functional, not decorative */
font-family: Verdana, Helvetica, Arial, sans-serif;

/* Headings: slightly more modern sans */
font-family: Helvetica, Arial, sans-serif;

/* Italic / meta text: old-school serif for contrast */
font-family: Georgia, serif;
```

**Size Scale:**

| Role                   | Size     | Line-height |
| ---------------------- | -------- | ----------- |
| Body                   | ~16px    | `1.6rem`    |
| `h1`                   | `1.5em`  | `1.2`       |
| `h2`                   | `1.5rem` | `1.75rem`   |
| `h2` (sidebar)         | `1.1em`  | —           |
| `h2` (sidebar desktop) | `1rem`   | —           |
| `h3`                   | `1.3rem` | —           |
| `h4`                   | `1.0rem` | —           |
| Body list items        | —        | `1.5rem`    |
| Nav items (desktop)    | —        | `1.45em`    |
| Left column links      | `0.8rem` | —           |
| Sidebar widget lists   | `0.9rem` | `1.5em`     |
| Caption / meta         | `0.9rem` | —           |
| Card meta              | `0.85em` | —           |
| Light-mode toggle      | `25px`   | —           |

**Typography Rules:**

- `hyphens: auto` on all headings and body.
- `word-wrap: anywhere` on all headings.
- No custom web fonts by default. CCC Germany doesn't use Google Fonts.
- For CCC India, if a custom font is introduced (e.g. for modern appeal),
  it must be **monospace or geometric sans** (suggestions: `JetBrains Mono`, `IBM Plex Mono`, `Space Grotesk`).
  Never use decorative or script fonts.

---

### 2.3 Layout Geometry

```css
/* ─── PAGE LATTICE (desktop, 909px fixed grid) ─────────────── */
--page-width: 909px; /* Total page width; center on viewport */
--header-height: 145px; /* Header image height */

/* Column widths */
--left-col-width: 135px; /* + 50px padding-right = 185px total */
--left-col-pad: 50px;
--center-left: 200px; /* Offset from page left */
--center-width: 490px;
--right-left: 690px; /* = center-left + center-width */
--right-width: 155px; /* + 55px padding-left = 210px total */
--right-pad: 55px;

/* Utility positions */
--search-left: 676px;
--toggle-left: 816px;
--burger-right: 54px;
```

**Breakpoints:**

- `max-width: 1015px` → Mobile/tablet layout (fluid, stacked columns)
- `min-width: 1016px` → Desktop layout (fixed `909px` centered grid)

**Spacing:**

- `margin-block-start/end` on `li`: `1rem`
- `li` line-height: `1.5rem`
- Article partial margin-bottom: `30px`
- Center column padding-bottom: `40px`
- Mobile center column padding: `0 15px 40px 15px`

---

### 2.4 Border & Radius

```css
/* ─── RADII ─────────────────────────────────────────────────── */
--radius-input: 5px; /* Search input border-radius */
--radius-card: 4px; /* Article thumbnails, chapter thumbnails */
--radius-stripe: 6px; /* Alternating row highlight */
--radius-burger: 2px; /* Burger menu bar spans */
```

**Border Rules:**

- Borders use `1px solid var(--border)` or `color-mix(in srgb, CanvasText, Canvas 60%)`.
- Separating borders between articles: `1px solid var(--border-subtle)` = `Canvas 70%` mix.
- Asset credits separator: `dotted 1px`.
- No thick borders, no colored borders except orange accent.

---

### 2.5 Shadows

```css
/* Card / document thumbnail shadows */
box-shadow: var(--paper-shadow);
/* Light: 2px 3px 8px rgba(0,0,0,0.25) */
/* Dark:  0 0 0 1px rgba(255,255,255,0.06), 4px 6px 16px rgba(0,0,0,0.8) */
```

---

### 2.6 Navigation Patterns

- **Desktop:** Right-aligned vertical list in fixed left column, `1.45em` line-height.
- **Mobile:** Inline horizontal list with `•` bullet separators, animated slide-down from off-screen.
- **Active link:** Prefixed with `▸` character, colored `CanvasText` (not orange).
- **Inactive link:** `color-mix(in srgb, CanvasText, #808080 25%)` — subtle, readable.
- **Hover:** `color-mix(in srgb, CanvasText, #808080 50%)` — slightly more visible.
- All nav links: `text-decoration: none`.

**Burger Menu (Mobile CSS-only checkbox hack):**

```css
/* Three spans, each: width 26px, height 4px, border-radius 2px */
/* Transitions: transform 0.5s ease-in-out, opacity 0.5s ease-in-out */
/* Open: span[1] → translateY(10px) rotate(45deg) */
/*        span[2] → opacity 0 */
/*        span[3] → translateY(-10px) rotate(-45deg) */
```

**Menu open/close animation:**

```css
transition:
  max-height 0.2s ease-in-out,
  transform 0.4s ease-in-out,
  opacity 0.4s ease;
/* Closed: translateY(-200px), max-height: 0, opacity: 0 */
/* Open:   translateY(0), max-height: 400px, opacity: 1 */
```

---

### 2.7 Light/Dark Mode

CCC uses the **OS-level `prefers-color-scheme`** with a **CSS checkbox toggle override**.

```css
color-scheme: light dark; /* declared on body */

/* Toggle button: emoji-based sun/moon */
/* In light mode: button shows 🌙 (click to go dark) */
/* In dark mode:  button shows ☀️ (click to go light) */
```

- Header images and left column background image use `filter: invert(50%)` in dark mode.
- Paper/card shadows become dramatically stronger in dark mode.
- Toggle state persisted to `localStorage` key `'override-prefers-color-scheme'`.

---

### 2.8 Component Patterns

#### Article Cards

```css
.article_thumbnail img {
  width: 116px;
  border-radius: 4px;
  border: 1px solid var(--paper-edge);
  box-shadow: var(--paper-shadow);
  object-fit: cover;
}
/* Float right within article partial */
```

#### Alternating Row Stripes

```css
.date_and_title_partial:nth-child(odd) {
  background-color: color-mix(in srgb, CanvasText, Canvas 94%);
  border-radius: 6px;
}
```

#### Sidebar Widget Headings

```css
border-bottom: 1px solid color-mix(in srgb, CanvasText, Canvas 60%);
font-size: 1.1em; /* desktop: 1rem */
```

#### Search Input

```css
width: 132px;
height: 25px;
border: solid #808080 1px;
border-radius: 5px;
background-color: Canvas;
text-indent: 0.5rem;
```

#### Tag Cloud

```css
display: flex;
flex-wrap: wrap;
gap: 0.2rem 0.9rem;
```

#### Featured Articles Gallery

```css
display: flex;
flex-wrap: wrap;
gap: 10px;
align-items: center;
/* Images: filter: grayscale(1), opacity: 0.85 → 1 on hover */
```

---

## 3. FILE & FOLDER CONVENTIONS

```
chaoscomputerclub.in/
├── AGENTS.md              ← This file
├── index.html             ← Homepage
├── stylesheets/
│   └── style.css          ← Single CSS file, no preprocessors
├── images/
│   ├── header.png         ← Full-width header graphic (909px wide)
│   ├── left_column.png    ← Left column background continuation
│   ├── logo.svg           ← CCC India logo
│   └── social_default.png ← OG image (1200×630px)
├── javascripts/
│   └── main.js            ← Minimal JS only
└── favicon.ico
```

**Naming Rules:**

- All filenames: `snake_case.ext`
- CSS custom properties: `--ccc-kebab-case`
- HTML IDs/classes: `snake_case` (matching CCC Germany's conventions)
- No TypeScript, no build tools, no frameworks in Phase 1

---

## 4. HTML CONVENTIONS

### Page Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Chaos Computer Club India | [Page Title]</title>
    <link rel="stylesheet" href="/stylesheets/style.css" />
  </head>
  <body>
    <div id="wrapper">
      <div id="header">...</div>
      <div id="toolbox">
        <div id="search">...</div>
        <div id="light-mode-div">...</div>
        <div id="burger-div">...</div>
      </div>
      <div id="left_column">
        <div class="main_navigation">...</div>
      </div>
      <div id="center_column">...</div>
      <div id="right_column">...</div>
    </div>
  </body>
</html>
```

### SEO Requirements (every page)

- `<title>`: Format `Chaos Computer Club India | [Page Name]`
- `<meta name="description">`: max 160 chars
- `<meta property="og:*">`: all OpenGraph tags required
- `<meta property="twitter:card" content="summary_large_image"/>`
- `<link rel="canonical" href="..."/>`
- Single `<h1>` per page

---

## 5. CSS AUTHORING RULES

1. **Single CSS file** — `stylesheets/style.css`. No inline styles.
2. **No utility classes** — All styles are semantic component selectors.
3. **Sections annotated** with block-comment banners:
   ```css
   /* ====================================================
      SECTION NAME
      ==================================================== */
   ```
4. **Custom properties first** — all `--tokens` defined in `:root {}` at file top.
5. **Desktop-first** — use `max-width: 1015px` for mobile overrides, `min-width: 1016px` for desktop.
6. **`color-mix()` for adaptive colors** — never hardcode grays.
7. **No `!important`** except where CCC source requires it.
8. **Transitions:** `0.2s–0.5s ease` or `ease-in-out`. No bounce/spring animations.
9. **Images:** `max-width: 100%` always.

---

## 6. JAVASCRIPT CONVENTIONS

- **Minimal JS only** for Phase 1 (light/dark mode toggle persistence).
- Mobile burger menu is pure CSS checkbox hack — no JS.
- No jQuery, no React, no build step.

```js
// Light mode toggle — runs before first paint
document.addEventListener("DOMContentLoaded", function () {
  try {
    if (localStorage.getItem("override-prefers-color-scheme"))
      document.getElementById("light-mode").checked = true;
  } catch (e) {}
});
```

---

## 7. CONTENT ARCHITECTURE (Phase 1 — Portfolio)

### Navigation Structure

```
home
About
Universities    ← list of registered org subdomains
Events          ← upcoming events (static)
Blog / Updates
Contact
```

### Homepage Sections

1. **Header** — Full-width graphic with CCC India wordmark
2. **Mission Statement** — "Learn. Compete. Build. Connect." tagline
3. **What is CCC India** — Short manifesto paragraph
4. **Event Highlights** — 3 upcoming featured events (static)
5. **University Organizations** — Grid of registered orgs with subdomain links
6. **About the Club** — Short bio, founding story, values
7. **Join / Contact** — Email / social links

---

## 8. BRAND VOICE & COPY

- **Tone:** Authoritative, technical, direct. Not corporate-friendly, not casual.
- **Language:** English (parent site). Org subdomains may use regional languages.
- **Tagline:** `Learn. Compete. Build. Connect.`
- **Descriptor:** "India's offline competitive tech community for college students"
- **Avoid:** Marketing buzzwords ("innovative", "world-class", "cutting-edge")
- **Prefer:** Specific and honest ("DSA contests", "offline hackathons", "B.Tech students")

---

## 9. AGENT BEHAVIOR RULES

When an AI agent works in this repository:

### Design Fidelity

- **Always respect the CCC.de color palette** (Section 2.1).
- **Orange (`#F8921E`) is sacred** — do not replace with another color.
- **Do not introduce new fonts** without explicit user approval.
- **Do not use CSS frameworks** (Bootstrap, Tailwind, etc.) in Phase 1.

### Code Quality

- All HTML must be semantic (`<nav>`, `<main>`, `<article>`, `<section>`, etc.).
- All interactive elements must have unique, descriptive `id` attributes.
- CSS custom properties must be declared before use.

### File Management

- Do not create files outside the defined folder structure without asking.
- Images generated for the site must be placed in `images/`.

### Scope Boundaries

- Phase 1 is **static only**. No server-side logic, databases, or auth.
- Payment gateway, QR, leaderboard, and student-profile features are **Phase 2** scoped
  to `[org].chaoscomputerclub.in`, not this repo.

### When In Doubt

- Ask the user before making opinionated architectural decisions.
- Default to mimicking the CCC Germany design pattern.
- Prefer boring, proven solutions over clever ones.

---

## 10. INSPIRATION REFERENCE

| Source           | URL                             | What to copy                        |
| ---------------- | ------------------------------- | ----------------------------------- |
| CCC Germany      | https://www.ccc.de/             | Color, layout, typography, geometry |
| CCC Events page  | https://www.ccc.de/calendar     | Event listing pattern               |
| CCC Publications | https://www.ccc.de/publications | Article card pattern                |

---

## 11. QUICK REFERENCE CHEATSHEET

```
BRAND COLOR:       #F8921E  (orange)
HOVER COLOR:       #5b8ca7  (steel blue)
FONT BODY:         Verdana, Helvetica, Arial, sans-serif
FONT HEADING:      Helvetica, Arial, sans-serif
FONT META:         Georgia, serif
PAGE WIDTH:        909px  (desktop fixed)
BREAKPOINT:        1016px (mobile ≤ 1015px)
LEFT COL:          135px + 50px pad = 185px
CENTER COL:        490px at left 200px
RIGHT COL:         155px + 55px pad at left 690px
BORDER:            1px solid color-mix(in srgb, CanvasText, Canvas 60%)
BORDER-RADIUS:     4px (cards), 5px (inputs), 6px (stripes)
SHADOW LIGHT:      2px 3px 8px rgba(0,0,0,0.25)
SHADOW DARK:       0 0 0 1px rgba(255,255,255,0.06), 4px 6px 16px rgba(0,0,0,0.8)
TRANSITION:        0.3s–0.5s ease / ease-in-out
```

---

_Last updated: 2026-09-10. Maintained by the CCC India core team._
_Design system sourced from live analysis of https://www.ccc.de/stylesheets/ccc.css_
