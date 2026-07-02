---
target: Home
total_score: 32
p0_count: 0
p1_count: 2
timestamp: 2026-07-02T10-18-33Z
slug: app-portal-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav + hover feedback good; likely hydration flash from client-time greeting |
| 2 | Match System / Real World | 4 | Fluent Italian, "la tua orbita" metaphor lands, natural order |
| 3 | User Control and Freedom | 3 | Little to control on Home; nav escape always present |
| 4 | Consistency and Standards | 4 | Cohesive with the design system; icon chips now consistent |
| 5 | Error Prevention | 3 | n/a — no destructive actions on Home |
| 6 | Recognition Rather Than Recall | 3 | Orbit interactivity relies on hint copy; stat tiles look actionable but aren't |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; tabbing 24 orbit avatars to reach the feed is tedious |
| 8 | Aesthetic and Minimalist Design | 4 | Genuinely distinctive, uncluttered, on-brand |
| 9 | Error Recovery | 3 | n/a — no error states on Home |
| 10 | Help and Documentation | 3 | Good inline hint ("passa sopra un avatar"); no broader help |
| **Total** | | **32/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**Does this look AI-generated? No.**

**LLM assessment**: This passes both the general slop test and the stricter product slop test. The orbit is a real signature — a distinctive, purposeful centerpiece, not a generic hero. Restraint is intentional (dark canvas, one accent), the type is one disciplined family, and after the recent polish the icon-chip vocabulary is consistent across stats/events/docs. No gradient text, no glassmorphism, no eyebrow scaffolding, no identical card grid. The one borderline pattern is the four-up stat row (count + label + accent icon), which flirts with the hero-metric template — saved here only by being a supporting glance below the orbit rather than the headline.

**Deterministic scan**: `detect.mjs` returned `[]` (exit 0) across `page.tsx`, `OrbitSystem.tsx`, `Stat.tsx`, and `AnnouncementCard.tsx`. Zero findings — clean.

**Visual overlays**: No live in-page overlay was injected. Visual evidence came from full-page screenshots (Home top + scrolled) in a real browser at localhost:3000 instead.

## Overall Impression

The Home is genuinely good and unmistakably Orbitae — the orbit does exactly what the North Star promises, making the network the first thing you feel. The single biggest opportunity isn't aesthetic, it's **information architecture**: the orbit is so tall that the actionable content (bacheca, events) lives entirely below the fold on a laptop, and the orbit's core interaction is mouse-hover-only, so touch and keyboard users get a lesser Home.

## What's Working

1. **The orbit as signature.** Rotating members around the lit core is a distinctive, emotionally right anchor that no template would produce. The counter-rotation keeping avatars upright, the pause-on-hover, and the reduced-motion static constellation are all considered craft.
2. **Cohesive restraint.** One accent, flat tonal surfaces, one type family. The recent icon-chip pass unified stats/events/docs into one visual language.
3. **Fluent, warm copy.** The time-aware greeting and "Ecco la tua orbita" make it feel personal without being cute.

## Priority Issues

- **[P1] Actionable content is below the fold.** The hero + orbit occupy the full viewport height; on a 1456×839 laptop you must scroll ~6 ticks before any stat or bacheca post appears. For a returning member, "what's new" is the job — and it's buried under the spectacle.
  - **Why it matters**: The Home's utility (latest announcements, next events) is invisible on load; the page reads as a screensaver until you scroll.
  - **Fix**: Constrain the orbit's max height (e.g. cap at ~56–64vh), tighten the top hero spacing, or move a compact "latest post + next event" strip above/beside the orbit. Keep the orbit hero but let one line of live content peek above the fold.
  - **Suggested command**: `$impeccable layout`

