import { cn } from "@/lib/cn";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import type { MemberStatus, Role } from "@/lib/data/types";

export function Badge({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

const STATUS: Record<
  MemberStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  active: {
    label: "Attivo",
    dot: "var(--color-active)",
    text: "var(--color-active)",
    bg: "var(--color-active-soft)",
  },
  suspended: {
    label: "Sospeso",
    dot: "var(--color-suspended)",
    text: "var(--color-suspended)",
    bg: "var(--color-suspended-soft)",
  },
  expired: {
    label: "Scaduto",
    dot: "var(--color-expired)",
    text: "var(--color-ink-muted)",
    bg: "var(--color-expired-soft)",
  },
  pending: {
    label: "In attesa",
    dot: "var(--color-accent)",
    text: "var(--color-accent-hover)",
    bg: "var(--color-accent-soft)",
  },
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  const s = STATUS[status];
  return (
    <Badge style={{ color: s.text, backgroundColor: s.bg }}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: s.dot }}
      />
      {s.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const accent = role === "admin";
  const staff = role === "staff";
  return (
    <Badge
      className={cn(
        "border",
        accent && "border-transparent bg-accent-soft text-accent-hover",
        staff && "border-border-strong text-ink",
        role === "member" && "border-border text-ink-muted",
      )}
    >
      {ROLE_LABEL[role]}
    </Badge>
  );
}
