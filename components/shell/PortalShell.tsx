"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Sidebar } from "./Sidebar";
import { Logo } from "@/components/brand/Logo";
import { OrbitMark } from "@/components/brand/OrbitMark";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  // Desktop-only: the sidebar can be collapsed to give the content the
  // full width; a floating button at top-left brings it back.
  const [collapsed, setCollapsed] = useState(false);

  // Route guard — bounce to login once the session is known to be empty.
  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // Close the mobile drawer on navigation.
  useEffect(() => setDrawer(false), [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <OrbitMark
          size={72}
          density={1.4}
          spin
          className="opacity-80 motion-safe:animate-[orbit-pulse_2.4s_ease-in-out_infinite]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-dvh",
        collapsed ? "lg:grid lg:grid-cols-[1fr]" : "lg:grid lg:grid-cols-[268px_1fr]",
      )}
    >
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh border-r border-border bg-bg",
          !collapsed && "lg:block",
        )}
      >
        <Sidebar onCollapse={() => setCollapsed(true)} />
      </aside>

      {/* Desktop reopen button — top-left, shown when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Apri il menu"
          className="fixed left-4 top-4 z-[var(--z-sticky)] hidden rounded-[var(--radius)] border border-border bg-elevated/90 p-2 text-ink-muted shadow-lg backdrop-blur-md transition-colors hover:text-ink lg:block"
        >
          <PanelLeft size={20} />
        </button>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-[var(--z-sticky)] flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Logo markSize={28} />
        <button
          onClick={() => setDrawer(true)}
          aria-label="Apri il menu"
          className="rounded-[var(--radius)] p-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <div className="lg:hidden">
          <button
            aria-label="Chiudi il menu"
            onClick={() => setDrawer(false)}
            className="fixed inset-0 z-[var(--z-drawer)] bg-black/60 backdrop-blur-sm motion-safe:animate-[fade-rise_0.2s_ease]"
          />
          <div className="fixed inset-y-0 left-0 z-[var(--z-drawer)] w-[min(82vw,300px)] border-r border-border bg-bg shadow-2xl motion-safe:animate-[fade-rise_0.25s_var(--ease-out-expo)]">
            <button
              onClick={() => setDrawer(false)}
              aria-label="Chiudi"
              className="absolute right-3 top-4 z-10 rounded-[var(--radius)] p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={20} />
            </button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0">{children}</main>
    </div>
  );
}
