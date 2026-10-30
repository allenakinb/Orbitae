# Orbitae — Portale Membri

Portale privato del club Orbitae: Next.js App Router, React, TypeScript,
Tailwind CSS e Supabase Auth/Postgres. Interfaccia in italiano, brand scuro
con Archivo e accento Orbit Red.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
```

L’applicazione richiede un progetto Supabase configurato. Le variabili pubbliche
sono `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; le API inviti
richiedono anche `SUPABASE_SERVICE_ROLE_KEY` **solo sul server**. Non esiste una
registrazione pubblica né un accesso demo locale.

Il login principale usa un magic link inviato all’email personale o di lavoro già presente nel profilo Orbitae, con codice opzionale.
Gli indirizzi tecnici `@orbitae.club` non sono destinatari dei magic link.
L’email del profilo deve corrispondere all’email dell’account Supabase Auth.
È disponibile anche l’accesso con email e password per gli account che la possiedono.
Il cambio email dalla pagina Account è facoltativo e conserva ID, ruolo e presenze. La configurazione
Auth usa il template standard per il link; i template OTP in `supabase/templates/` sono facoltativi e richiedono un mittente SMTP configurato.

La Home mostra i partecipanti in orbita attorno all’episodio selezionato.
Membri, Bacheca e Documenti compongono il portale; gli amministratori gestiscono
contenuti e membri. La Virtual Room è stata rimossa dal menu e dalle pagine
del portale.

Il livello dati condiviso è `lib/data/adapter.ts` con implementazione Supabase
in `lib/data/store.ts`. I permessi effettivi sono applicati dalle politiche RLS,
dai trigger SQL e dai controlli delle route server, oltre alla UI.

Per un database nuovo applicare `supabase/schema.sql`, `supabase/policies.sql`
e `supabase/migration-inviti.sql`; lo storage richiede il setup dedicato.
Per il progetto esistente applicare solo la nuova migrazione necessaria: le
vecchie migrazioni possono contenere sostituzioni distruttive degli eventi.

L’importazione membri mostra prima un’anteprima e non genera password:

```sh
npm run users:provision -- --input /percorso/membri.json --event UUID_EPISODIO
npm run users:provision -- --input /percorso/membri.json --event UUID_EPISODIO --apply
```

Stato reale, requisiti di attivazione e prove di consegna sono in
[docs/ATTIVAZIONE-ACCESSI-INVITI.md](docs/ATTIVAZIONE-ACCESSI-INVITI.md).
La suite di test comprende l’esecuzione della migrazione e delle politiche
RLS su Postgres PGlite, senza messaggi o modifiche al database remoto.
