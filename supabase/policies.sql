-- ===================================================================
-- ORBITAE — Row Level Security policies
-- Run AFTER schema.sql. Encodes the same permission matrix as the app
-- (/lib/auth/permissions.ts): members read everything; admin/staff
-- post announcements + upload resources; only admin manages members.
-- ===================================================================

alter table profiles      enable row level security;
alter table announcements enable row level security;
alter table resources     enable row level security;
alter table events        enable row level security;

-- profiles ----------------------------------------------------------
-- Any authenticated member can read the directory.
create policy "profiles: read for members"
  on profiles for select
  to authenticated
  using (true);

-- A member may edit their own profile; admins may edit anyone.
create policy "profiles: update own or admin"
  on profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Only admins create (invite) or remove members.
create policy "profiles: insert by admin"
  on profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "profiles: delete by admin"
  on profiles for delete
  to authenticated
  using (public.is_admin());

-- announcements -----------------------------------------------------
create policy "announcements: read for members"
  on announcements for select to authenticated using (true);

create policy "announcements: write by staff or admin"
  on announcements for insert to authenticated
  with check (public.is_staff_or_admin());

create policy "announcements: update by staff or admin"
  on announcements for update to authenticated
  using (public.is_staff_or_admin());

create policy "announcements: delete by staff or admin"
  on announcements for delete to authenticated
  using (public.is_staff_or_admin());

-- resources ---------------------------------------------------------
create policy "resources: read for members"
  on resources for select to authenticated using (true);

create policy "resources: upload by staff or admin"
  on resources for insert to authenticated
  with check (public.is_staff_or_admin());

create policy "resources: delete by staff or admin"
  on resources for delete to authenticated
  using (public.is_staff_or_admin());

-- events ------------------------------------------------------------
create policy "events: read for members"
  on events for select to authenticated using (true);

create policy "events: write by staff or admin"
  on events for all to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
