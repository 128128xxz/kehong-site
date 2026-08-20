import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const csv = (file: string): Array<Record<string, string>> => {
  const text = read(file).trim();
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if (char === "\n" && !quoted) { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (char !== "\r") cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};

const catalog = JSON.parse(read("src/data/catalog.normalized.json")) as { skus: Array<{ id: string; sku: string; slug: string; published: boolean; sourceStatus: string }> };
const inventory = csv("docs/stage-3a5-current-url-inventory.csv");
const clusters = csv("docs/stage-3a5-cluster-commercial-review.csv");
const scenarios = csv("docs/stage-3a5-indexation-scenarios.csv");
const sitemap = csv("docs/stage-3a5-sitemap-reconciliation.csv");
const decisions = csv("docs/stage-3a5-human-decision-sheet.csv");

describe("Stage 3A.5 calibration artifacts", () => {
  it("keeps the normalized record accounting unchanged", () => {
    expect(catalog.skus).toHaveLength(337);
    expect(catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed")).toHaveLength(231);
    expect(catalog.skus.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed"))).toHaveLength(106);
    expect(new Set(catalog.skus.map((sku) => sku.sku)).size).toBe(337);
    expect(new Set(catalog.skus.map((sku) => sku.slug)).size).toBe(337);
  });

  it("covers 271 current sitemap URLs plus every pending product access URL", () => {
    expect(inventory).toHaveLength(377);
    expect(inventory.filter((row) => row.inCurrentSitemap === "true")).toHaveLength(271);
    expect(inventory.filter((row) => row.publishStatus === "pending")).toHaveLength(106);
    expect(new Set(inventory.map((row) => row.url)).size).toBe(377);
  });

  it("reviews all 109 variant clusters", () => {
    expect(clusters).toHaveLength(109);
    expect(new Set(clusters.map((row) => row.clusterId)).size).toBe(109);
    expect(clusters.some((row) => row.memberCount === "141")).toBe(true);
  });

  it("keeps singleton policy conservative", () => {
    const singletonPublished = clusters.filter((row) => row.memberCount === "1" && row.publishedCount !== "0");
    expect(singletonPublished).toHaveLength(1);
    expect(singletonPublished[0]?.recommendedSeoTreatment).not.toBe("NOINDEX_FOLLOW");
    expect(read("docs/stage-3a5-summary.md")).toContain("One independent product anchor entity");
  });

  it("reconciles all three scenario arithmetic models", () => {
    const firstByScenario = new Map<string, (typeof scenarios)[number]>();
    for (const row of scenarios) if (!firstByScenario.has(row.scenario)) firstByScenario.set(row.scenario, row);
    expect(firstByScenario.get("A_CONSERVATIVE_ADDITIVE")).toMatchObject({ currentSitemapCount: "271", removedCount: "0", addedCount: "6", projectedCount: "277" });
    expect(firstByScenario.get("B_STAGED_CONSOLIDATION")).toMatchObject({ currentSitemapCount: "271", removedCount: "18", addedCount: "6", projectedCount: "259" });
    expect(firstByScenario.get("C_AGGRESSIVE_CONSOLIDATION")).toMatchObject({ currentSitemapCount: "271", removedCount: "231", addedCount: "6", projectedCount: "46" });
    for (const row of firstByScenario.values()) expect(Number(row.currentSitemapCount) - Number(row.removedCount) + Number(row.addedCount)).toBe(Number(row.projectedCount));
  });

  it("traces every current sitemap URL and every planned addition", () => {
    expect(sitemap).toHaveLength(383);
    expect(sitemap.filter((row) => row.currentInSitemap === "true")).toHaveLength(271);
    expect(sitemap.filter((row) => row.pageType === "planned-family")).toHaveLength(6);
    expect(sitemap.every((row) => row.scenarioAAction && row.scenarioBAction && row.scenarioCAction)).toBe(true);
  });

  it("keeps entity, base-route and localized URL counts separate", () => {
    const scenariosText = read("docs/stage-3a5-indexation-scenarios.md");
    expect(scenariosText).toContain("36 localized URL");
    expect(scenariosText).toContain("6 base routes");
    expect(scenariosText).toContain("six sitemap rows");
    expect(scenariosText.includes("archived `es`")).toBe(false);
  });

  it("does not count archived Spanish routes as active localized URLs", () => {
    expect(inventory.some((row) => row.locale === "es")).toBe(false);
    expect(read("docs/stage-3a5-count-reconciliation.md")).toContain("archived locale: es");
  });

  it("keeps canonical targets in the source locale", () => {
    const changed = sitemap.filter((row) => row.scenarioBAction === "REMOVE" && row.scenarioBTarget);
    expect(changed.length).toBe(18);
    expect(changed.every((row) => row.scenarioBTarget.startsWith("/en/"))).toBe(true);
    expect(read("docs/stage-3a5-indexation-scenarios.md")).toContain("same-locale canonical");
  });

  it("does not propose the forbidden noindex-plus-cross-page canonical combination", () => {
    const scenariosText = read("docs/stage-3a5-indexation-scenarios.md");
    expect(scenariosText).toContain("No noindex + cross-page canonical combination is proposed");
    expect(scenariosText).toContain("no canonical target is a noindex page");
  });

  it("keeps manual review groups visible at P0, P1 and P2", () => {
    expect(new Set(decisions.map((row) => row.priority))).toEqual(new Set(["P0", "P1", "P2"]));
    expect(decisions.reduce((sum, row) => sum + Number(row.affectedRecordCount), 0)).toBeGreaterThanOrEqual(110);
    expect(decisions.some((row) => row.priority === "P1" && row.publishedCount === "1")).toBe(true);
  });

  it("keeps the largest cluster as a separately reviewed decision", () => {
    const report = read("docs/stage-3a5-largest-cluster-review.md");
    expect(report).toContain("141");
    expect(report).toContain("does not auto-remove");
    expect(report).toContain("Owner confirmation");
  });

  it("does not invent Search Console, analytics or backlink evidence", () => {
    const report = read("docs/stage-3a5-seo-evidence-availability.md");
    expect(report).toContain("SEARCH_CONSOLE_DATA_AVAILABLE=false");
    expect(report).toContain("ANALYTICS_LANDING_DATA_AVAILABLE=false");
    expect(report).toContain("BACKLINK_DATA_AVAILABLE=false");
    expect(report).toContain("makes no claim");
  });

  it("emits the required planning deliverables without runtime files", () => {
    const required = [
      "stage-3a5-summary.md", "stage-3a5-count-reconciliation.md", "stage-3a5-current-url-inventory.csv",
      "stage-3a5-cluster-commercial-review.csv", "stage-3a5-largest-cluster-review.md", "stage-3a5-core-product-anchor-review.md",
      "stage-3a5-core-product-anchor-review.csv", "stage-3a5-indexation-scenarios.md", "stage-3a5-indexation-scenarios.csv",
      "stage-3a5-sitemap-reconciliation.csv", "stage-3a5-seo-evidence-availability.md", "stage-3a5-human-decision-sheet.csv",
      "stage-3a5-stage3b-rollout-plan.md", "stage-3a5-unresolved-risks.md",
    ];
    for (const file of required) expect(fs.existsSync(path.join(root, "docs", file))).toBe(true);
    expect(fs.existsSync(path.join(root, "src", "app", "sitemap.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "src", "app", "robots.ts"))).toBe(true);
  });

  it("keeps the implementation boundary explicit", () => {
    const summary = read("docs/stage-3a5-summary.md");
    expect(summary).toContain("No runtime code, product data, pages, metadata, canonical, robots, sitemap");
    expect(summary).toContain("stopped before Stage 3B");
  });
});
