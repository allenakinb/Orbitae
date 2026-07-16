import { cn } from "@/lib/cn";
import { TIER_LABEL } from "@/lib/auth/permissions";
import type { MemberStatus, Tier } from "@/lib/data/types";

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

// Lo stato è materia da pannello Admin: le pagine dei membri mostrano
// solo il tier.
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

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <Badge
      className={cn(
        "border",
        tier === "founder" &&
          "border-transparent bg-accent-soft text-accent-hover",
        tier === "ambassador" && "border-border-strong text-ink",
        tier === "member" && "border-border text-ink-muted",
      )}
    >
      {TIER_LABEL[tier]}
    </Badge>
  );
}
