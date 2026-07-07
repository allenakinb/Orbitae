"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "orbitae-cookie-consent";

type Choice = "all" | "essential";

// Minimal GDPR-style consent banner. Orbitae only sets essential cookies
// (Supabase auth session), so there are no trackers to gate — the banner
// records the user's choice and stays hidden afterwards. The choice is
// kept in localStorage, not a cookie, so no cookie is set before consent.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  // Read after mount to avoid an SSR/client hydration mismatch.
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage blocked (private mode / cookies off): show the banner.
      setVisible(true);
    }
  }, []);

  function decide(choice: Choice) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, at: new Date().toISOString() }),
      );
    } catch {
      // ignore write failures
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferenze cookie"
      className="fixed inset-x-3 bottom-3 z-[var(--z-drawer)] mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-border bg-elevated/95 p-4 shadow-2xl backdrop-blur-md motion-safe:animate-fade-rise sm:inset-x-auto sm:right-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="text-sm leading-relaxed text-ink-muted">
          Usiamo solo cookie tecnici necessari al funzionamento del portale
          (accesso e sessione). Nessun cookie di profilazione.{" "}
          <Link
            href="/privacy"
            className="font-medium text-ink underline underline-offset-2 transition-colors hover:text-accent"
          >
            Informativa privacy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => decide("essential")}
          >
            Solo necessari
          </Button>
          <Button size="sm" onClick={() => decide("all")}>
            Accetta
          </Button>
        </div>
      </div>
    </div>
  );
}
