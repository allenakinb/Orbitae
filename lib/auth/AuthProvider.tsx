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
import { useProfile } from "@/lib/data/hooks";
import type { Profile } from "@/lib/data/types";

interface AuthContextValue {
  user: Profile | undefined;
  userId: string | null;
  ready: boolean; // session verified (and data loaded, if signed in)
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  changePassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loginError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "Credenziali non valide.";
  if (/rate limit|too many/i.test(message))
    return "Troppi tentativi: riprova tra qualche minuto.";
  return "Accesso non riuscito. Riprova.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the Supabase session on mount, then keep it in sync.
  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null;
      if (uid) await loadAll();
      if (cancelled) return;
      setUserId(uid);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearStore();
        setUserId(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = useProfile(userId ?? undefined);

  const logout = useCallback(() => {
    setUserId(null);
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
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, error: loginError(error.message) };

      await loadAll();
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

  const changePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return {
        ok: false,
        error: /weak|short|characters/i.test(error.message)
          ? "Password troppo debole: usa almeno 8 caratteri."
          : "Aggiornamento non riuscito. Riprova.",
      };
    }
    return { ok: true };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, userId, ready, login, logout, changePassword }),
    [user, userId, ready, login, logout, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
