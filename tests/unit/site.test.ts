import { describe, expect, it } from "vitest";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

describe("canonical site URL generation", () => {
  it("builds canonical HTTPS URLs for internal paths", () => {
    const url = absoluteSiteUrl("/en/products/example?view=spec");
    expect(new URL(url).origin).toBe("https://www.kehong.tech");
    expect(url).toBe("https://www.kehong.tech/en/products/example?view=spec");
    expect(url).not.toContain(["kehong", "paper.com"].join(""));
  });

  it("keeps a single configured canonical origin", () => {
    expect(new URL(siteConfig.url).origin).toBe("https://www.kehong.tech");
  });
});
