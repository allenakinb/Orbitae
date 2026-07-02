import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stat({
  icon: Icon,
  value,
  label,
  href,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  href?: string;
}) {
  const base =
    "group relative block rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-colors duration-200 hover:border-border-strong";

  const body = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-[var(--radius)] bg-accent-soft text-accent">
        <Icon size={17} strokeWidth={2} />
      </span>
      <div className="mt-3 font-display text-2xl leading-none tabular-nums text-ink">
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
      {href && (
        <ArrowUpRight
          size={15}
          aria-hidden
          className="absolute right-3 top-3 text-ink-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:text-accent"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, "hover:border-accent/60")}>
        {body}
      </Link>
    );
  }

  return <div className={base}>{body}</div>;
}
