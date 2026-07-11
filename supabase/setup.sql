-- ===================================================================
-- ORBITAE — setup completo e RI-ESEGUIBILE (idempotente).
-- Incolla TUTTO nel Supabase SQL Editor ed esegui. Puoi rilanciarlo
-- più volte senza errori: tipi/tabelle/policy vengono creati solo se
-- mancano, e gli eventi demo solo se la tabella è vuota.
-- ===================================================================

-- Enums (crea solo se non esistono) --------------------------------
do $$ begin create type member_role as enum ('admin','staff','member');
  exception when duplicate_object then null; end $$;
do $$ begin create type member_status as enum ('active','suspended','expired','pending');
  exception when duplicate_object then null; end $$;
do $$ begin create type resource_category as enum ('Verbali','Regolamenti','Materiali');
  exception when duplicate_object then null; end $$;
do $$ begin create type resource_kind as enum ('pdf','image','link','doc');
  exception when duplicate_object then null; end $$;

-- Tabelle -----------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        member_role not null default 'member',
  status      member_status not null default 'pending',
  sector      text not null default '',
  city        text not null default '',
  company     text,
  phone       text,
  bio         text,
  avatar_url  text,
  joined_at   date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  author_id   uuid references profiles (id) on delete set null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists resources (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     resource_category not null,
  file_kind    resource_kind not null default 'pdf',
  file_url     text not null,
  size_label   text,
  uploaded_by  uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  date       date not null,
  location   text not null default '',
  created_at timestamptz not null default now()
);

-- Colonne eventi aggiunte dopo il primo setup (vedi migration-orbita.sql
-- e migration-eventi.sql) — qui come alter idempotenti.
alter table events add column if not exists time        text;
alter table events add column if not exists description text;
alter table events add column if not exists subtitle    text;
alter table events add column if not exists speakers    jsonb not null default '[]'::jsonb;
alter table events add column if not exists moderators  jsonb not null default '[]'::jsonb;
alter table events add column if not exists summary     text;
alter table events add column if not exists map_url     text;

-- Funzioni helper per le RLS (create or replace = sempre sicuro) -----
create or replace function public.current_role()
returns member_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() in ('admin','staff'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

-- Indici ------------------------------------------------------------
create index if not exists announcements_created_idx on announcements (created_at desc);
create index if not exists resources_cat_created_idx on resources (category, created_at desc);
create index if not exists events_date_idx on events (date);

-- ============ RLS ============
alter table profiles      enable row level security;
alter table announcements enable row level security;
alter table resources     enable row level security;
alter table events        enable row level security;

-- profiles
drop policy if exists "profiles: read for members" on profiles;
create policy "profiles: read for members" on profiles for select to authenticated using (true);
drop policy if exists "profiles: update own or admin" on profiles;
create policy "profiles: update own or admin" on profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: insert by admin" on profiles;
create policy "profiles: insert by admin" on profiles for insert to authenticated
  with check (public.is_admin());
drop policy if exists "profiles: delete by admin" on profiles;
create policy "profiles: delete by admin" on profiles for delete to authenticated
  using (public.is_admin());

-- announcements
drop policy if exists "announcements: read for members" on announcements;
create policy "announcements: read for members" on announcements for select to authenticated using (true);
drop policy if exists "announcements: write by staff or admin" on announcements;
create policy "announcements: write by staff or admin" on announcements for insert to authenticated
  with check (public.is_staff_or_admin());
drop policy if exists "announcements: update by staff or admin" on announcements;
create policy "announcements: update by staff or admin" on announcements for update to authenticated
  using (public.is_staff_or_admin());
drop policy if exists "announcements: delete by staff or admin" on announcements;
create policy "announcements: delete by staff or admin" on announcements for delete to authenticated
  using (public.is_staff_or_admin());

-- resources
drop policy if exists "resources: read for members" on resources;
create policy "resources: read for members" on resources for select to authenticated using (true);
drop policy if exists "resources: upload by staff or admin" on resources;
create policy "resources: upload by staff or admin" on resources for insert to authenticated
  with check (public.is_staff_or_admin());
drop policy if exists "resources: delete by staff or admin" on resources;
create policy "resources: delete by staff or admin" on resources for delete to authenticated
  using (public.is_staff_or_admin());

-- events
drop policy if exists "events: read for members" on events;
create policy "events: read for members" on events for select to authenticated using (true);
drop policy if exists "events: write by staff or admin" on events;
create policy "events: write by staff or admin" on events for all to authenticated
  using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- Eventi demo (solo se la tabella è vuota) --------------------------
insert into events (title, date, location)
select v.title, v.date::date, v.location from (values
  ('Cena di networking',            '2026-07-10', 'Palazzo Cordusio, Milano'),
  ('Tavolo Internazionalizzazione', '2026-07-24', 'Sede Orbitae, Milano'),
  ('Assemblea semestrale',          '2026-09-18', 'Auditorium, Roma')
) as v(title, date, location)
where not exists (select 1 from events);

-- ============ STORAGE (bucket per avatar + documenti) ============
insert into storage.buckets (id, name, public) values
  ('avatars',   'avatars',   true),
  ('documenti', 'documenti', false)
on conflict (id) do nothing;

drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars: authenticated upload" on storage.objects;
create policy "avatars: authenticated upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');
drop policy if exists "avatars: authenticated update" on storage.objects;
create policy "avatars: authenticated update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "documenti: members read" on storage.objects;
create policy "documenti: members read" on storage.objects for select to authenticated
  using (bucket_id = 'documenti');
drop policy if exists "documenti: staff upload" on storage.objects;
create policy "documenti: staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'documenti' and public.is_staff_or_admin());
drop policy if exists "documenti: staff delete" on storage.objects;
create policy "documenti: staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documenti' and public.is_staff_or_admin());
