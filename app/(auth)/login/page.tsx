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
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Already signed in → straight to the orbit.
  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await login(email, password);
    if (!res.ok) {
      setError(res.error ?? "Accesso non riuscito.");
      setPending(false);
      return;
    }
    router.replace("/");
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
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@orbitae.club"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-[var(--radius)] border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-hover"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="mt-1 w-full">
              {pending ? "Accesso…" : "Entra"}
              {!pending && <ArrowRight size={17} />}
            </Button>
          </div>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
          <Lock size={12} /> Accesso solo su invito · credenziali dalla
          segreteria
        </p>
      </div>
    </main>
  );
}
