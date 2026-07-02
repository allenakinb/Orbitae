import type { LucideIcon } from "lucide-react";

export function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-colors duration-200 hover:border-border-strong">
      <span className="grid h-9 w-9 place-items-center rounded-[var(--radius)] bg-accent-soft text-accent">
        <Icon size={17} strokeWidth={2} />
      </span>
      <div className="mt-3 font-display text-2xl leading-none tabular-nums text-ink">
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  );
}
