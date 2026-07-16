# Product

## Register

product

## Users

Members of **Orbitae**, an invite-only business conversation club, plus the
handful of people who run it. Everyone sees everything; the difference is who
may change it.

Every member carries one public **label**, taken from the club's own contact
lists — it says what someone is to the club, never what they may do:

- **Founder** — one of the eight who started Orbitae.
- **Ambassador** — brings people into the network.
- **Member** — a vetted member.

A member comes to see who else is in the network, re-read the conversation
recaps, and keep their own profile current. Not a power user; visits
occasionally, on desktop or phone, and expects the club to feel as considered
online as it does in person.

Behind the labels, three accounts hold **admin** access: they publish events
and recaps, set labels and status, and edit any profile. Admin is unlabelled —
the only outward sign is the Admin page in the menu. Needs control without a
heavy back-office.

The interface is **Italian**. Access is invite-only — there is no public
signup, and the product should never feel like a place you could stumble into.

## Product Purpose

Orbitae is the private home of the club between real-world encounters. It
answers "who was in the room, and what did we say?" The signature is the Home
**orbit**: pick an evening from the selector and the people who actually
attended it revolve around its subject, making the network itself the first
thing you see and feel. Success is a member opening the portal and immediately
sensing belonging to something selective, then finding the person, recap, or
document they came for without friction.

It is a focused club portal, not a platform: five surfaces (Home, Membri,
Bacheca, Documenti, Admin), each doing one thing well. The UI never talks to a
backend directly — all data flows through a single `Repo` seam, so the demo and
a future Supabase deployment share the same screens.

## Brand Personality

**Exclusive, confident, composed.** The feeling on entry is quiet power — you
belong to something selective, and the product carries itself accordingly.
Voice is assured and unhurried, never salesy or eager. Italian copy is warm but
precise. Restraint signals status: dark canvas, a single decisive red accent,
generous space, motion that feels considered rather than flashy. Nothing
shouts; the confidence is in what's left out.

## Anti-references

Chosen to protect the exclusive-and-confident feel:

- **Generic SaaS dashboard.** No Linear/Notion-clone chrome, no big-number
  "hero metric" template, no endless identical icon+heading+text card grids.
  The quick stats are a supporting glance, not the headline.
- **Corporate intranet.** No dated SharePoint-style portal: gray, cluttered,
  utilitarian, form-heavy. This is a club, not an HR tool.
- **Crypto / web3 "exclusive club" hype.** No neon gradients, no glassmorphism,
  no gold-foil token-gated theatrics. Exclusivity is earned through restraint,
  never announced.
- **Loud consumer social app.** No gamification, notification badges for their
  own sake, or playful-emoji social-feed energy.

## Design Principles

1. **The network is the hero.** People come first — the orbit, the directory,
   the faces. Data and chrome serve the members, never the reverse.
2. **Restraint signals status.** Exclusivity is communicated by what's removed:
   one accent, flat surfaces, generous space. When in doubt, take away.
3. **Considered, not decorated.** Every motion and detail earns its place and
   fits what it reveals. No reflexive entrance animations, no ornament for its
   own sake.
4. **Quietly premium on every surface.** Five screens, each crafted to the same
   bar. The 30th list row and the empty state get the same care as the Home.
5. **Backend-agnostic by design.** Screens depend only on the `Repo` seam;
   demo and production are visually identical.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Body text ≥ 4.5:1 against its surface (watch muted ink
on `--color-surface`), large text ≥ 3:1. Full keyboard navigation with a
visible `:focus-visible` ring (already tokenized). `prefers-reduced-motion` is
honored — the Home orbit renders as a static, distributed layout rather than
spinning, and this must hold for any future motion. Status is never conveyed by
color alone (active/suspended/expired also carry a label). Avatar fallbacks use
brand-colored initials so identity never depends on an uploaded image.
