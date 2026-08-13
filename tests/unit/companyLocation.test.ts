import { describe, expect, it } from "vitest";
import { FACTORY_ADDRESS, FACTORY_MAP_DESTINATION, getFactoryLocationUrl } from "@/data/companyLocation";

describe("factory location links", () => {
  it("keeps the exact confirmed factory address as the shared destination", () => {
    expect(FACTORY_ADDRESS.zh).toBe("佛山市南海区布新工业区7号科宏纸品");
    expect(FACTORY_MAP_DESTINATION).toBe(FACTORY_ADDRESS.zh);
  });

  it("uses the login-free Baidu geocoder URL for Chinese pages", () => {
    const url = new URL(getFactoryLocationUrl("zh"));
    expect(url.hostname).toBe("api.map.baidu.com");
    expect(url.pathname).toBe("/geocoder");
    expect(url.searchParams.get("address")).toBe(FACTORY_MAP_DESTINATION);
    expect(url.searchParams.get("output")).toBe("html");
    expect(url.searchParams.get("src")).toBe("webapp.kehong.website");
    expect(url.searchParams.has("query")).toBe(false);
    expect(url.searchParams.has("keyword")).toBe(false);
    expect(url.searchParams.has("search")).toBe(false);
  });

  it("uses Google Directions with the exact address for English pages", () => {
    const url = new URL(getFactoryLocationUrl("en"));
    expect(url.hostname).toBe("www.google.com");
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe(FACTORY_MAP_DESTINATION);
    expect(url.searchParams.get("travelmode")).toBe("driving");
    expect(url.pathname).not.toContain("/maps/search/");
    expect(url.searchParams.has("query")).toBe(false);
  });

  it("uses the exact Chinese destination for copy address", () => {
    expect(FACTORY_MAP_DESTINATION).toBe("佛山市南海区布新工业区7号科宏纸品");
  });
});
