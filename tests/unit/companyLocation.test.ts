import { describe, expect, it } from "vitest";
import { FACTORY_MAP_QUERY_ZH, getFactoryMapUrl } from "@/data/companyLocation";

describe("locale-specific factory map links", () => {
  it("uses a login-free Baidu search URL for Chinese pages", () => {
    const url = new URL(getFactoryMapUrl("zh"));
    expect(url.hostname).toBe("map.baidu.com");
    expect(url.pathname).toContain(encodeURIComponent(FACTORY_MAP_QUERY_ZH));
    expect(url.toString()).not.toContain("amap");
  });

  it("uses Google Maps and the same query for English pages", () => {
    const url = new URL(getFactoryMapUrl("en"));
    expect(url.hostname).toBe("www.google.com");
    expect(url.pathname).toBe("/maps/search/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe(FACTORY_MAP_QUERY_ZH);
    expect(url.searchParams.get("utm_source")).toBe("kehong.tech");
    expect(url.searchParams.get("utm_campaign")).toBe("factory_location");
  });
});
