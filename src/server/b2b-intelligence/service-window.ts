import type { DigestWindowKind } from "./digest-types";

const timeZone = "Asia/Shanghai";

function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])) as { year: string; month: string; day: string; hour: string };
}

function localDate(date: Date) { const parts = localParts(date); return `${parts.year}-${parts.month}-${parts.day}`; }
function shiftDate(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

export function digestWindowForEvent(date: Date) {
  const day = localDate(date);
  const hour = Number(localParts(date).hour);
  if (hour < 12) return `${shiftDate(day, -1)}-18-12`;
  if (hour < 18) return `${day}-12-18`;
  return `${day}-18-12`;
}

export function digestWindowToSend(date: Date, kind: DigestWindowKind) {
  const day = localDate(date);
  return kind === "noon" ? `${shiftDate(day, -1)}-18-12` : `${day}-12-18`;
}

export function digestDayToSend(date: Date) {
  return shiftDate(localDate(date), -1);
}

export function digestWindowsForDay(day: string) {
  return [`${shiftDate(day, -1)}-18-12`, `${day}-12-18`, `${day}-18-12`];
}
