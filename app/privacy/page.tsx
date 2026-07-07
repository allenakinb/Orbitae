import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy & Cookie — Orbitae",
  description:
    "Informativa privacy e cookie del portale Orbitae, riservato ai membri del network.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-12 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Torna al portale
      </Link>

      <h1 className="mt-6 font-display text-3xl text-ink">
        Informativa Privacy &amp; Cookie
      </h1>
      <p className="mt-2 text-sm text-ink-faint">
        Ultimo aggiornamento: luglio 2026
      </p>

      <Section title="Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati è il club Orbitae. Per qualsiasi
          richiesta relativa ai tuoi dati puoi scrivere all&apos;indirizzo di
          contatto della segreteria del club.
        </p>
      </Section>

      <Section title="Quali dati trattiamo">
        <p>
          Il portale è riservato ai membri del network. Trattiamo i dati
          anagrafici e professionali forniti in fase di iscrizione: nome,
          email, azienda, settore, città, eventuale profilo LinkedIn, biografia
          e foto profilo.
        </p>
      </Section>

      <Section title="Finalità">
        <p>
          I dati sono utilizzati esclusivamente per gestire l&apos;accesso al
          portale, mostrare la directory dei membri agli utenti autorizzati e
          comunicare eventi e annunci del club. I dati non sono ceduti a terzi
          per finalità di marketing.
        </p>
      </Section>

      <Section title="Cookie">
        <p>
          Utilizziamo unicamente <strong>cookie tecnici necessari</strong> al
          funzionamento del portale: gestiscono l&apos;autenticazione e il
          mantenimento della sessione dopo l&apos;accesso. Questi cookie non
          richiedono consenso in quanto indispensabili al servizio.
        </p>
        <p>
          <strong>Non</strong> utilizziamo cookie di profilazione, pubblicitari
          o di analisi di terze parti. Il banner registra la tua scelta in
          memoria locale del browser, non tramite cookie.
        </p>
      </Section>

      <Section title="Conservazione">
        <p>
          I dati sono conservati per la durata dell&apos;iscrizione al club e
          rimossi su richiesta o al termine del rapporto associativo.
        </p>
      </Section>

      <Section title="I tuoi diritti">
        <p>
          Ai sensi del Regolamento (UE) 2016/679 (GDPR) hai diritto di accedere,
          rettificare, aggiornare o richiedere la cancellazione dei tuoi dati,
          nonché di opporti al trattamento. Puoi esercitare questi diritti
          contattando la segreteria del club.
        </p>
      </Section>
    </main>
  );
}
