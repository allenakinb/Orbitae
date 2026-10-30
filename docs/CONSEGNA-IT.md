# Consegna infrastruttura Orbitae

Documento operativo da completare con i riferimenti dei titolari e le verifiche live prima della consegna.

## Componenti

- Applicazione Next.js 16 / React 19 / TypeScript.
- Hosting atteso: Vercel, dominio pubblico `orbitae.club`.
- Backend Supabase: progetto `dkfxadhqgmsaydivceia`; Auth, Postgres, politiche RLS.
- Accessi: vecchie credenziali durante la migrazione, email personale e OTP dopo la conferma.
- Inviti: dati Postgres, API server amministrative, pagina ospite `/invito/[token]`; Resend opzionale per le email degli eventi.

## Variabili

| Variabile | Ambito | Utilizzo |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Client/server | URL del progetto |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client/server | Chiave pubblica, protetta da RLS |
| SUPABASE_SERVICE_ROLE_KEY | Solo server | Amministrazione utenti e inviti |
| NEXT_PUBLIC_SITE_URL | Client/server | Dominio dei link invito |
| RESEND_API_KEY | Solo server | Invio email eventi, opzionale |
| INVITATIONS_FROM_EMAIL | Solo server | Mittente verificato |

Le chiavi vanno trasferite con un gestore di segreti o tramite invito ai servizi, senza inserirle nella documentazione o negli export pubblici. Il repository contiene uno storico script di provisioning con credenziali: non usarlo per riesportare o rigenerare le password durante la migrazione.

## Avvio e verifiche

```sh
npm ci
npm run dev
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
npm run build
```

Il server locale disponibile usa la porta 3108. Le dipendenze sono state reinstallate nel progetto; eventuali vecchie dipendenze in cache restano separate. Per un nuovo ambiente installare dal lockfile in una cartella non gestita da iCloud.

## Passaggio di titolarità da verificare

1. Repository: accesso dell'IT, branch, cronologia e istruzioni di build.
2. Vercel: invito al team/progetto, variabili di produzione e preview, deploy e rollback.
3. Dominio/DNS: registrar, titolare, record attuali e rinnovo.
4. Supabase: accesso organizzazione/progetto, backup, RLS, template e provider Auth, impostazioni SMTP.
5. Provider email: accesso del titolare, dominio mittente e DNS, limiti e log.
6. Collaudo completo usando `ATTIVAZIONE-ACCESSI-INVITI.md` e conferma del nuovo responsabile IT.
7. Eventuale rotazione delle chiavi dopo il trasferimento e rimozione degli accessi tecnici precedenti solo dopo verifica della continuità del servizio.

Non è stato attestato alcun pagamento, trasferito alcun account o revocato alcun accesso. La consegna è da concordare con il destinatario indicato dal cliente.
