import type { BotStatus, DigestScoreReason, HumanStatus, LeadLevel, VisitorDigestRecord } from "./digest-types";

type ScoreInput = Pick<VisitorDigestRecord, "eventSummary" | "productPages" | "totalVisits" | "totalSessionSeconds" | "uniquePageCount" | "botStatus"> & {
  repeatSessionEngaged?: boolean;
};

const BOT_PENALTY = {
  probableBot: -30,
  possibleBot: -10,
} as const;

function add(reasons: DigestScoreReason[], code: string, points: number, label: string) {
  reasons.push({ code, points, label });
}

function sumEvents(eventSummary: ScoreInput["eventSummary"], code: string) {
  const value = eventSummary?.[code];
  return Number.isFinite(value) ? value : 0;
}

function isBotStatus(botStatus: BotStatus) {
  return botStatus === "probable_bot" || botStatus === "verified_bot";
}

function deriveHumanStatus(input: {
  botStatus: BotStatus;
  totalSessionSeconds: number;
  uniquePageCount: number;
  productViews: number;
  ctaEvents: number;
}) {
  if (input.botStatus === "probable_bot" || input.botStatus === "verified_bot") return "probable_bot";
  if (input.botStatus === "unknown") return "unknown";
  if (input.totalSessionSeconds >= 30 || input.uniquePageCount >= 2 || input.productViews > 0 || input.ctaEvents > 0) return "engaged_human";
  if (input.totalSessionSeconds > 0) return "probable_human";
  return "low_engagement";
}

function deriveLeadLevel(score: number, botStatus: BotStatus, input: { formSubmit?: number; emailClicks?: number; whatsappClicks?: number }) {
  if (botStatus === "probable_bot" || botStatus === "verified_bot") return "BOT";
  if (input.formSubmit && input.formSubmit > 0) return "HOT";
  if ((input.emailClicks ?? 0) > 0 || (input.whatsappClicks ?? 0) > 0) return Math.max(score, 30) >= 50 ? "HOT" : "HIGH";
  if (score >= 50) return "HOT";
  if (score >= 30) return "HIGH";
  if (score >= 10) return "MEDIUM";
  return "LOW";
}

export function scoreBehavior(input: ScoreInput) {
  const reasons: DigestScoreReason[] = [];
  const events = input.eventSummary;
  const totalSessionSeconds = Math.max(0, input.totalSessionSeconds);
  const uniquePages = Math.max(0, input.uniquePageCount);
  const productViews = sumEvents(events, "product_view");
  const quoteViews = sumEvents(events, "quote_view");
  const contactViews = sumEvents(events, "contact_view");
  const emailClicks = sumEvents(events, "email_click");
  const whatsappClicks = sumEvents(events, "whatsapp_click");
  const formStarts = sumEvents(events, "form_start");
  const formSubmits = sumEvents(events, "form_submit");

  if (totalSessionSeconds >= 15) add(reasons, "engagement_15", 5, "Engagement >= 15s");
  if (totalSessionSeconds >= 30) add(reasons, "engagement_30", 5, "Engagement >= 30s");
  if (uniquePages >= 2) add(reasons, "unique_pages_2", 5, "Visited 2+ unique pages");
  if (uniquePages >= 3) add(reasons, "unique_pages_3", 5, "Visited 3+ unique pages");

  if (productViews >= 1) add(reasons, "product_view", 15, "Product views");
  if (productViews >= 2) add(reasons, "multiple_product_views", 10, "Multiple product views");
  if (contactViews >= 1) add(reasons, "contact_view", 10, "Contact view");
  if (quoteViews >= 1) add(reasons, "quote_view", 20, "Quote view");
  if (emailClicks >= 1) add(reasons, "email_click", 25, "Email click");
  if (whatsappClicks >= 1) add(reasons, "whatsapp_click", 30, "WhatsApp click");
  if (formStarts >= 1) add(reasons, "form_start", 20, "Form start");
  if (formSubmits >= 1) add(reasons, "form_submit", 50, "Form submit");

  const repeatSessionEngaged = input.repeatSessionEngaged ?? (
    totalSessionSeconds >= 15 || uniquePages >= 2 || productViews >= 1 || emailClicks >= 1 || whatsappClicks >= 1 || formStarts >= 1 || formSubmits >= 1
  );
  const validRepeat = input.totalVisits >= 2 && !isBotStatus(input.botStatus) && repeatSessionEngaged;
  if (validRepeat) add(reasons, "repeat_visit", 10, "Repeat visit");

  if (input.botStatus === "probable_bot") add(reasons, "probable_bot", BOT_PENALTY.probableBot, "Probable bot penalty");
  if (input.botStatus === "possible_bot") add(reasons, "possible_bot", BOT_PENALTY.possibleBot, "Possible bot penalty");

  const score = reasons.reduce((total, reason) => total + reason.points, 0);
  const ctaEvents = Math.max(emailClicks, whatsappClicks, formStarts, formSubmits);
  const humanStatus: HumanStatus = deriveHumanStatus({
    botStatus: input.botStatus,
    totalSessionSeconds,
    uniquePageCount: uniquePages,
    productViews,
    ctaEvents,
  });
  const leadLevel: LeadLevel = deriveLeadLevel(score, input.botStatus, {
    formSubmit: formSubmits,
    emailClicks,
    whatsappClicks,
  });

  return {
    score,
    reasons,
    validRepeatVisit: validRepeat,
    leadLevel,
    humanStatus,
  };
}
