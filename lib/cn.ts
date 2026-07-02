type ClassValue = string | number | false | null | undefined;

// Tiny class-name joiner. No dependency; trims falsy values.
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
