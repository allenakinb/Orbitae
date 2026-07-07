"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import {
  useAnnouncements,
  useProfiles,
  useUpcomingEvents,
} from "@/lib/data/hooks";
import { PageContainer } from "@/components/shell/PageContainer";
import { OrbitSystem } from "@/components/orbit/OrbitSystem";
import { formatDate, formatDayMonth } from "@/lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 13) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default function HomePage() {
  const { user } = useAuth();
  const profiles = useProfiles();
  const announcements = useAnnouncements();
  const events = useUpcomingEvents();

  // Compute the time-based greeting after mount to avoid an SSR/client
  // hydration mismatch; "Bentornato" is a stable, time-neutral default.
  const [greet, setGreet] = useState("Bentornato");
  useEffect(() => setGreet(greeting()), []);

  const inOrbit = profiles.filter((p) => p.status !== "pending");
  const activeCount = profiles.filter((p) => p.status === "active").length;
  const firstName = user?.name.split(" ")[0] ?? "";
  const nextEvent = events[0];

  return (
    <PageContainer wide>
      {/* Keyboard/AT: skip the orbit straight to the next event */}
      <a
        href="#eventi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-sticky)] focus:rounded-[var(--radius)] focus:border focus:border-border-strong focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        Salta al contenuto
      </a>

      {/* Hero — the orbit, centred, with the next event at its core */}
      <section
        aria-label="I membri del network in orbita"
        className="motion-safe:animate-fade-rise"
      >
        <header className="text-center">
          <p className="text-sm text-ink-muted" suppressHydrationWarning>
            {greet},
          </p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {firstName}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            La tua orbita — {inOrbit.length} membri nel network. Passa sopra
            un avatar per scoprirli.
          </p>
        </header>
        <div className="mx-auto mt-4 w-full max-w-[680px]">
          <OrbitSystem members={inOrbit} centerLabel={nextEvent?.title} />
        </div>
      </section>

      {/* Quick numbers — a quiet editorial strip, not a card row */}
      <section
        aria-label="I numeri del club"
        className="mt-10 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 border-y border-border py-4"
      >
        {[
          {
            value: activeCount,
            label: "membri attivi",
            // La directory è riservata ad Admin/Staff: per i membri il
            // numero resta, il link punta all'orbita stessa.
            href: can(user?.role, "viewMembers") ? "/membri" : "#eventi",
          },
          { value: events.length, label: "prossimi eventi", href: "#eventi" },
          { value: announcements.length, label: "annunci", href: "/bacheca" },
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

      {/* Next event — a single, richer card */}
      <section id="eventi" className="mx-auto mt-8 max-w-2xl scroll-mt-6">
        <h2 className="mb-3 font-display text-lg text-ink">Prossimo evento</h2>
        {!nextEvent ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-6 text-center">
            <p className="text-sm text-ink-muted">Nessun evento in programma.</p>
          </div>
        ) : (
          <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                <span className="text-base font-bold leading-none">
                  {formatDayMonth(nextEvent.date).split(" ")[0]}
                </span>
                <span className="mt-0.5 text-[0.62rem] uppercase leading-none">
                  {formatDayMonth(nextEvent.date).split(" ")[1]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg text-ink sm:text-xl">
                  {nextEvent.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={15} className="text-ink-faint" />
                    {formatDate(nextEvent.date)}
                  </span>
                  {nextEvent.time && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={15} className="text-ink-faint" />
                      {nextEvent.time}
                    </span>
                  )}
                  {nextEvent.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} className="text-ink-faint" />
                      {nextEvent.location}
                    </span>
                  )}
                </div>
                {nextEvent.description && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {nextEvent.description}
                  </p>
                )}
              </div>
            </div>
          </article>
        )}
      </section>
    </PageContainer>
  );
}
