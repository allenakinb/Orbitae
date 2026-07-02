---
name: Orbitae
description: The private member portal for an invite-only business conversation club — a dark observatory with the network in orbit.
colors:
  bg: "#0a0a0a"
  surface: "oklch(0.176 0.006 35)"
  surface-2: "oklch(0.214 0.008 35)"
  elevated: "oklch(0.246 0.009 35)"
  border: "oklch(0.32 0.012 35)"
  border-strong: "oklch(0.42 0.016 35)"
  ink: "oklch(0.971 0.003 60)"
  ink-muted: "oklch(0.748 0.008 45)"
  ink-faint: "oklch(0.6 0.01 40)"
  accent: "oklch(0.621 0.208 35)"
  accent-hover: "oklch(0.671 0.196 36)"
  accent-press: "oklch(0.566 0.2 34)"
  accent-ink: "oklch(0.99 0.01 50)"
  active: "oklch(0.74 0.15 150)"
  suspended: "oklch(0.8 0.15 80)"
  expired: "oklch(0.62 0.02 40)"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.04em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
    fontFeature: "'ss01', 'cv01'"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  pill: "9999px"
spacing:
  tight: "12px"
  card: "20px"
  section: "24px"
  gutter: "20px"
  gutter-lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
  button-primary-active:
    backgroundColor: "{colors.accent-press}"
    textColor: "{colors.accent-ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 20px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 14px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-status:
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  nav-item-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: Orbitae

## 1. Overview

**Creative North Star: "The Private Observatory"**

Orbitae is a dark sky with the network suspended in it. You enter a near-black
canvas and the members are bodies in orbit around the central mark — the whole
product is built to make you feel you are looking at something rare, from a
quiet and privileged vantage point. The instrument is precise; the mood is
composed. There is no clutter between you and the constellation of people you
came to see.

The system is **restrained by conviction, not by timidity**. A single decisive
red — Orbit Red — is the only chromatic voice, and it is spent sparingly: the
mark, the active state, the primary action, a hovered member's glow. Everything
else is a graphite-to-white grayscale, tinted a hair warm toward the red's own
hue so the darkness reads as intentional rather than default. Surfaces are flat
and layered by tone, never by heavy shadow. Space is generous. Motion is slow
and orbital, honored down to a static layout when a member prefers reduced
motion.

This explicitly **rejects the generic SaaS dashboard** (no hero-metric template,
no endless identical card grids, no Linear/Notion chrome), the **corporate
intranet** (nothing gray, cluttered, or utilitarian), the **crypto/web3 "exclusive
club" hype** (no neon gradients, no glassmorphism, no gold-foil theatrics), and
the **loud consumer social app** (no gamified badges, no emoji-feed energy).
Exclusivity here is earned through restraint, never announced.

**Key Characteristics:**
- Near-black canvas (`#0a0a0a`) with warm-tinted tonal surface layering.
- One accent — Orbit Red — used on ≤10% of any screen.
- Bold grotesque display (Archivo 800) against calm, readable body text.
- Flat surfaces; depth is tonal, and the red glow is the only "elevation."
- Considered orbital motion, fully reduced-motion aware.

## 2. Colors

A graphite-to-white grayscale warmed subtly toward red (hue ~35–45), lit by a
single vivid Orbit Red and three functional status hues.

### Primary
- **Orbit Red** (`oklch(0.621 0.208 35)`): The one voice. The logo mark, the
  primary button, the active nav rail and pill, the pending state, hovered-avatar
  glow, focus rings, and text selection. Its hover (`oklch(0.671 0.196 36)`) and
  press (`oklch(0.566 0.2 34)`) shades handle interaction; a 14%-alpha
  `accent-soft` fills active nav items and soft badges. **Never** used as a large
  fill or a background wash.

### Neutral
- **Void** (`#0a0a0a`): The body canvas and the recessed input well. The sky.
- **Surface** (`oklch(0.176 0.006 35)`): Cards, the sidebar member panel, the
  events list — the first tonal step up from the void.
- **Surface-2** (`oklch(0.214 0.008 35)`): Hovered nav items, small chips, the
  "Presto" tag — the second step.
- **Elevated** (`oklch(0.246 0.009 35)`): The highest resting tone, used for
  floating labels (the orbit hover tooltip).
- **Border** (`oklch(0.32 0.012 35)`): Hairline dividers and card outlines.
- **Border-strong** (`oklch(0.42 0.016 35)`): Outline-button strokes and hover
  emphasis on borders.
