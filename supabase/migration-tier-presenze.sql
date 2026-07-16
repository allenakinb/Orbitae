-- ===================================================================
-- ORBITAE — migration: etichette (tier), accessi ridotti e presenze
-- Esegui nell'SQL Editor di Supabase PRIMA di `node scripts/create-users.mjs`.
-- Idempotente: si può rieseguire.
--
-- Cosa cambia, in breve:
--  · le etichette pubbliche diventano Founder / Ambassador / Member e non
--    coincidono più con i permessi;
--  · l'accesso admin resta a tre persone soltanto, senza etichetta;
--  · l'orbita della Home mostra i presenti a un evento, non tutti i membri.
-- ===================================================================

-- 1) Etichetta pubblica (tier) ---------------------------------------
do $$ begin
  create type member_tier as enum ('founder', 'ambassador', 'member');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists tier member_tier not null default 'member';

-- 2) Backfill etichette dagli elenchi contatti ------------------------
update public.profiles set tier = 'founder'
 where email in ('lorenzo.scisciani@orbitae.club', 'andrea.cecchi@orbitae.club', 'alessio.angioni@orbitae.club', 'giorgio.zurlo@orbitae.club', 'raffaele.vuolo@orbitae.club', 'paolo.savarese@orbitae.club', 'stefania.moschella@orbitae.club', 'marco.pasquali@orbitae.club');

update public.profiles set tier = 'ambassador'
 where email in ('santino.cundari@orbitae.club', 'paolo.lanciani@orbitae.club', 'anna.albini@orbitae.club');
-- Maria Serena Sarno entra con lo script di provisioning, già come ambassador.

-- 3) Accesso admin: solo tre account ---------------------------------
--    L'enum member_role conserva il valore legacy 'staff' (rimuoverlo
--    imporrebbe di ricreare tipo e colonna): nessuna riga lo usa più e
--    lib/data/store.ts normalizza a 'member' qualunque valore non-admin.
update public.profiles set role = 'member'
 where role <> 'member'
   and email not in (
     'lorenzo.scisciani@orbitae.club',
     'santino.cundari@orbitae.club',
     'allen@orbitae.club'
   );

-- 4) Le policy scritte per lo staff diventano admin-only --------------
--    is_staff_or_admin() è referenziata da molte policy (comprese quelle
--    di storage): riscriverne il corpo le allinea tutte in un colpo solo.
create or replace function public.is_staff_or_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_admin(); $$;

-- 5) Presenze agli eventi ---------------------------------------------
create table if not exists public.event_attendees (
  event_id   uuid not null references public.events (id)   on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (event_id, profile_id)
);

create index if not exists event_attendees_event_idx
  on public.event_attendees (event_id);

alter table public.event_attendees enable row level security;

drop policy if exists "attendees: read"  on public.event_attendees;
drop policy if exists "attendees: write" on public.event_attendees;

create policy "attendees: read" on public.event_attendees
  for select to authenticated using (true);

create policy "attendees: write" on public.event_attendees
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 6) I due incontri realmente avvenuti --------------------------------
--    Gli id sono fissi: scripts/create-users.mjs vi aggancia le presenze.
delete from public.events
 where id not in (
   'a1b2c3d4-0001-4000-8000-000000000001',
   'a1b2c3d4-0002-4000-8000-000000000002'
 );

