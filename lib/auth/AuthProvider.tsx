"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { clearStore, loadAll } from "@/lib/data/store";
import { withDeadline } from "./session";
import { snapshot } from "@/lib/data/store";
import { useProfile } from "@/lib/data/hooks";
import type { Profile } from "@/lib/data/types";

interface AuthContextValue {
  user: Profile | undefined;
  userId: string | null;
  sessionError: string | null;
  ready: boolean; // session verified (and data loaded, if signed in)
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  loginWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  requestAccessLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loginError(message: string, code?: string): string {
  if (code === "otp_disabled" || /signups not allowed for otp/i.test(message))
    return "Accesso con questa email non disponibile. Usa l’indirizzo già associato al tuo account Orbitae oppure contatta la segreteria.";
  if (code === "otp_expired" || /token.*expired|invalid.*token/i.test(message))
    return "Codice non valido o scaduto. Richiedi un nuovo codice.";
  if (/invalid login credentials/i.test(message))
    return "Credenziali non valide.";
  if (/rate limit|too many/i.test(message))
    return "Troppi tentativi: riprova tra qualche minuto.";
  if (/email.*not authorized|not.*allowed.*email|email address not authorized/i.test(message))
    return "L’invio email del portale non è ancora attivo. Contatta la segreteria del club.";
  return "Accesso non riuscito. Riprova.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Auth callbacks must stay synchronous. All data work runs after the SDK
  // releases its session lock; failed hydration remains recoverable in the UI.
  useEffect(() => {
    let cancelled = false;
    let revision = 0;
    let scheduled: ReturnType<typeof setTimeout> | undefined;
    let loading: { uid: string; promise: Promise<boolean> } | null = null;

    async function hydrate(uid: string | null, ticket: number) {
      try {
        if (uid) {
          if (!loading || loading.uid !== uid) loading = { uid, promise: loadAll() };
          const task = loading;
          const loaded = await withDeadline(task.promise);
          if (loading === task) loading = null;
          if (!loaded) throw new Error("Profile data unavailable");
          const profile = snapshot().profiles.find(p => p.id === uid);
          if (!profile || profile.status === "suspended" || profile.status === "expired") throw new Error("Profile unavailable");
        }
        if (cancelled || ticket !== revision) return;
        setSessionError(null);
        setUserId(uid);
      } catch {
        if (cancelled || ticket !== revision) return;
        setSessionError("Non riusciamo a caricare il tuo account. Controlla la connessione e riprova.");
      } finally {
        if (!cancelled && ticket === revision) setReady(true);
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        revision++;
        clearStore(); setUserId(null); setSessionError(null); setReady(true);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        const ticket = ++revision;
        clearTimeout(scheduled);
        scheduled = setTimeout(() => { void hydrate(session?.user.id ?? null, ticket); }, 0);
      }
    });

    const initialTicket = revision;
    void withDeadline(supabase.auth.getSession()).then(({ data, error }) => {
      if (cancelled || initialTicket !== revision) return;
      if (error) throw error;
      return hydrate(data.session?.user.id ?? null, initialTicket);
    }).catch(() => {
      if (!cancelled && initialTicket === revision) {
        setSessionError("Sessione non disponibile. Ricarica la pagina per riprovare.");
        setReady(true);
      }
    });

    return () => { cancelled = true; clearTimeout(scheduled); sub.subscription.unsubscribe(); };
  }, []);

  const user = useProfile(userId ?? undefined);

  const logout = useCallback(() => {
    setUserId(null);
    setSessionError(null);
    clearStore();
    void supabase.auth.signOut();
  }, []);

  // A member suspended/expired elsewhere loses the session on the spot.
  // (Deferred to a microtask: signOut is an external system, not render state.)
  useEffect(() => {
    if (user && (user.status === "suspended" || user.status === "expired")) {
      queueMicrotask(logout);
    }
  }, [user, logout]);

  const login = useCallback(
    async (email: string, token: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: "email",
      });
      if (error || !data.user) return { ok: false, error: loginError(error?.message ?? "invalid code", error?.code) };

      if (!await withDeadline(loadAll())) { logout(); return { ok: false, error: "Impossibile caricare il profilo. Riprova." }; }
      const { data: row } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .single();
      if (!row || row.status === "suspended" || row.status === "expired") {
        logout();
        return {
          ok: false,
          error: "Accesso non abilitato: contatta la segreteria del club.",
        };
      }
      setUserId(data.user.id);
      return { ok: true };
    },
    [logout],
  );

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return { ok: false, error: loginError(error?.message ?? "invalid login credentials", error?.code) };
    const { data: profile, error: profileError } = await supabase.from("profiles").select("status").eq("id", data.user.id).single();
    if (profileError || !profile || profile.status === "suspended" || profile.status === "expired") {
      logout(); return { ok: false, error: "Accesso non abilitato: contatta la segreteria." };
    }
    if (!await loadAll()) { logout(); return { ok: false, error: "Impossibile caricare il profilo. Riprova." }; }
    setUserId(data.user.id);
    return { ok: true };
  }, [logout]);

  const requestAccessLink = useCallback(async (email: string) => {
    if (email.trim().toLowerCase().endsWith("@orbitae.club")) return { ok: false, error: "Per ricevere il link usa l’email personale o di lavoro già presente nel tuo profilo Orbitae. Gli indirizzi @orbitae.club non ricevono il link." };
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/login` } });
    return error ? { ok: false, error: loginError(error.message, error.code) } : { ok: true };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, userId, ready, sessionError, login, loginWithPassword, requestAccessLink, logout }),
    [user, userId, ready, sessionError, login, loginWithPassword, requestAccessLink, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
