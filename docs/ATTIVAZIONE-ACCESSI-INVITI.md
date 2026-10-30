# Accessi, episodio 3 e inviti

## Aggiornamento del 30 ottobre 2026

Su richiesta, la Virtual Room è stata rimossa dal menu e la relativa pagina è stata eliminata.
Le API inviti e i dati già presenti sono conservati. Le sezioni sugli inviti qui sotto
descrivono il lavoro precedente, non una funzione attualmente disponibile nel portale.

Il magic link usa l’email personale o di lavoro già presente nel profilo Orbitae,
escludendo gli indirizzi tecnici `@orbitae.club`. Verifica e aggiornamento remoto del 30 ottobre completati: 41 account Auth allineati
alle email personali dei rispettivi profili; 15 erano già allineati, per 7 manca
un’email personale. Nessun conflitto email. ID, ruoli, stati e 86 presenze conservati;
un’email del profilo è stata normalizzata in minuscolo dal trigger Auth.
Magic link tecnico generato senza invio email e verificato con successo sullo stesso ID;
sessione di prova chiusa. 20 test locali passati. Backup del piano e risultato in
`.local/activation/personal-email-plan.json` e `personal-email-result.json`.
Consegna email e login sul dominio pubblico non attestati: il dominio pubblico
restituisce un errore DNS da questo ambiente. Nessuna pubblicazione eseguita. L’accesso con password porta alla Home.
Il cambio email resta facoltativo; lo stato storico seguente precede questa scelta.

## Stato verificato il 28 ottobre 2026

Progetto Supabase usato dall’applicazione: `dkfxadhqgmsaydivceia`.

- Importati i contatti dal foglio visibile `2026_10_21 - STORYTELLING` del file fornito dal cliente. Il foglio nascosto di esempio è escluso.
- 28 partecipanti: 15 nuovi account con email personale e senza password, 13 account esistenti conservati.
- Verifica dopo importazione: 63 utenti Auth, 63 profili, 28 presenze per l’episodio 3. Le 58 presenze dei primi due incontri sono invariate.
- Episodio `405a2f1e-ec35-4d47-acb2-c3bc17afe744`: «Quando lo storytelling diventa business», data 21 ottobre 2026. Report originale inserito nella sintesi dell’episodio. Ora e luogo non sono forniti e non sono stati inventati.
- I dati personali di importazione e il risultato sono conservati in `.local/episode3/`, esclusa da Git. Nicola Mazzoni e Silvia Pelizzoni hanno indirizzi differenti nel nuovo foglio: i loro account e profili precedenti sono conservati; il cambio email richiede conferma del titolare.
- Nessuna email ai membri o invito reale è stato inviato durante l’importazione.

## Implementato nel codice locale

- Login principale con magic link Supabase per soli account registrati (`shouldCreateUser: false`), con possibilità di inserire un codice se ricevuto. Il link rientra sulla pagina Login dello stesso ambiente; la sessione viene letta dal client Supabase.
- Accesso transitorio con vecchia email/password per permettere agli attuali 48 membri di confermare la propria casella personale senza perdere l’account. Questo passaggio va ritirato quando tutti gli account sono migrati e il login OTP è collaudato.
- Cambio email dalla pagina Account tramite link di conferma, con codice opzionale. Il controllo finale verifica il nuovo indirizzo Auth e lo stesso ID; non basta il semplice invio del link. La migrazione SQL sincronizza il profilo soltanto quando Auth conferma l’email.
- Virtual room: scelta episodio, dettagli, membri del club e ospiti esterni, risposte, ricerca, filtri per stato, riepilogo, revoca, rigenerazione e nuovo invio del link.
- Pagina personale ospite senza accesso alla directory. Link casuale; nel database è conservato solo l’hash. Rigenerare il link invalida quello precedente e mantiene la risposta.
- Risposte rifiutate dopo revoca o scadenza. I membri vedono i propri inviti; gli amministratori sospesi o scaduti non possono gestirli.
- Invio email tramite Resend opzionale, distinto dalla creazione del link e dall’effettiva ricezione nella casella.
- Provisioning senza password, anteprima predefinita e scrittura con `--apply`. Gli account e i dati personali già presenti non vengono sovrascritti. Duplicati e conflitti interrompono il piano prima delle scritture.

## Backend attivato tramite CLI

Con l’account proprietario `allenakinbuli@gmail.com` è stata completata l’autenticazione CLI e il collegamento al progetto `dkfxadhqgmsaydivceia`.

