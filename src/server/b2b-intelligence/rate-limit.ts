import { createHash } from "node:crypto";
import { extractTrustedClientIp, hashIp } from "./ip";

const windowMs = 60_000;
const maxEvents = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function allowLeadEvent(request: Request) {
  const trustedIp = extractTrustedClientIp(request);
  const key = hashIp(trustedIp) ?? createHash("sha256").update(`${request.headers.get("origin") ?? "unknown"}|${request.headers.get("user-agent") ?? "unknown"}`).digest("hex");
  const current = buckets.get(key);
  const now = Date.now();
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= maxEvents) return false;
  current.count += 1;
  return true;
}

export function resetLeadEventRateLimit() {
  buckets.clear();
}
