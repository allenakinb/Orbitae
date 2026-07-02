import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold whitespace-nowrap transition-all duration-150 ease-[var(--ease-out-quart)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-press shadow-[0_6px_20px_-8px_var(--color-accent-glow)] hover:shadow-[0_8px_26px_-8px_var(--color-accent-glow)]",
  outline:
    "border border-border-strong text-ink hover:border-accent hover:text-accent bg-transparent",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-2",
  danger:
    "border border-border-strong text-ink hover:border-[var(--color-accent)] hover:text-accent bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
