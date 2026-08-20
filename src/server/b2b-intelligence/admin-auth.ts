import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "kehong_admin_session";
const sessionHours = 8;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function secret() { return process.env.ADMIN_ACCESS_SECRET?.trim() ?? ""; }
function signature(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminSecretConfigured() { return Boolean(secret()); }

export function verifyAdminSecret(value: unknown) {
  if (!secret() || typeof value !== "string") return false;
  return safeEqual(value, secret());
}

function cookieValue(request: Request) {
  const cookies = request.headers.get("cookie")?.split(";").map((item) => item.trim()) ?? [];
  return cookies.find((item) => item.startsWith(`${adminCookieName}=`))?.slice(adminCookieName.length + 1) ?? "";
}

export function hasAdminSession(request: Request) {
  if (!secret()) return false;
  const [encoded, suppliedSignature] = cookieValue(request).split(".");
  if (!encoded || !suppliedSignature || !safeEqual(suppliedSignature, signature(encoded))) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function adminSessionCookie() {
  const encoded = Buffer.from(JSON.stringify({ exp: Date.now() + sessionHours * 60 * 60 * 1000 }), "utf8").toString("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${adminCookieName}=${encoded}.${signature(encoded)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionHours * 60 * 60}${secure}`;
}

export function clearAdminSessionCookie() {
  return `${adminCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function adminOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  return origin === new URL(request.url).origin || origin === (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL)?.replace(/\/$/u, "");
}

export function allowAdminAttempt(request: Request, success: boolean) {
  const key = createHmac("sha256", "admin-attempt-key").update(`${request.headers.get("user-agent") ?? "unknown"}|${request.headers.get("origin") ?? "unknown"}`).digest("hex");
  const current = failedAttempts.get(key);
  if (current && current.resetAt <= Date.now()) failedAttempts.delete(key);
  if (success) {
    failedAttempts.delete(key);
    return true;
  }
  const next = failedAttempts.get(key) ?? { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  next.count += 1;
  failedAttempts.set(key, next);
  return next.count <= 10;
}
