-- ===================================================================
-- ORBITAE — optional seed
-- `events` has no FK to auth and can be seeded directly. `profiles`
-- are keyed to auth.users, so members must be created through Supabase
-- Auth first (invite flow / dashboard), then a profile row is inserted
-- for each — the template below shows the shape. The richer demo
-- dataset lives in /lib/data/seed.ts and powers the in-app demo mode.
-- ===================================================================

-- La Home mostra solo il PROSSIMO evento (il primo per data). Aggiorna
-- titolo/data/ora/luogo/descrizione con le info inviate su WhatsApp.
insert into events (title, date, location, time, description) values
  ('Come si costruisce il valore di un''azienda', '2026-07-08', 'Palazzo Cordusio, Milano', '20:00',
   'Prossimo incontro del network. Dettagli e conferma presenza da definire.');

-- Template — run once you have an auth user id for the member:
--
-- insert into profiles (id, name, email, role, status, sector, city, company)
-- values (
--   '<auth-user-uuid>', 'Marco Fontana', 'marco.fontana@orbitae.club',
--   'admin', 'active', 'Finanza', 'Milano', 'Fontana Capital'
-- );
--
-- insert into announcements (title, body, author_id, pinned)
-- values (
--   'Cena di networking — Milano, 10 luglio',
--   'Il prossimo incontro mensile si terrà giovedì 10 luglio…',
--   '<auth-user-uuid>', true
-- );
--
-- insert into resources (name, category, file_kind, file_url, size_label, uploaded_by)
-- values (
--   'Statuto del Club Orbitae', 'Regolamenti', 'pdf',
--   'https://<project>.supabase.co/storage/v1/object/public/documenti/statuto.pdf',
--   '512 KB', '<auth-user-uuid>'
-- );
