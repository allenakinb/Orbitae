// Italian-locale formatting helpers.

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dayMonthFmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDayMonth(iso: string): string {
  return dayMonthFmt.format(new Date(iso));
}

// "oggi", "ieri", "3 giorni fa", or an absolute date for older items.
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / 86_400_000);
  if (days <= 0) return "oggi";
  if (days === 1) return "ieri";
  if (days < 7) return `${days} giorni fa`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? "1 settimana fa" : `${w} settimane fa`;
  }
  return formatDate(iso);
}
