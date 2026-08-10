import { describe, expect, it } from "vitest";
import { getRootLocale } from "@/lib/localeRouting";

describe("root locale routing", () => {
  it("lets an explicit locale cookie override geo and browser language", () => {
    expect(getRootLocale({ cookieLocale: "en", country: "CN", acceptLanguage: "zh-CN" })).toBe("en");
    expect(getRootLocale({ cookieLocale: "zh", country: "US", acceptLanguage: "en-US" })).toBe("zh");
  });

  it("uses mainland China geo for an otherwise neutral browser", () => {
    expect(getRootLocale({ country: "CN", acceptLanguage: "en-US,en;q=0.9" })).toBe("zh");
    expect(getRootLocale({ country: "cn" })).toBe("zh");
  });

  it("falls back to Chinese browser preferences, then English", () => {
    expect(getRootLocale({ acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.8" })).toBe("zh");
    expect(getRootLocale({ acceptLanguage: "zh-Hans,en;q=0.8" })).toBe("zh");
    expect(getRootLocale({ acceptLanguage: "en-US,en;q=0.9" })).toBe("en");
    expect(getRootLocale({})).toBe("en");
  });
});