insert into public.events (id, title, date, time, location, summary) values
  ('a1b2c3d4-0001-4000-8000-000000000001',
   'Talent war',
   '2026-05-12',
   null,
   'Milano',                          -- luogo da completare dalla Bacheca
   $recap$Grazie mille per aver partecipato alla prima edizione di ORBITAE, dedicata al tema "Talent War".

È stata una serata davvero speciale: intensa, aperta, ricca di confronto e di punti di vista diversi. Proprio come speravamo, il format ha generato conversazioni vive, trasversali e utili, confermando il valore di mettere attorno allo stesso tavolo persone provenienti da mondi differenti, ma accomunate dalla voglia di ragionare insieme su temi concreti e attuali.

Nel corso della serata abbiamo affrontato tre grandi temi, che hanno fatto emergere alcuni spunti molto chiari.

Sul fronte dei benefit e dei sistemi di incentivazione, è emerso con forza che oggi il talento non cerca soltanto una remunerazione competitiva, ma anche ascolto, riconoscimento, flessibilità e qualità dell’esperienza lavorativa. Le nuove generazioni sembrano attribuire sempre più valore al benessere, al tempo personale, all’allineamento con i valori dell’organizzazione e a benefit non monetari capaci di incidere davvero sulla vita quotidiana. Allo stesso tempo, è emersa una forte esigenza di personalizzazione: non esiste più un pacchetto valido per tutti, perché età, ruolo, fase di vita e priorità individuali incidono profondamente sulle aspettative. Il clima aziendale, la qualità delle relazioni e la sensazione di far parte di un ecosistema sano e coerente sembrano oggi essere fattori decisivi tanto quanto il compenso economico.

Sul tema dello smart working, il confronto ha restituito un quadro molto sfaccettato. Da un lato, il lavoro flessibile è ormai percepito come un prerequisito di attrattività, soprattutto per i profili più giovani e per chi ricerca un migliore equilibrio tra vita privata e lavoro. Dall’altro, è emersa con altrettanta chiarezza la necessità di non trasformarlo in un automatismo rigido. Lo smart working funziona quando è governato con buon senso, in relazione ai ruoli, agli obiettivi e al livello di autonomia delle persone. Molti hanno sottolineato come la presenza continui a essere fondamentale per nutrire cultura aziendale, senso di appartenenza, apprendimento informale e crescita dei profili junior, che rischiano di perdere una parte importante della formazione “per osmosi” quando il lavoro da remoto diventa eccessivo. Il punto non sembra quindi essere scegliere tra presenza e distanza, ma trovare un equilibrio credibile tra flessibilità, responsabilizzazione e costruzione di identità collettiva.

Infine, sul rapporto tra intelligenza artificiale e lavoro, il confronto si è mosso tra entusiasmo e cautela. L’AI è stata riconosciuta come una straordinaria leva di efficienza, accelerazione e scalabilità, soprattutto per le PMI e per tutte quelle realtà che possono usarla per competere in modo più strutturato. Allo stesso tempo, è emersa una preoccupazione diffusa rispetto al rischio che l’automazione riduca le occasioni di apprendimento per i più giovani, comprimendo i passaggi fondamentali della formazione iniziale. In diversi interventi è stato sottolineato come l’AI dia il meglio quando è guidata da persone esperte, capaci di porre le domande giuste, interpretare le risposte e validare gli output. Proprio per questo, il vero nodo non sembra essere sostituire le persone, ma capire come usare la tecnologia per valorizzarle senza impoverire competenze, spirito critico e profondità professionale. È emersa anche un’intuizione interessante: in futuro, proprio in risposta all’uso diffuso dell’AI, potrebbe crescere il valore percepito dell’artigianalità e del contributo umano.

Grazie ancora per aver contribuito con idee, esperienze e punti di vista a questa prima orbita di ORBITAE.

Per noi è stato un inizio prezioso. Continueremo a lavorare sul format anche a partire dai feedback raccolti, con l’obiettivo di far crescere ORBITAE come uno spazio sempre più stimolante, rilevante e capace di generare connessioni di valore.

A presto,

Il team di ORBITAE$recap$),
  ('a1b2c3d4-0002-4000-8000-000000000002',
   'Come si costruisce il valore di un''azienda',
   '2026-07-08',
   '20:00',
   'Palazzo Cordusio, Milano',
   $recap$Grazie mille per aver partecipato alla serata di ORBITAE dedicata al tema "Come si costruisce il valore di un'azienda".

Il confronto ha fatto emergere prospettive molto diverse, segno che il format funziona quando riunisce, attorno allo stesso tema, persone con esperienze e ruoli lontani tra loro. Grazie al contributo di tutti, la serata ha attraversato tre grandi ambiti, restituendo alcune riflessioni piuttosto nitide.

Sul fronte delle leve interne di crescita, è emerso che il valore economico di un'azienda non coincide con quello umano e organizzativo, e le due dimensioni rischiano di essere confuse. L'intelligenza artificiale è stata descritta come un'ottima leva di efficientamento — accelera analisi, formazione e output, e aiuta soprattutto le realtà più piccole a crescere — ma ancora raramente sposta i margini: resta più uno strumento operativo che un moltiplicatore di valore. Non sono mancate le cautele: resistenze legate al cambiamento e ai dati, e il timore che l'automazione riduca l'apprendimento "per osmosi" dei profili junior. Le persone restano la leva più solida: formazione, empowerment, leadership orizzontale — capace di valorizzare le persone oltre il ruolo gerarchico — e soft skill e intelligenza emotiva sempre più decisive, mentre il middle management si trasforma. È emersa anche l'importanza di comunicare con chiarezza la rotta dell'azienda, condivisa a tutti i livelli, e di riconoscere che i driver delle persone cambiano con il ruolo: chi lavora sul prodotto e chi sul commerciale non cercano le stesse cose. La managerializzazione, in definitiva, si misura sulla capacità di delegare: senza delega, processi e innovazione restano bloccati sulla figura del fondatore.

Sul tema della crescita per acquisizioni, è emerso con chiarezza che crescita organica e crescita per acquisizioni non si escludono, ma possono procedere in parallelo: la prima consolida le fondamenta, la seconda accelera la scala; la variabile chiave nella scelta di comprare invece di costruire è la velocità con cui si vuole, o si deve, crescere. Tra le principali ragioni per acquisire figurano: aumentare rapidamente i volumi, accedere a competenze e tecnologie troppo lente da sviluppare internamente, presidiare la filiera, eliminare un competitor, diversificare l'offerta o efficientare i costi attraverso sinergie. Nell’integrare, il principio guida più richiamato resta che un'operazione ben fatta debba generare un effetto moltiplicativo — "1 + 1 deve fare 4" — acquisendo non solo fatturato ma valori immateriali come tempo ed expertise. Coinvolgere le persone chiave del management è essenziale per evitare rischi concreti: senza il loro pieno coinvolgimento, l'integrazione potrebbe generare perdita di controllo, inefficienze culturali e un costo non solo economico ma organizzativo e identitario: senza una reale condivisione di valori, si rischia di disperdere valore invece di crearne. Il confronto ha toccato anche il tema della filiera e del Made in Italy: quanto valore si perde lungo la catena produttiva, e se il Made in Italy possa ancora giustificare costi più alti agli occhi del cliente. Ne emerge l'invito a guardare ogni operazione anche dal punto di vista di chi viene acquisito e dei clienti che osservano il cambiamento.

Infine, sul tema della preparazione dell’azienda a investitori e passaggio generazionale, il punto di partenza condiviso è che il valore debba poter camminare senza il fondatore: attrarre capitali o gestire una successione richiede prima di tutto di scollegare il valore dell'azienda dalla persona dell'imprenditore, attraverso managerializzazione e governance. È un nodo storico dell'imprenditoria italiana: il fondatore spesso si identifica con l'impresa e cerca un successore "uguale a sé", invece di accettare una leadership diversa. Le nuove generazioni portano un approccio più orientato ai processi e al confronto costruttivo, e il vero equilibrio sta nel cambiare senza snaturare l'identità dell'impresa. Da qui l'importanza di pianificare per tempo: il problema, più che la successione, è spesso la mancanza di un percorso chiaro, che tratti il change management come parte del cambiamento e non come un'aggiunta a organigrammi e processi già aggiornati. Anche il timing e la capacità, anche emotiva, di dare un valore corretto a sé stessi e all'azienda sono stati indicati come fattori determinanti: aprirsi a investitori o affrontare un passaggio generazionale significa accettare un cambiamento del mercato, e capire come affrontarlo. Lavorare su filiera ed efficientamento dei processi rende l'azienda più "leggibile" in una due diligence, ed è anche per questo che il passaggio generazionale attrae oggi molti capitali: i fondi vi vedono un'opportunità specifica, non solo un problema da risolvere. Gli investitori esterni, se scelti con attenzione, possono portare metodo, strumenti e nuove logiche di crescita — pur rischiando, se mal gestiti, di rompere equilibri delicati. Il nodo, alla fine, resta lo stesso: mediare tra generazioni sulla visione dell'azienda; e quando non si riesce, i capitali esterni possono diventare un aiuto concreto per la crescita e per la gestione delle criticità tipiche delle aziende familiari.

Un'idea è tornata in tutti e tre gli ambiti: nessuna leva crea valore da sola. Che si tratti di managerializzazione, AI, di un'acquisizione o di un investitore, il valore nasce solo se le persone e l'organizzazione sono pronte a gestire il cambiamento che quella leva porta con sé. Senza questa capacità, anche lo strumento più promettente rischia di non bastare — o di disperdere il valore che dovrebbe creare.

Grazie ancora per aver portato idee, esperienze e punti di vista alla serata. Continueremo a far crescere ORBITAE anche a partire dai vostri feedback, con l'obiettivo di renderlo uno spazio sempre più capace di generare connessioni di valore.

A presto,

Il team di ORBITAE$recap$)
on conflict (id) do update
  set title    = excluded.title,
      date     = excluded.date,
      time     = excluded.time,
      location = excluded.location,
      summary  = excluded.summary;

-- 7) Gli annunci seed lasciano il posto ai recap degli eventi ----------
delete from public.announcements;
