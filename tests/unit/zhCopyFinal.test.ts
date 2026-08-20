import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getAllSkus, getLocalizedCatalogValue } from "@/lib/catalog";
import { getTaxonomyMaterialLabel } from "@/lib/taxonomy";

const root = path.join(process.cwd(), "src");
const read = (relative: string) => readFileSync(path.join(root, relative), "utf8");
const readDictionary = (locale: string) => readFileSync(path.join(process.cwd(), "dictionary", `${locale}.json`), "utf8");

describe("finalized Chinese buyer copy", () => {
  it("adopts the locked facts and explicit page copy", () => {
    const zh = readDictionary("zh");
    expect(zh).toContain("科宏为 B 端包装项目提供瓦楞纸板、特种与功能纸、纸杯材料及纸品定制加工支持。");
    expect(zh).toContain("查看适合 B 端包装项目的纸张、杯纸组件和成型材料。");
    expect(zh).toContain("科宏位于广东佛山，可根据产品结构和规格要求安排选材、结构打样、纸材加工、后道工艺、质量检查和出货准备。");
    expect(zh).toContain("设计稿准备");
    expect(read("data/industrySeoPages.ts")).toContain("用于电商发货、仓储和运输保护的瓦楞邮寄盒及纸质缓冲结构。");
    expect(read("lib/site-config.ts")).toContain("纸材、半成品与定制纸包装");
  });

  it("keeps the published SKU count and protects raw data through display formatting", () => {
    expect(getAllSkus()).toHaveLength(231);
    expect(getLocalizedCatalogValue("食品级白卡纸", "zh")).not.toMatch(/食品级|防油|食品接触/u);
    expect(getLocalizedCatalogValue("Food-grade paper", "en")).not.toMatch(/food[- ]grade|greaseproof|food[- ]contact/iu);
    expect(getTaxonomyMaterialLabel("food-grade-white-board", "zh")).toBe("白卡纸");
    expect(getTaxonomyMaterialLabel("greaseproof-paper", "en")).toBe("Paper material");
  });

  it("keeps buyer-facing copy free of prohibited wording in the selected public surface", () => {
    const files = [
      "app/[locale]/factory/page.tsx",
      "app/[locale]/solutions/page.tsx",
      "components/home/HomeHero.tsx",
      "components/home/HomeProductSystems.tsx",
      "components/pages/ResourcesPage.tsx",
      "components/site/FactoryOverview.tsx",
      "components/site/SolutionsDirectory.tsx",
      "data/siteContent.ts",
      "data/visuals.ts",
    ];
    const source = files.map(read).join("\n");
    for (const phrase of ["内容由 AI 生成", "一站式完成", "按图施工", "231 个产品", "食品接触", "防油结构", "未经核验的文件不公开展示"]) {
      expect(source).not.toContain(phrase);
    }
  });

  it("uses purpose-specific Chinese CTA language", () => {
    const source = [
      read("components/site/Header.tsx"),
      read("components/site/SiteFooter.tsx"),
      read("components/pages/ResourcesPage.tsx"),
      read("components/home/HomeCta.tsx"),
      read("components/site/ProductCatalog.tsx"),
    ].join("\n");
    const zh = readDictionary("zh");
    expect(source).toContain("立即询价");
    expect(source).not.toContain("提交询价");
    expect(source).toContain("提交项目需求");
    expect(source).toContain("查看规格");
    expect(source).toContain("申请刀模图");
    expect(zh).toContain('"ctaExpert": "咨询包装专家"');
    expect(source).not.toContain("查看范围");
    expect(source).not.toContain("发起引导式询盘");
  });
});
