"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { OrbitMark } from "@/components/brand/OrbitMark";
import { Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Field";

export default function LoginPage() {
  const { login, loginWithPassword, requestAccessLink, user, ready, sessionError } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [legacy, setLegacy] = useState(false);
  const [sent, setSent] = useState(false);
  const [useCode, setUseCode] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Already signed in → straight to the orbit.
  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
    const verifyingCode = sent && useCode;
    const res = legacy ? await loginWithPassword(email, password) : verifyingCode ? await login(email, password) : await requestAccessLink(email);
    if (res.ok && !legacy && !verifyingCode) { setSent(true); return; }
    if (!res.ok) {
      setError(res.error ?? "Accesso non riuscito.");
      setPending(false);
      return;
    }
    router.replace("/");
    } catch { setError("Connessione non disponibile. Riprova."); } finally { setPending(false); }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-12">
      {/* Ambient mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[18%] top-1/2 hidden -translate-y-1/2 opacity-[0.07] sm:block"
      >
        <OrbitMark size={760} density={1.1} spin />
      </div>

      <div className="relative w-full max-w-[400px] motion-safe:animate-fade-rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <OrbitMark size={66} density={1.5} className="mb-5" />
          <Wordmark className="text-3xl" />
          <p className="mt-3 text-sm text-ink-muted">
            Accesso riservato ai membri del network.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[var(--radius-xl)] border border-border bg-surface/80 p-6 backdrop-blur-sm sm:p-7"
        >
          <div className="flex flex-col gap-4">
            <button type="button" disabled={pending} className="text-sm text-accent underline underline-offset-4" onClick={() => { setLegacy(!legacy); setSent(false); setUseCode(false); setPassword(""); setEmail(""); setError(null); }}>
              {legacy ? "Accedi con un link email" : "Accedi con email e password"}
            </button>
            <p className="text-sm text-ink-muted">{legacy ? "Usa l’email già associata al tuo account Orbitae e la tua password." : "Inserisci l’email personale o di lavoro già presente nel tuo profilo Orbitae per ricevere il link di accesso."}</p>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={legacy ? "Email del tuo account" : "La tua email personale o di lavoro"}
                disabled={sent || pending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            {((sent && useCode) || legacy) && <div>
              <Label htmlFor="password">{legacy ? "Password attuale" : "Codice ricevuto via email"}</Label>
              <Input
                id="password"
                type={legacy ? "password" : "text"}
                inputMode={legacy ? undefined : "numeric"}
                autoComplete={legacy ? "current-password" : "one-time-code"}
                placeholder={legacy ? "La tua password attuale" : "Codice email"}
                disabled={pending}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>}
            {sent && <p role="status" className="text-sm text-ink-muted">Se l’email è abilitata, riceverai un link per accedere. Aprilo dalla tua casella di posta. Controlla anche lo spam.</p>}
            {sent && !useCode && <button type="button" disabled={pending} className="text-sm underline underline-offset-4" onClick={() => setUseCode(true)}>Ho ricevuto un codice da inserire</button>}
            {sent && <button type="button" disabled={pending} className="text-sm underline underline-offset-4" onClick={() => { setSent(false); setUseCode(false); setPassword(""); setError(null); }}>Usa un’altra email o richiedi un nuovo link</button>}

            {(error || sessionError) && (
              <p
                role="alert"
                className="rounded-[var(--radius)] border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-hover"
              >
                {error || sessionError}
              </p>
            )}

            {(!sent || useCode || legacy) && <Button type="submit" disabled={pending} className="mt-1 w-full">
              {pending ? "Attendi…" : legacy ? "Accedi" : sent && useCode ? "Verifica e accedi" : "Invia link di accesso"}
              {!pending && <ArrowRight size={17} />}
            </Button>}
          </div>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
          <Lock size={12} /> Accesso solo su invito · link sulla tua email
        </p>
      </div>
    </main>
  );
}
