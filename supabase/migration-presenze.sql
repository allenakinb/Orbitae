-- Save the event and its attendance as one transaction, with RLS enforced.
create or replace function public.save_event_attendance(event_id uuid, details jsonb, attendee_ids uuid[])
returns uuid language plpgsql security invoker set search_path=public as $$
begin
 if not exists(select 1 from profiles where id=auth.uid() and role='admin' and status='active') then
  raise exception 'Administrator required' using errcode='42501';
 end if;
 if nullif(trim(details->>'title'),'') is null or details->>'date' is null or attendee_ids is null then
  raise exception 'Invalid event';
 end if;
 if exists(select 1 from unnest(attendee_ids) as ids(id) where not exists(select 1 from profiles p where p.id=ids.id)) then
  raise exception 'Unknown participant';
 end if;
 insert into events(id,title,subtitle,date,time,location,description,summary,speakers,moderators,map_url)
 values(event_id,trim(details->>'title'),details->>'subtitle',(details->>'date')::date,details->>'time',coalesce(details->>'location',''),details->>'description',details->>'summary',coalesce(details->'speakers','[]'),coalesce(details->'moderators','[]'),details->>'map_url')
 on conflict(id) do update set title=excluded.title,subtitle=excluded.subtitle,date=excluded.date,time=excluded.time,location=excluded.location,description=excluded.description,summary=excluded.summary,speakers=excluded.speakers,moderators=excluded.moderators,map_url=excluded.map_url;
 delete from event_attendees a where a.event_id=save_event_attendance.event_id and not(a.profile_id=any(attendee_ids));
 insert into event_attendees(event_id,profile_id) select save_event_attendance.event_id, unnest(attendee_ids) on conflict do nothing;
 return event_id;
end $$;
revoke all on function public.save_event_attendance(uuid,jsonb,uuid[]) from public;
grant execute on function public.save_event_attendance(uuid,jsonb,uuid[]) to authenticated;
