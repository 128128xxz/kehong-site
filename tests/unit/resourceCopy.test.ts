import { describe, expect, it } from "vitest";
import { finishOptions, finishOptionsZh, resourceApplicationSlugs, resourceItems, resourceZhCopy } from "@/data/siteContent";

describe("resource and product copy semantics", () => {
  it("keeps one canonical dieline entry and two distinct application paths", () => {
    const requestTitles = resourceItems.filter((item) => item.type === "request").map((item) => item.title);
    expect(requestTitles).toEqual(["Dielines & Templates"]);
    expect(resourceApplicationSlugs).toEqual(["artwork-guidelines", "dielines-templates"]);
    expect(resourceZhCopy["dielines-templates"].title).toBe("刀模图与模板申请");
    expect(resourceZhCopy["dielines-templates"].summary).not.toContain("未经核验");
  });

  it("keeps specialty paper out of the finishing options", () => {
    expect(finishOptions).not.toContain("Specialty paper");
    expect(finishOptionsZh).not.toContain("特种纸");
  });
});
