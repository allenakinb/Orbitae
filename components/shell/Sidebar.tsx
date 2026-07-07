"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV } from "@/lib/nav";
import { can, ROLE_LABEL } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// Shared icon frame: a fixed box keeps every row aligned, and the active
// item lights its icon in an accent-soft chip — the same chip language as the
// stat tiles and document rows. One accent signal, no SaaS rail, no red wash.
const ICON_BOX =
  "grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius)] transition-colors";

export function Sidebar({
  onNavigate,
  onCollapse,
}: {
  onNavigate?: () => void;
  onCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV.filter((i) => !i.perm || can(user.role, i.perm));

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-border px-2 pb-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center"
          aria-label="Orbitae — Home"
        >
          <Logo markSize={32} />
        </Link>
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Chiudi il menu"
            className="rounded-[var(--radius)] p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          if (item.soon) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-[var(--radius)] px-2 py-2.5 text-sm font-medium text-ink-faint"
                aria-disabled
              >
                <span className={cn(ICON_BOX, "text-ink-faint")}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
                <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">
                  Presto
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius)] px-2 py-2.5 text-sm transition-colors duration-150",
                active
                  ? "font-semibold text-ink"
                  : "font-medium text-ink-muted hover:bg-surface-2/60 hover:text-ink",
              )}
            >
              <span
                className={cn(
                  ICON_BOX,
                  active
                    ? "bg-accent-soft text-accent shadow-[0_0_16px_-3px_var(--color-accent-glow)]"
                    : "text-ink-faint group-hover:text-ink",
                )}
              >
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className="tracking-[0.01em]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <Link
          href="/account"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-2 transition-colors hover:bg-surface-2/60"
        >
          <Avatar profile={user} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">
              {user.name}
            </span>
            <span className="block text-xs text-ink-muted">
              {ROLE_LABEL[user.role]}
            </span>
          </span>
        </Link>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-[var(--radius)] px-2 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2/60 hover:text-ink"
        >
          <span className={cn(ICON_BOX, "text-ink-faint")}>
            <LogOut size={17} />
          </span>
          Esci
        </button>
      </div>
    </div>
  );
}
