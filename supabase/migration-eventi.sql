-- ===================================================================
-- ORBITAE — migration eventi arricchiti (Bacheca)
-- Esegui nell'SQL Editor di Supabase. Idempotente: si può rieseguire.
-- ===================================================================

-- 1) Nuove colonne ---------------------------------------------------
alter table public.events add column if not exists subtitle   text;
alter table public.events add column if not exists speakers   jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists moderators jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists summary    text;
alter table public.events add column if not exists map_url    text;

-- 2) Due eventi SEGNAPOSTO -------------------------------------------
--    >>> Sostituisci i contenuti "da definire" con quelli reali:
--    update public.events set title = '…', subtitle = '…', … where title = 'Evento 1 — titolo da definire';
insert into public.events (title, subtitle, date, time, location, description, summary, speakers, moderators, map_url)
select * from (values
  ('Evento 1 — titolo da definire',
   'Sottotitolo da definire',
   date '2026-09-15',
   '20:00',
   'Luogo da definire, Milano',
   'Dettagli in arrivo.',
   'Sintesi dell''evento da definire. Testo segnaposto in attesa dei contenuti ufficiali.',
   '[{"name":"Relatore da definire","role":"Ruolo da definire"}]'::jsonb,
   '[{"name":"Moderatore da definire"}]'::jsonb,
   'https://maps.google.com/?q=Milano'),
  ('Evento 2 — titolo da definire',
   'Sottotitolo da definire',
   date '2026-10-20',
   '20:00',
   'Luogo da definire, Milano',
   'Dettagli in arrivo.',
   'Sintesi dell''evento da definire. Testo segnaposto in attesa dei contenuti ufficiali.',
   '[{"name":"Relatore da definire","role":"Ruolo da definire"}]'::jsonb,
   '[{"name":"Moderatore da definire"}]'::jsonb,
   'https://maps.google.com/?q=Milano')
) as v(title, subtitle, date, time, location, description, summary, speakers, moderators, map_url)
where not exists (select 1 from public.events e where e.title = v.title);
