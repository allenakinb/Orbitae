begin;
create table if not exists public.event_invitations (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.events(id) on delete cascade,
 profile_id uuid references public.profiles(id) on delete cascade,
 status text not null default 'pending',
 created_at timestamptz not null default now(),
 unique(event_id,profile_id)
);
alter table public.event_invitations alter column profile_id drop not null;
alter table public.event_invitations add column if not exists guest_name text;
alter table public.event_invitations add column if not exists email text;
alter table public.event_invitations add column if not exists token_hash text;
alter table public.event_invitations add column if not exists expires_at timestamptz not null default (now() + interval '90 days');
alter table public.event_invitations add column if not exists sent_at timestamptz;
alter table public.event_invitations add column if not exists responded_at timestamptz;
alter table public.event_invitations drop constraint if exists event_invitations_status_check;
alter table public.event_invitations add constraint event_invitations_status_check check (status in ('pending','accepted','declined','revoked'));
create unique index if not exists event_invitation_email_unique on public.event_invitations(event_id, lower(email));
create unique index if not exists event_invitation_token_unique on public.event_invitations(token_hash);
alter table public.event_invitations drop constraint if exists invitation_recipient;
alter table public.event_invitations add constraint invitation_recipient check (
 profile_id is not null or (nullif(trim(guest_name),'') is not null and nullif(trim(email),'') is not null and token_hash is not null and token_hash ~ '^[a-f0-9]{64}$')
);
create or replace function public.can_manage_invitations() returns boolean language sql stable security definer set search_path=public as $$
 select exists (select 1 from profiles where id=auth.uid() and role='admin' and status not in ('suspended','expired'));
$$;
alter table public.event_invitations enable row level security;
drop policy if exists "invites read" on public.event_invitations;
drop policy if exists "invites manage" on public.event_invitations;
drop policy if exists "invites insert" on public.event_invitations;
drop policy if exists "invites update" on public.event_invitations;
create policy "invites read" on public.event_invitations for select to authenticated using (
 public.can_manage_invitations() or (profile_id=auth.uid() and exists (select 1 from profiles where id=auth.uid() and status not in ('suspended','expired')))
);
create policy "invites insert" on public.event_invitations for insert to authenticated with check (public.can_manage_invitations());
create policy "invites update" on public.event_invitations for update to authenticated using (public.can_manage_invitations()) with check (public.can_manage_invitations());
-- Tokens are bearer credentials. Members answer through the RPC; only admins need the hash.
revoke all on public.event_invitations from anon;
grant select, insert, update on public.event_invitations to authenticated;
revoke delete on public.event_invitations from authenticated;
create or replace function public.respond_invitation(invitation_id uuid, response text) returns void language plpgsql security definer set search_path=public as $$
begin
 if response is null or response not in ('accepted','declined') then raise exception 'Invalid response'; end if;
 if not exists (select 1 from profiles where id=auth.uid() and status not in ('suspended','expired')) then raise exception 'Access unavailable'; end if;
 update event_invitations set status=response, responded_at=now() where id=invitation_id and profile_id=auth.uid() and status <> 'revoked' and expires_at>now();
 if not found then raise exception 'Invitation unavailable'; end if;
end; $$;
revoke all on function public.respond_invitation(uuid,text) from public;
grant execute on function public.respond_invitation(uuid,text) to authenticated;
create or replace function public.sync_confirmed_email() returns trigger language plpgsql security definer set search_path=public as $$
begin
 update public.profiles set email=new.email where id=new.id;
 return new;
end; $$;
drop trigger if exists sync_confirmed_email on auth.users;
create trigger sync_confirmed_email after update of email on auth.users for each row when (old.email is distinct from new.email) execute function public.sync_confirmed_email();
-- Own-profile editing must never allow elevating the role used by invitation APIs.
create or replace function public.protect_profile_access() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is not null and not public.can_manage_invitations() and
   (new.role is distinct from old.role or new.tier is distinct from old.tier or new.status is distinct from old.status or new.id is distinct from old.id)
 then raise exception 'Member access fields are managed by administrators'; end if;
 if auth.uid() is not null and not public.can_manage_invitations() and new.email is distinct from old.email and
    new.email is distinct from (select email from auth.users where id=old.id)
 then raise exception 'Confirm the new access email before editing the profile email'; end if;
 return new;
end; $$;
drop trigger if exists protect_profile_access on public.profiles;
create trigger protect_profile_access before update on public.profiles for each row execute function public.protect_profile_access();
commit;
