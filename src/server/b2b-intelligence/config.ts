export function isProductionEnvironment() {
  return process.env.VERCEL_ENV === "production";
}

export function visitorIntelligenceEnabled() {
  return process.env.B2B_VISITOR_INTELLIGENCE_ENABLED === "true";
}

export function integerEnv(name: string, fallback: number, min: number, max: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export const visitorConfig = {
  visitSessionTimeoutMinutes: integerEnv("VISIT_SESSION_TIMEOUT_MINUTES", 30, 1, 240),
  digestRetentionHours: integerEnv("B2B_DIGEST_RETENTION_HOURS", 48, 1, 168),
  digestSendEmpty: process.env.B2B_DIGEST_SEND_EMPTY !== "false",
};
