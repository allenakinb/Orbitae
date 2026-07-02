import { avatarColor, avatarSheen, initials } from "@/lib/brand/avatar";
import { cn } from "@/lib/cn";
import type { Profile } from "@/lib/data/types";

interface AvatarProps {
  profile: Pick<Profile, "id" | "name" | "avatarUrl">;
  size?: number;
  className?: string;
  ring?: boolean;
}

// Circular avatar: uploaded photo when present, otherwise initials on a
// deterministic shade from the brand-red ramp.
export function Avatar({ profile, size = 44, className, ring }: AvatarProps) {
  const fontSize = Math.round(size * 0.38);
  const style: React.CSSProperties = profile.avatarUrl
    ? { width: size, height: size }
    : {
        width: size,
        height: size,
        fontSize,
        backgroundColor: avatarColor(profile.id),
        backgroundImage: `radial-gradient(circle at 32% 28%, ${avatarSheen(
          profile.id,
        )}, transparent 70%)`,
      };

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white",
        ring && "ring-2 ring-[var(--color-bg)]",
        className,
      )}
      style={style}
      aria-hidden
    >
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatarUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          style={{
            letterSpacing: "0.01em",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)",
          }}
        >
          {initials(profile.name)}
        </span>
      )}
    </span>
  );
}
