-- ===================================================================
-- ORBITAE — database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Mirrors the demo data layer in /lib/data. After running this and
-- policies.sql, implement the Repo interface (/lib/data/adapter.ts)
-- against supabase-js and swap the export in /lib/data — no UI changes.
-- ===================================================================

-- Enums -------------------------------------------------------------
-- 'staff' è un residuo storico: nessuna riga lo usa (l'accesso è admin o
-- niente) e non si rimuove perché imporrebbe di ricreare tipo e colonna.
create type member_role as enum ('admin', 'staff', 'member');
-- Etichetta pubblica accanto al nome, indipendente dai permessi.
create type member_tier as enum ('founder', 'ambassador', 'member');
create type member_status as enum ('active', 'suspended', 'expired', 'pending');
create type resource_category as enum ('Verbali', 'Regolamenti', 'Materiali');
create type resource_kind as enum ('pdf', 'image', 'link', 'doc');

-- profiles ----------------------------------------------------------
-- One row per member, keyed to the Supabase auth user.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        member_role not null default 'member',
  tier        member_tier not null default 'member',
  status      member_status not null default 'pending',
  sector      text not null default '',
  city        text not null default '',
  company     text,
  phone       text,
  bio         text,
  linkedin    text,
  avatar_url  text,
  joined_at   date not null default current_date,
  created_at  timestamptz not null default now()
);

-- announcements -----------------------------------------------------
create table announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  author_id   uuid not null references profiles (id) on delete set null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- resources ---------------------------------------------------------
create table resources (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     resource_category not null,
  file_kind    resource_kind not null default 'pdf',
  file_url     text not null,
  size_label   text,
  uploaded_by  uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- events ------------------------------------------------------------
create table events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text,
  date        date not null,
  location    text not null default '',
  time        text,
  description text,
  summary     text,                                     -- sintesi estesa (Bacheca)
  speakers    jsonb not null default '[]'::jsonb,       -- relatori: [{"name","role"?}]
  moderators  jsonb not null default '[]'::jsonb,       -- moderatori: [{"name","role"?}]
  map_url     text,                                     -- link Google Maps
  created_at  timestamptz not null default now()
);

-- event_attendees ---------------------------------------------------
-- Chi ha presenziato: alimenta l'orbita della Home, un evento per volta.
create table event_attendees (
  event_id   uuid not null references events (id)   on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  primary key (event_id, profile_id)
);

-- Helpers used by RLS policies (SECURITY DEFINER to read role safely).
create or replace function public.current_role()
returns member_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

-- Storico: le policy scritte quando esisteva lo staff passano di qui.
-- Oggi scrive solo chi è admin; la funzione resta per non dover riscrivere
-- ogni policy che la referenzia (comprese quelle di storage).
create or replace function public.is_staff_or_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin();
$$;

create index on announcements (created_at desc);
create index on resources (category, created_at desc);
create index on events (date);
