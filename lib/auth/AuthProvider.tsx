"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { demoRepo } from "@/lib/data/store";
import { useProfile } from "@/lib/data/hooks";
import type { Profile } from "@/lib/data/types";

const SESSION_KEY = "orbitae:session:v1";

interface AuthContextValue {
  user: Profile | undefined;
  userId: string | null;
  ready: boolean; // session restored from storage
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Login disabled: every visit starts as the seeded admin, synchronously,
// so the shell renders on the first paint (no loading flash).
const DEFAULT_USER_ID = "u-lorenzo-scisciani";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(DEFAULT_USER_ID);
  const [ready] = useState(true);

  // Restore a previously stored demo session (client-only → no hydration clash).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored && demoRepo.getProfile(stored)) {
        setUserId(stored);
      } else {
        window.localStorage.setItem(SESSION_KEY, DEFAULT_USER_ID);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const user = useProfile(userId ?? undefined);

  // If the active member is suspended/expired elsewhere, drop the session.
  useEffect(() => {
    if (!ready || !userId) return;
    if (user && (user.status === "suspended" || user.status === "expired")) {
      window.localStorage.removeItem(SESSION_KEY);
      setUserId(null);
    }
  }, [ready, userId, user]);

  const login = useCallback((email: string, password: string) => {
    const profile = demoRepo.authenticate(email, password);
    if (!profile) {
      return {
        ok: false,
        error: "Credenziali non valide o accesso non abilitato.",
      };
    }
    try {
      window.localStorage.setItem(SESSION_KEY, profile.id);
    } catch {
      /* ignore */
    }
    setUserId(profile.id);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUserId(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, userId, ready, login, logout }),
    [user, userId, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
