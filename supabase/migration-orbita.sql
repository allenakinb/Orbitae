-- ===================================================================
-- ORBITAE — migration redesign Home/Orbita
-- Esegui nell'SQL Editor di Supabase. Idempotente: si può rieseguire.
-- ===================================================================

-- 1) Nuove colonne ---------------------------------------------------
alter table public.profiles add column if not exists linkedin text;
alter table public.events   add column if not exists time text;
alter table public.events   add column if not exists description text;

-- 2) Link LinkedIn dei membri (dal file Excel) -----------------------
update public.profiles set linkedin = 'https://www.linkedin.com/in/lorenzo-scisciani-15193549' where email = 'lorenzo.scisciani@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/avvocatoandreacecchi/' where email = 'andrea.cecchi@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/alessio-angioni-606309ba/' where email = 'alessio.angioni@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/giorgio-zurlo-987538155/' where email = 'giorgio.zurlo@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/raffaele-di-vuolo-2b5349102/' where email = 'raffaele.vuolo@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/paolosavarese/' where email = 'paolo.savarese@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/stefania-moschella-a9508a20/' where email = 'stefania.moschella@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/marco-pasquali-809454137/' where email = 'marco.pasquali@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/santino-cundari-020585/' where email = 'santino.cundari@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/paololanciani/' where email = 'paolo.lanciani@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/anna-albini-786b1a26/' where email = 'anna.albini@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/mario-distasi/' where email = 'mario.distasi@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/paolotomasino/' where email = 'paolo.tomasino@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/giulia-escurolle-599065a5/' where email = 'giulia.escurolle@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/linda-testa-a3410218/' where email = 'linda.testa@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/silvano-alberi-b78912155/' where email = 'silvano.alberi@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/nicola-mazzoni-77a166156/' where email = 'nicola.mazzoni@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/gian-luigi-gilardi-476991a/' where email = 'gian.giliardi@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/alessandro-cappai/' where email = 'alessandro.cappai@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/salvatore-morales-2888903b/' where email = 'salvatore.morales@orbitae.club';
update public.profiles set linkedin = 'https://www.linkedin.com/in/rocco-lanzavecchia-133552a/' where email = 'rocco.lanzavecchia@orbitae.club';

-- 3) Evento in evidenza (mostrato al centro dell'orbita) -------------
--    La Home mostra SOLO il prossimo evento (il primo per data).
--    Rimuovo gli eventi vecchi e inserisco quello nuovo.
--    >>> MODIFICA data / ora / luogo / descrizione con le info di WhatsApp <<<
delete from public.events;
insert into public.events (title, date, location, time, description) values
  ('Come si costruisce il valore di un''azienda',
   '2026-07-08',                       -- data (YYYY-MM-DD)
   'Palazzo Cordusio, Milano',         -- luogo
   '20:00',                            -- ora
   'Descrizione dell''evento (da WhatsApp).');
