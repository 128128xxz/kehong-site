import type { VisitorEventRecord } from "./types";

export function visitSessionKey(event: Pick<VisitorEventRecord, "companyIdentity" | "ipHash">) {
  if (!event.companyIdentity || !event.ipHash) return null;
  return `${event.companyIdentity}\u0000${event.ipHash}`;
}

export function isNewVisit(previousOccurredAt: string | null, currentOccurredAt: string, timeoutMinutes: number) {
  if (!previousOccurredAt) return true;
  return Date.parse(currentOccurredAt) - Date.parse(previousOccurredAt) >= timeoutMinutes * 60 * 1000;
}

export function countVisitSessions(events: VisitorEventRecord[], timeoutMinutes: number) {
  const latestBySession = new Map<string, string>();
  let visits = 0;
  for (const event of [...events].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))) {
    const key = visitSessionKey(event);
    if (!key) continue;
    const previous = latestBySession.get(key) ?? null;
    if (isNewVisit(previous, event.occurredAt, timeoutMinutes)) visits += 1;
    if (!previous || event.occurredAt > previous) latestBySession.set(key, event.occurredAt);
  }
  return visits;
}
