import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-lg)] border border-border bg-surface",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// Section heading in the brand display face — "stesso font del logo".
export function SectionTitle({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 motion-safe:animate-fade-rise",
        className,
      )}
    >
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-[1.75rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-prose text-sm text-ink-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