- **Ink** (`oklch(0.971 0.003 60)`): Primary text and headings.
- **Ink-muted** (`oklch(0.748 0.008 45)`): Secondary text, labels, inactive nav.
- **Ink-faint** (`oklch(0.6 0.01 40)`): Hints, placeholders, disabled nav, meta.

### Tertiary (functional status)
- **Active Green** (`oklch(0.74 0.15 150)`): Member status "Attivo."
- **Suspended Amber** (`oklch(0.8 0.15 80)`): Member status "Sospeso."
- **Expired Gray** (`oklch(0.62 0.02 40)`): Member status "Scaduto" (paired with
  muted ink text, never carrying meaning by color alone).

### Named Rules
**The One Voice Rule.** Orbit Red appears on no more than ~10% of any screen. Its
rarity is the entire point — the moment red becomes common, the observatory
becomes a dashboard.

**The Warm-Graphite Rule.** Neutrals are never pure gray. Every surface and ink
tone carries a trace of chroma toward the red's hue (35–60). The darkness is a
warmed graphite, tuned to the brand — not a cool default black.

## 3. Typography

**Display Font:** Archivo (with `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Archivo (same family, lighter weights)
**Label/Mono Font:** none — one family, many weights

**Character:** A single grotesque family worked hard across its weight range.
Headings ride at 800–900 with tight tracking for a confident, structural voice
that echoes the wordmark; body settles to 400 with `ss01`/`cv01` stylistic sets
for a calm, legible read. One family, disciplined — no decorative pairing.

### Hierarchy
- **Wordmark** (900, `1.875rem`, `+0.04em`, UPPERCASE): The Orbitae lockup only.
  The one place letters open up with positive tracking.
- **Display** (800, `clamp(1.75rem, 4vw, 2.25rem)`, line-height 1.1, `-0.02em`):
  Page and section titles (`.font-display`), the Home greeting name. `text-wrap:
  balance` on.
- **Title** (800, `1.125rem`, `-0.01em`): In-page section headings ("Dalla
  bacheca", "Prossimi eventi").
- **Body** (400, `0.875rem`, line-height ~1.55): Default running text and
  descriptions. Cap prose measure at 65–75ch (`max-w-prose`).
- **Label** (600, `0.75rem`, `+0.02em`): Field labels, badges, meta rows;
  uppercase only for the small "Presto"/status micro-tags.

### Named Rules
**The Tracking Floor Rule.** Display tracking never goes below `-0.02em`. The
letters stay open; "designed" is not the same as "cramped."

**The One Family Rule.** Archivo carries the whole system through weight, not
through a second typeface. Do not introduce a serif or a mono for contrast.

## 4. Elevation

Flat by conviction. Surfaces are distinguished by **tone**, not shadow — the
void, surface, surface-2, and elevated steps do the work a drop shadow would do
elsewhere. There is no ambient card shadow, no lifted panels. The only "shadow"
in the system is the **Orbit Red glow**, and it is a response to state (a primary
button, a hovered member), never decoration at rest.

### Shadow Vocabulary
- **Accent glow — button** (`box-shadow: 0 6px 20px -8px var(--color-accent-glow)`;
  hover `0 8px 26px -8px`): The primary button's warm bloom, deepening on hover.
- **Accent glow — orbit** (`box-shadow: 0 0 0 3px var(--color-bg), 0 0 22px -2px
  var(--color-accent-glow)`): A hovered/focused member avatar, ringed against the
  sky and lit from within.
- **Tooltip lift** (`shadow-xl`): The only conventional shadow, reserved for the
  floating orbit label that sits above the rotating rings.

### Named Rules
**The Glow-Not-Shadow Rule.** Depth is tone; emphasis is the red glow. If an
element needs to feel raised, it earns Orbit Red light, not a gray drop shadow.
A gray box-shadow on a card is prohibited.

## 5. Components

The overall feel is **refined and restrained**: tight radii, hairline borders,
one accent, nothing loud. Interactions are quick (150ms) and eased with
`ease-out-quart`.

### Buttons
- **Shape:** Gently curved (10px, `--radius`). Height 44px (`md`) / 36px (`sm`).
- **Primary:** Orbit Red fill, `accent-ink` text, semibold, carrying the accent
  glow. Padding `0 20px`.
- **Hover / Focus:** Fill shifts to `accent-hover`, glow deepens; active drops to
  `accent-press`. `:focus-visible` is a 2px Orbit Red outline offset 2px.
- **Outline:** Transparent with a `border-strong` stroke; on hover the border and
  text both turn Orbit Red. Used for secondary actions.
- **Ghost:** No border; `ink-muted` text that brightens to `ink` on a `surface-2`
  wash. Used for low-emphasis and icon actions.

### Chips / Badges
- **Status badge:** Full pill, `xs` semibold, a colored dot + label on a
  soft-tinted fill of the status hue (active/suspended/expired/pending). Status
  is always dot **and** word — never color alone.
- **Role badge:** Full pill. Admin = `accent-soft` fill with `accent-hover` text;
  staff = `border-strong` outline; member = hairline border with `ink-muted`.
- **"Presto" tag:** Tiny uppercase micro-label on `surface-2`, `ink-faint`.

### Cards / Containers
- **Corner Style:** 14px (`--radius-lg`); the login card steps up to 18px (`xl`).
- **Background:** `surface` on the void.
- **Shadow Strategy:** None — flat, per the Glow-Not-Shadow Rule.
- **Border:** A single hairline `border`, all four sides. Never a colored
  side-stripe.
- **Internal Padding:** 12–24px (`p-3` to `p-6`) by density. Nested cards are
  prohibited.

### Inputs / Fields
- **Style:** Recessed — a translucent Void well (`bg/40`) inside a `border`
  hairline, 10px radius, 44px tall. Placeholders in `ink-faint`. Labels sit above
  in `ink-muted` semibold.
- **Focus:** Border turns Orbit Red with a 2px `accent-soft` ring (no glow).
- **Select:** Same well with an inline chevron SVG tinted to the muted ink.

### Navigation (Sidebar)
- **Style:** A 268px left rail on `bg`, hairline-separated. Items are `ink-muted`
  medium at 10–12px radius.
- **States:** Active = `accent-soft` wash, `ink` text, Orbit Red icon, and a 3px
  Orbit Red rail nub at the left edge. Hover = `surface-2` wash. Disabled
  ("Presto") = `ink-faint`, no interaction.
- **Mobile:** Collapses to a top bar with a menu button opening a left drawer
  (max 300px) over a blurred scrim; body scroll locks while open.

### The Orbit (signature)
The Home centerpiece: members placed on 2–3 concentric rings that rotate at
different speeds and directions around the central mark, each avatar
counter-rotated to stay upright. Faint hairline guide rings mark the orbits.
Hover/focus pauses all rings, enlarges the avatar (scale 1.16), lights it with
the accent glow, and raises a floating `elevated` label with name, role, and
sector. Under `prefers-reduced-motion` the rings do not spin — members render as
a static, evenly distributed constellation. This is the brand; treat it as the
most protected surface in the system.

## 6. Do's and Don'ts

### Do:
- **Do** keep Orbit Red to ≤10% of any screen (The One Voice Rule) — the mark,
  the active state, the primary action, a hovered member.
- **Do** convey depth with tone (void → surface → surface-2 → elevated) and
  emphasis with the Orbit Red glow, never a gray drop shadow.
- **Do** warm every neutral a trace toward hue 35–60; keep the darkness
  intentional, not a cool default black.
- **Do** carry status as dot **and** label together, so meaning never depends on
  color alone (WCAG AA).
- **Do** honor `prefers-reduced-motion` everywhere — the orbit and any future
  motion must have a static, fully-legible fallback.
- **Do** hold body text to ≥4.5:1; watch `ink-faint` placeholders and `ink-muted`
  on `surface`.

### Don't:
- **Don't** build the generic SaaS dashboard: no big-number hero-metric template,
  no endless identical icon+heading+text card grids, no Linear/Notion chrome.
- **Don't** drift into the corporate intranet: nothing gray, cluttered, or
  form-heavy for its own sake. This is a club, not an HR tool.
- **Don't** reach for crypto/web3 "exclusive club" hype: no neon gradients, no
  glassmorphism as decoration, no gold-foil token theatrics.
- **Don't** add loud consumer-social energy: no gamified notification badges, no
  emoji-feed styling.
- **Don't** put a colored `border-left`/`border-right` stripe on cards, list
  items, or alerts — use full hairline borders or soft tinted fills.
- **Don't** apply a gray `box-shadow` to a card, or over-round it; cards live at
  14–18px, never 24px+.
- **Don't** tighten display tracking past `-0.02em`, and don't introduce a second
  typeface — Archivo carries the system through weight alone.
