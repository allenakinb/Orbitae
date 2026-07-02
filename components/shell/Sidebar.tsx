"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
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

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV.filter((i) => !i.perm || can(user.role, i.perm));

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-4 flex items-center px-2 py-1"
        aria-label="Orbitae — Home"
      >
        <Logo markSize={32} />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          if (item.soon) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm text-ink-faint"
                aria-disabled
              >
                <Icon size={18} strokeWidth={2} />
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
                "group relative flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-accent-soft text-ink"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                size={18}
                strokeWidth={2}
                className={cn(
                  active ? "text-accent" : "text-ink-faint group-hover:text-ink",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[var(--radius-lg)] border border-border bg-surface p-3">
        <Link
          href="/membri"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <Avatar profile={user} size={38} />
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
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-border px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          <LogOut size={15} />
          Esci
        </button>
      </div>
    </div>
  );
}
