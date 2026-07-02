import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-[var(--radius)] border border-border bg-bg/40 px-3.5 text-ink placeholder:text-ink-faint transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft";

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-sm font-medium text-ink-muted",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, "h-11", props.className)} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(fieldBase, "min-h-28 resize-y py-2.5", props.className)}
    />
  );
}

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a08c84' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        backgroundImage: CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.7rem center",
        ...props.style,
      }}
      className={cn(
        fieldBase,
        "h-11 cursor-pointer appearance-none pr-9",
        props.className,
      )}
    />
  );
}
