# Orbitae — Portale Membri

Private member portal for **Orbitae**, an invite-only business conversation
club. Dark, premium, brand-driven UI built around the logo's signature
**orbit**: on the Home, every member revolves around the central Orbitae mark.

Built with **Next.js (App Router) · React · TypeScript · Tailwind CSS v4 ·
motion**. UI language: **Italian**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

The app opens on `/login`. It ships in **demo mode** — no backend required.

### Demo accounts

Sign in with any seeded member's email and the password **`orbitae`**, or use
the role chips on the login screen:

| Role   | Email                          |
| ------ | ------------------------------ |
| Admin  | `marco.fontana@orbitae.club`   |
| Staff  | `elena.greco@orbitae.club`     |
| Membro | `luca.bianchi@orbitae.club`    |

Each role sees only what it should (sidebar, composer, upload, admin panel are
gated by `lib/auth/permissions.ts`).

## Features

- **Login** — invite-only (no public signup), branded, minimal.
- **Home** — the orbit: pick an evening from the selector and the people who
  attended it rotate around its subject (hover to enlarge + reveal name, click
  to open the profile), quick stats, then the evening's card and recap. Static,
  distributed orbit under `prefers-reduced-motion`.
- **Membri** — the whole network in alphabetical order, searchable by name;
  open to everyone. Only admin edits others.
- **Bacheca** — the evenings, each with its recap; only admin creates or edits
  them. The announcements section appears only when there is something in it.
- **Documenti** — library by category (Verbali · Regolamenti · Materiali);
  admin uploads, everyone downloads.
- **Admin** — member table with inline label/status, summary. Admin access
  itself is not editable here (see `supabase/migration-tier-presenze.sql`).
- **Avatar uploads** — members/admin upload a photo (else brand-colored
  initials), reflected live in the orbit and directory.
- **Forum** — present in the nav as "Presto" (planned).

## Architecture

The UI never talks to a backend directly. All data flows through a single
`Repo` interface:

```
lib/data/adapter.ts   # Repo interface — the one seam to a backend
lib/data/store.ts     # demoRepo: reactive in-memory + localStorage (current)
lib/data/hooks.ts     # useSyncExternalStore hooks consumed by pages
lib/data/seed.ts      # demo dataset (~24 members, posts, docs, events)
```

## Going live with Supabase

The SQL is already written under `supabase/`:

1. Create a Supabase project; run `supabase/schema.sql`, then
   `supabase/policies.sql` (RLS encodes the same permission matrix), then
   optionally `supabase/seed.sql`.
2. `npm install @supabase/supabase-js`; add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. Implement the `Repo` interface (`lib/data/adapter.ts`) against supabase-js
   and swap the demo export. Auth: replace the demo session in
   `lib/auth/AuthProvider.tsx` with Supabase Auth (invite-only); avatar
   uploads move from data-URLs to Supabase Storage.

No page or component changes are required — they depend only on `Repo`.

## Brand

Tokens (OKLCH) live in `app/globals.css`; the logo's radial dot-burst is
recreated in `components/brand/OrbitMark.tsx`. Source logo assets are in
`public/brand/`.
