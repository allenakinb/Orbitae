"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useEventAttendees, useEvents } from "@/lib/data/hooks";
import { PageContainer } from "@/components/shell/PageContainer";
import { OrbitSystem } from "@/components/orbit/OrbitSystem";
import { EventCard } from "@/components/content/EventCard";
import { Select } from "@/components/ui/Field";
import { formatShortDate } from "@/lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 13) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default function HomePage() {
  const { user } = useAuth();
  const events = useEvents(); // dal più recente

  // Compute the time-based greeting after mount to avoid an SSR/client
  // hydration mismatch; "Bentornato" is a stable, time-neutral default.
  const [greet, setGreet] = useState("Bentornato");
  useEffect(() => setGreet(greeting()), []);

  // L'orbita racconta un evento per volta: si apre sull'ultimo.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = events.find((e) => e.id === selectedId) ?? events[0];
  const attendees = useEventAttendees(selected?.id);

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <PageContainer wide>
      {/* Keyboard/AT: skip the orbit straight to the event */}
      <a
        href="#eventi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-sticky)] focus:rounded-[var(--radius)] focus:border focus:border-border-strong focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        Salta al contenuto
      </a>

      {/* Hero — the orbit, centred, with the chosen event at its core */}
      <section
        aria-label="I partecipanti dell'evento in orbita"
        className="relative motion-safe:animate-fade-rise"
      >
        {events.length > 0 && (
          <Select
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="Seleziona evento"
            className="mb-4 h-9 text-sm sm:absolute sm:left-0 sm:top-0 sm:z-20 sm:mb-0 sm:w-auto sm:max-w-[19rem]"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {formatShortDate(e.date)} — {e.title}
              </option>
            ))}
          </Select>
        )}

        <header className="text-center">
          <p className="text-sm text-ink-muted" suppressHydrationWarning>
            {greet},
          </p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {firstName}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            {selected
              ? `${attendees.length} persone in orbita attorno a «${selected.title}». Passa sopra un avatar per scoprirle.`
              : "Nessun evento da mostrare."}
          </p>
        </header>

        <div className="mx-auto mt-4 w-full max-w-[680px]">
          {attendees.length > 0 ? (
            <OrbitSystem members={attendees} centerLabel={selected?.title} />
          ) : (
            <p className="py-12 text-center text-sm text-ink-muted">
              Nessun partecipante registrato per questo evento.
            </p>
          )}
        </div>
      </section>

      {/* Quick numbers — a quiet editorial strip, not a card row */}
      <section
        aria-label="I numeri del club"
        className="mt-10 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 border-y border-border py-4"
      >
        {[
          { value: attendees.length, label: "partecipanti", href: "#eventi" },
        ].map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <span aria-hidden className="text-ink-faint">
                ·
              </span>
            )}
            <Link
              href={s.href}
              className="group inline-flex items-baseline gap-1.5 px-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <span className="font-display text-lg tabular-nums text-ink transition-colors group-hover:text-accent">
                {s.value}
              </span>
              {s.label}
            </Link>
          </Fragment>
        ))}
      </section>

      {/* The chosen event, told in full — same card as the Bacheca */}
      <section id="eventi" className="mx-auto mt-8 max-w-2xl scroll-mt-6">
        <h2 className="mb-3 font-display text-lg text-ink">L&apos;evento</h2>
        {!selected ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-6 text-center">
            <p className="text-sm text-ink-muted">Nessun evento in bacheca.</p>
          </div>
        ) : (
          <EventCard event={selected} />
        )}
      </section>
    </PageContainer>
  );
}
