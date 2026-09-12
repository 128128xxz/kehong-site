import { UAParser } from "ua-parser-js";
import { isbot } from "isbot";
import type { BotStatus, DeviceType } from "./digest-types";

const MAX_UA_LENGTH = 1_024;

function normalizeUserAgent(value: string | null | undefined) {
  return typeof value === "string" ? value.trim().slice(0, MAX_UA_LENGTH) : "";
}

function detectHeadless(userAgent: string) {
  return /headless|puppeteer|playwright|selenium|phantom/i.test(userAgent);
}

export type ParsedUserAgent = {
  userAgent: string;
  browser: string | null;
  os: string | null;
  deviceType: DeviceType;
};

export function parseUserAgentHeader(userAgent: string | null | undefined): ParsedUserAgent {
  const normalized = normalizeUserAgent(userAgent);
  const parsed = new UAParser(normalized).getResult();
  const browser = parsed.browser.name?.trim().slice(0, 80) ?? null;
  const os = parsed.os.name?.trim().slice(0, 80) ?? null;
  let deviceType: DeviceType = "unknown";
  if (normalized && isbot(normalized)) deviceType = "bot";
  else if (parsed.device.type === "tablet") deviceType = "tablet";
  else if (parsed.device.type === "mobile") deviceType = "mobile";
  else if (normalized) deviceType = "desktop";
  return { userAgent: normalized, browser, os, deviceType: normalized ? deviceType : "unknown" };
}

export function isHeadlessUserAgent(userAgent: string) {
  return Boolean(userAgent && (isbot(userAgent) || detectHeadless(userAgent)));
}

export function classifyBotStatusFromUA(userAgent: string | null): BotStatus {
  if (!userAgent) return "possible_bot";
  if (isbot(userAgent)) return "probable_bot";
  if (detectHeadless(userAgent)) return "probable_bot";
  return "not_bot";
}
