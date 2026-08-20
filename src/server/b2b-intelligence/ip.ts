import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { isProductionEnvironment } from "./config";

function normalizeMappedIpv4(value: string) {
  const match = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/iu);
  return match?.[1] ?? value;
}

export function normalizeIp(value: string | null | undefined) {
  const candidate = value?.trim().split("%")[0] ?? "";
  if (!candidate) return null;
  const normalized = normalizeMappedIpv4(candidate);
  return isIP(normalized) ? normalized.toLowerCase() : null;
}

function isPrivateIpv4(value: string) {
  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}

export function isPublicRoutableIp(value: string | null | undefined) {
  const normalized = normalizeIp(value);
  if (!normalized) return false;
  if (isIP(normalized) === 4) return !isPrivateIpv4(normalized);
  const compact = normalized.replace(/^\[|\]$/gu, "");
  return compact !== "::1" && !compact.startsWith("fc") && !compact.startsWith("fd") && !compact.startsWith("fe8") && !compact.startsWith("fe9") && !compact.startsWith("fea") && !compact.startsWith("feb") && !compact.startsWith("ff");
}

function candidateHeaders(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").map((value) => value.trim()) ?? [];
  return [request.headers.get("x-real-ip"), ...forwarded].filter((value): value is string => Boolean(value));
}

export function extractTrustedClientIp(request: Request) {
  const hasVercelTrustMarker = process.env.VERCEL === "1" || Boolean(request.headers.get("x-vercel-id"));
  if (!hasVercelTrustMarker && isProductionEnvironment()) return null;
  return candidateHeaders(request).map(normalizeIp).find((value) => isPublicRoutableIp(value)) ?? null;
}

export function hashIp(ip: string | null | undefined) {
  const normalized = normalizeIp(ip);
  if (!normalized || !isPublicRoutableIp(normalized)) return null;
  const secret = process.env.IP_HASH_SECRET?.trim() || (!isProductionEnvironment() ? "development-only-ip-hash-secret" : "");
  if (!secret) return null;
  return createHmac("sha256", secret).update(normalized).digest("hex");
}
