import { describe, expect, it } from "vitest";
import { FACTORY_MAP_QUERY_ZH, getFactoryMapUrl } from "@/data/companyLocation";

describe("locale-specific factory map links", () => {
  it("uses the approved AMap search query for Chinese pages", () => {
    const url = new URL(getFactoryMapUrl("zh"));
    expect(url.hostname).toBe("uri.amap.com");
    expect(url.pathname).toBe("/search");
    expect(url.searchParams.get("keyword")).toBe(FACTORY_MAP_QUERY_ZH);
    expect(url.searchParams.get("city")).toBe("佛山");
    expect(url.searchParams.get("view")).toBe("map");
    expect(url.searchParams.get("src")).toBe("kehong.tech");
    expect(url.searchParams.get("callnative")).toBe("1");
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
