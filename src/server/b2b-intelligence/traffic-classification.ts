import type { BotStatus } from "./digest-types";

export type BotClassification = {
  botStatus: BotStatus;
  botReasons: string[];
};

type EventBurstState = { count: number; startedAt: number };

const RAPID_WINDOW_MS = 15_000;
const RAPID_EVENT_THRESHOLD = 8;
const burstState = new Map<string, EventBurstState>();

function isRapidRequests(seed: string) {
  const now = Date.now();
  const state = burstState.get(seed);
  if (!state || now - state.startedAt > RAPID_WINDOW_MS) {
    burstState.set(seed, { count: 1, startedAt: now });
    return false;
  }
  state.count += 1;
  burstState.set(seed, state);
  return state.count >= RAPID_EVENT_THRESHOLD;
}

export function classifyBotSignals(params: {
  userAgent: string;
  automationHint: boolean;
  eventSeed: string;
}): BotClassification {
  const probable = [] as string[];
  const rapid = isRapidRequests(params.eventSeed);
  if (params.automationHint) probable.push("automation_hint");
  if (/headless|puppeteer|playwright|selenium|phantom/i.test(params.userAgent)) probable.push("headless_ua");
  if (rapid) probable.push("rapid_repeat_requests");

  if (/bot|crawl|spider|crawler/i.test(params.userAgent)) probable.push("known_bot_ua");

  if (probable.length >= 2) {
    return { botStatus: "probable_bot", botReasons: probable };
  }

  if (probable.length === 1) {
    return { botStatus: "probable_bot", botReasons: probable };
  }

  if (!params.userAgent || params.userAgent.length < 10) {
    return { botStatus: "possible_bot", botReasons: ["weak_user_agent"] };
  }

  if (rapid) {
    return { botStatus: "possible_bot", botReasons: ["rapid_repeat_requests"] };
  }

  if (probable.length === 0) {
    return { botStatus: "not_bot", botReasons: [] };
  }

  return { botStatus: "unknown", botReasons: ["unclassified"] };
}

export function extractGeoHeaders(request: Request) {
  return {
    countryCode: request.headers.get("x-vercel-ip-country")?.trim().toUpperCase() ?? null,
    region: request.headers.get("x-vercel-ip-country-region")?.trim() ?? null,
    city: request.headers.get("x-vercel-ip-city")?.trim() ?? null,
    asn: request.headers.get("x-vercel-ip-asn")?.trim() ?? null,
    asnOrg: request.headers.get("x-vercel-ip-isp")?.trim() ?? request.headers.get("x-vercel-ip-org")?.trim() ?? null,
    cloudProvider: request.headers.get("x-vercel-edge-location")?.trim() || null,
    isDatacenter: null,
  };
}

export function isLikelyDatacenter(asnOrg: string | null) {
  if (!asnOrg) return null;
  const lowered = asnOrg.toLowerCase();
  const datacenterKeywords = ["amazon", "alibaba", "google", "microsoft", "oracle", "digitalocean", "linode", "rackspace", "ovh", "hetzner", "vultr", "akamai", "cloudflare", "aruba", "telecom"];
  return datacenterKeywords.some((keyword) => lowered.includes(keyword));
}
