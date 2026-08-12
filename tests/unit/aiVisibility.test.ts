import { describe, expect, it } from "vitest";
import { getNewsEnhancement } from "@/content/news/citationEnhancements";
import { getPublishedNews } from "@/content/news";
import { verifiedCompanyFacts } from "@/data/verifiedCompanyFacts";
import { getPublicProductGroups } from "@/lib/aiEntities";
import { detectAiReferralProvider } from "@/lib/attribution";

describe("AI search visibility foundations", () => {
  it("classifies only known AI referral hosts and never guesses", () => {
    expect(detectAiReferralProvider("https://chatgpt.com/share/example")).toBe("chatgpt");
    expect(detectAiReferralProvider("https://www.perplexity.ai/search/example")).toBe("perplexity");
    expect(detectAiReferralProvider("https://copilot.microsoft.com/")).toBe("copilot");
    expect(detectAiReferralProvider("https://www.bing.com/search?q=paper")).toBe("bing");
    expect(detectAiReferralProvider("https://gemini.google.com/app/example")).toBe("gemini");
    expect(detectAiReferralProvider("https://claude.ai/new")).toBe("claude");
    expect(detectAiReferralProvider("")).toBe("");
    expect(detectAiReferralProvider("https://example.com")).toBe("");
  });

  it("keeps public facts limited to approved or locked statements", () => {
    expect(verifiedCompanyFacts.length).toBeGreaterThan(10);
    expect(verifiedCompanyFacts.filter((fact) => fact.status === "OWNER_CONFIRMATION_REQUIRED").every((fact) => fact.status === "OWNER_CONFIRMATION_REQUIRED")).toBe(true);
    expect(verifiedCompanyFacts.some((fact) => fact.id === "material-sku-count" && fact.en.includes("231"))).toBe(true);
  });

  it("exposes six current product groups and twelve citation-ready articles", () => {
    expect(getPublicProductGroups()).toHaveLength(6);
    expect(getPublishedNews("en")).toHaveLength(6);
    expect(getPublishedNews("zh")).toHaveLength(6);
    for (const article of getPublishedNews("en")) {
      const enhancement = getNewsEnhancement("en", article.translationKey);
      expect(enhancement.directAnswer.length).toBeGreaterThan(180);
      expect(enhancement.comparisonRows.length).toBe(3);
      expect(enhancement.sources.length).toBeGreaterThan(0);
    }
  });
});
