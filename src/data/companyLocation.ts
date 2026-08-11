/**
 * Shared factory location facts. Keep the map search query intentionally
 * broader than the postal address: it is the approved search phrase for both
 * services and avoids guessing a POI or coordinate.
 */
export const FACTORY_MAP_QUERY_ZH = "佛山市布新工业区科宏纸品" as const;

export const FACTORY_ADDRESS = {
  zh: "佛山市南海区布新工业区7号科宏坑纸厂",
  en: "Kehong Corrugated Paper Factory, No. 7 Buxin Industrial Zone, Nanhai District, Foshan, Guangdong, China",
} as const;

export const FACTORY_MAP_LABEL = {
  zh: "科宏纸品 · 佛山市布新工业区",
  en: "Kehong Paper Products · Buxin Industrial Zone, Foshan, Guangdong, China",
} as const;

export function getFactoryMapUrl(locale: string) {
  if (locale === "zh") {
    const url = new URL("https://uri.amap.com/search");
    url.search = new URLSearchParams({
      keyword: FACTORY_MAP_QUERY_ZH,
      city: "佛山",
      view: "map",
      src: "kehong.tech",
      callnative: "1",
    }).toString();
    return url.toString();
  }

  const url = new URL("https://www.google.com/maps/search/");
  url.search = new URLSearchParams({
    api: "1",
    query: FACTORY_MAP_QUERY_ZH,
    utm_source: "kehong.tech",
    utm_campaign: "factory_location",
  }).toString();
  return url.toString();
}

export const FACTORY_AMAP_URL = getFactoryMapUrl("zh");
export const FACTORY_GOOGLE_MAPS_URL = getFactoryMapUrl("en");
