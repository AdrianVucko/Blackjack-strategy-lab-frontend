import i18n from "@/i18n";

function locale(): string {
  const lang = i18n.language ?? "";
  if (lang.startsWith("hr")) return "hr-HR";
  if (lang.startsWith("de")) return "de-DE";
  return "en-US";
}

function fixed(value: number, digits: number): string {
  return value.toLocaleString(locale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatInt(value: number): string {
  return value.toLocaleString(locale());
}

export function formatPct(value: number, digits = 2): string {
  return `${fixed(value, digits)}%`;
}

export function formatSigned(value: number, digits = 3): string {
  const formatted = fixed(value, digits);
  return value > 0 ? `+${formatted}` : formatted;
}

export function formatUnits(value: number, digits = 2): string {
  return `${formatSigned(value, digits)} u`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
