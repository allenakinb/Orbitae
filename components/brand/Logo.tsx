import { cn } from "@/lib/cn";
import { OrbitMark } from "./OrbitMark";

// The "ORBITAE" wordmark, set in the brand display face.
export function Wordmark({
  className,
  accent,
}: {
  className?: string;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "wordmark font-display leading-none",
        accent ? "text-accent" : "text-ink",
        className,
      )}
    >
      Orbitae
    </span>
  );
}

// Compact lockup for the sidebar / headers: small mark + wordmark.
export function Logo({
  className,
  markSize = 30,
  withWordmark = true,
}: {
  className?: string;
  markSize?: number;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <OrbitMark size={markSize} density={1.6} />
      {withWordmark && <Wordmark className="text-[1.05rem]" />}
    </span>
  );
}
