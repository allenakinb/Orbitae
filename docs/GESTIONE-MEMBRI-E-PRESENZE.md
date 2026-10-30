# Membri e presenze degli incontri

Aggiornamento del 30 ottobre 2026.

## Uso per gli amministratori

1. In **Membri → Nuovo membro**, inserire nome e cognome, email personale o di lavoro e azienda facoltativa. Il profilo nasce come Member attivo; il ruolo di accesso resta membro. La creazione non invia email.
2. In **Bacheca → Nuovo evento** o **Modifica evento**, compilare l’incontro e, sotto Relatori e Moderatori, cercare i Presenti per nome o azienda.
3. Selezionare più persone; le persone scelte restano visibili come etichette e si rimuovono con la X. In modifica, le presenze già registrate sono preselezionate.
4. Se occorre creare qualcuno mentre si compila l’incontro, aprire Membri nella nuova scheda dal link del modulo, poi tornare e usare **Aggiorna elenco membri**. La bozza resta conservata nella scheda.
5. Salvare: incontro e presenze sono scritti nella stessa transazione. La Home ricava i pallini dalle presenze dell’episodio selezionato.
6. Un clic su un pallino apre la scheda del membro; spostare il mouse non la chiude. La chiusura avviene con X o Escape. Un altro clic seleziona un’altra persona.

L’email è necessaria per creare l’account di accesso. Per i sei membri storici senza email personale occorre recuperare e verificare gli indirizzi, senza creare profili duplicati.

## Attivazione e prove

- Applicata su Supabase la funzione `save_event_attendance` contenuta in `supabase/migration-presenze.sql`. Per un nuovo ambiente applicarla dopo schema e policy.
- La funzione usa i permessi dell’utente autenticato e verifica che sia un admin attivo.
- L’API `POST /api/members` verifica la sessione e il ruolo lato server, richiede la service role esclusivamente sul server e impedisce di scegliere ruoli privilegiati dal modulo.
- 21 test passati, inclusi salvataggio presenze, duplicati nella selezione, rimozione, rifiuto degli utenti non autorizzati e mancata modifica quando una persona non esiste.
- Build produzione, TypeScript e lint dei file modificati passati.
- QA transazionale remoto: creazione/modifica incontro e presenze, rollback e pulizia verificati.
- QA via API locale con backend remoto: nuovo membro, duplicate email (409), accesso anonimo (403), operazioni admin da membro (403), creazione incontro/presenza e rifiuto modifica da membro. Dati sintetici e sessioni di prova rimossi; prove locali in `.local/qa/`, escluse da Git.
- Verifica visuale completa non eseguita: il controllo nativo di Chrome è stato interrotto durante l’uso condiviso.
- Frontend e API sono locali, non pubblicati. Il precedente push di `main` resta bloccato dai permessi GitHub dell’account CLI.