- Snapshot dei dati pubblici prima della migrazione: `.local/activation/backup-public-before.json`, verificato con 63 profili, 3 eventi e 86 presenze. Include anche le definizioni dei trigger e delle funzioni interessate; non è un dump completo dell’intera infrastruttura.
- Applicata `supabase/migration-inviti.sql`: tabella inviti, indici, RLS, risposta amministrata e protezione dei profili. Dati esistenti conservati.
- QA sul database remoto in una transazione poi annullata: isolamento degli inviti, risposta, blocco dopo revoca/scadenza, impossibilità di autopromozione o riattivazione dell’admin sospeso, rifiuto email non confermata e sincronizzazione dopo conferma. Esito PASS; nessun account QA residuo e nessun invito reale creato.
- Configurazione Auth applicata con CLI e verificata con diff: Site URL `https://www.orbitae.club`; redirect espliciti `/login` e `/account` su dominio canonico, dominio senza www e ambiente locale `127.0.0.1:3108`; Secure email change disattivato e conferma email mantenuta. Per il cambio è sufficiente confermare la nuova casella.
- Verifica Supabase Auth reale con magic link tecnico generato senza invio email: accesso riuscito, stesso ID profilo, lettura inviti autorizzata, riutilizzo del link respinto. La sessione del test API è stata chiusa; questa prova non attesta la consegna nella casella né il collaudo visuale.
- Non sono state migrate automaticamente le 48 identità storiche alle caselle personali: restano conservate fino alla conferma del titolare.

La configurazione circoscritta usata dalla CLI e le prove sono nella cartella locale `.local/activation/`, esclusa da Git. Non eseguire `db reset` o le vecchie migrazioni distruttive degli eventi.

## Invio email e pubblicazione ancora necessari

Il cliente ha scelto il magic link di Supabase. Si usa il template standard con link cliccabile; non occorre modificare il template per questo flusso. Il supporto al codice resta disponibile se viene configurata una mail che lo contiene.

L’invio ai membri richiede un mittente SMTP personalizzato, attualmente assente. Il provider predefinito di Supabase limita gli invii ai collaboratori del progetto: vale anche per i magic link. Il tentativo di impostare i template personalizzati tramite CLI ha restituito HTTP 400: «Email template modification is not available for free tier projects using the default email provider». Nessun aggiornamento del piano è stato eseguito. Il successivo aggiornamento Auth, privo di personalizzazioni dei template, è invece riuscito.

Per completare:

1. Collegare una casella o un provider SMTP con mittente verificato. Supabase Auth continuerà a generare e verificare i magic link; SMTP effettua la consegna.
2. Per gli inviti evento via email configurare anche `RESEND_API_KEY` e `INVITATIONS_FROM_EMAIL`, oppure adattare l’invio al provider approvato. La creazione di link personali e gli inviti nel portale sono indipendenti dal servizio email.
3. Configurare il deployment con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` solo server e `NEXT_PUBLIC_SITE_URL=https://www.orbitae.club`.
4. Verificare ricezione su una casella controllata: link valido, già usato e scaduto; email sconosciuta senza registrazione; cambio email conservando ID/ruolo/presenze; invito membro/ospite e revoca.
5. Pubblicare e verificare una nuova sessione sul dominio live. La CLI Vercel attuale non accede al progetto collegato: non è stata eseguita una pubblicazione. Il login dei nuovi membri non è ancora attestato in produzione.

Non sono state inviate email ai membri reali durante questa attività.

## Importazioni successive

Un JSON contiene nome, email personale, azienda, bio e LinkedIn facoltativi. Per account già esistenti si può indicare `profileId` dopo averne verificato l’identità; un nome già presente con email differente viene fermato per evitare duplicati. Il file deve restare fuori da Git.

```sh
npm run users:provision -- --input /percorso/membri.json --event UUID_EPISODIO
npm run users:provision -- --input /percorso/membri.json --event UUID_EPISODIO --apply
```

## Prove raccolte

Build di produzione e TypeScript passati; ESLint passato sui file della funzionalità. 20 test passati. La suite `npm test` esegue anche la migrazione SQL reale su Postgres PGlite con le politiche RLS: isolamento membri, blocco amministratore sospeso, revoca/scadenza, impossibilità di autopromozione e sincronizzazione dell’email confermata senza perdere presenze. Il database remoto è stato inoltre verificato con la transazione QA descritta sopra; la ricezione email resta da verificare.

Le API locali rifiutano chiamate amministrative senza sessione (403) e token malformati (404). Il detector Impeccable non rileva problemi deterministici sulle quattro schermate modificate. Il collaudo visuale desktop/mobile completo non è concluso: il browser integrato non è disponibile e il controllo nativo di Chrome è condiviso con l’utente attivo.

Il lint dell’intero repository segnala inoltre due errori preesistenti `set-state-in-effect` nella Home e in CookieConsent, esterni a questa funzionalità.

Fonti tecniche: [Supabase email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [template Auth](https://supabase.com/docs/guides/auth/auth-email-templates), [creazione amministrativa utenti](https://supabase.com/docs/reference/javascript/auth-admin-createuser).