- **[P1] Orbit interaction is desktop-hover-only.** Discovery depends on hovering ("passa sopra un avatar per scoprirli"), which doesn't exist on touch, and tabbing through 24 avatars to reach content is punishing for keyboard users. On mobile a tap jumps straight to a profile with no "discover" step.
  - **Why it matters**: Casey (mobile) and Sam (keyboard/AT) get a degraded core experience on the most-visited page.
  - **Fix**: Give avatars a visible affordance (subtle ring/cursor) and a touch path (tap = reveal label, second tap = open). Add a "salta al contenuto" skip link past the orbit for keyboard users; consider making the orbit `aria`-summarized.
  - **Suggested command**: `$impeccable adapt` (then `$impeccable harden`)

- **[P2] Stat tiles look actionable but aren't, and carry no path or trend.** Four counts (22 / 3 / 4 / 6) with accent icons read as clickable cards but do nothing; they're the closest thing to the hero-metric cliché on the page.
  - **Why it matters**: Recognition/efficiency — users click and nothing happens; the numbers inform but don't lead anywhere.
  - **Fix**: Either make each tile a link to its section (Membri/Bacheca/Documenti) with a hover cue, or demote them to a single quiet inline summary line and give the space back to the feed.
  - **Suggested command**: `$impeccable layout`

- **[P2] The "Dalla bacheca" feed has no empty state.** Events render "Nessun evento in programma," but the announcements column (`announcements.slice(0,3)`) shows only a heading + "Vedi tutti" when empty.
  - **Why it matters**: Riley (edge cases) / a brand-new club with no posts sees a bald, broken-looking column.
  - **Fix**: Mirror the events empty state — a one-line "Ancora nessun annuncio" card.
  - **Suggested command**: `$impeccable harden`

- **[P2] Client-time greeting risks a hydration mismatch; avatar-initial contrast is uneven.** `greeting()` calls `new Date().getHours()` during render, a classic SSR/client hydration-warning source (plausibly the "1 Issue" the Next dev indicator showed on this page). Separately, white initials on the lighter orange shades of the avatar ramp likely fall below 4.5:1.
  - **Why it matters**: Visibility/consistency (a dev warning that can flash), and a WCAG AA gap for Sam.
  - **Fix**: Compute the greeting after mount (or accept a stable default on the server), and darken the light end of the avatar ramp (or the initials weight/shadow) to clear AA. Initials are `aria-hidden`, so this is cosmetic contrast, not a blocker.
  - **Suggested command**: `$impeccable audit`

## Persona Red Flags

**Alex (Power User)**: No keyboard shortcuts; no way to jump straight to the feed or a member. Must scroll past the orbit every visit. The orbit is beautiful but slows a repeat visitor who just wants "what's new."

**Sam (Accessibility)**: Tab order runs through ~24 orbit avatar buttons before reaching the bacheca/events — no skip link. Discovery labels appear on hover/focus, but reaching them by keyboard is a long march. White-on-light-orange initials likely miss 4.5:1 (mitigated by `aria-hidden`).

**Casey (Distracted Mobile)**: The orbit's "hover to discover" doesn't exist on touch; a tap navigates away immediately. The whole first screen is the orbit, so the useful content (next event, latest post) requires scrolling one-handed past a tall animated block.

## Minor Observations

- The pinned announcement's soft red border reads well and earns the accent; good use of the One Voice rule.
- Stat numbers now use `tabular-nums` — nice; extend that to any future count/date figures.
- The orbit's ambient core glow is a strong addition but sits very close to the inner ring avatars at narrow widths; verify it doesn't wash out initials on small screens.
- "Vedi tutti" on the feed is good; the events panel lacks an equivalent link to `/bacheca`-style full view (there's no `/eventi` route yet).

## Questions to Consider

- What if one line of live content (next event, newest post) peeked above the fold, with the orbit as the backdrop rather than the whole first screen?
- Does the orbit need all 24 members on the Home, or would the inner rings + a "+N" convey the network faster and shorten the page?
- What would the keyboard-first version of "discover a member" look like — a searchable list that the orbit visualizes, rather than the orbit being the only way in?
