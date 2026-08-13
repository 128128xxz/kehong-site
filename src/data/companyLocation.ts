export const FACTORY_ADDRESS = {
  zh: "佛山市南海区布新工业区7号",
  en: "No. 7 Buxin Industrial Zone, Nanhai District, Foshan, Guangdong, China",
} as const;

/** The single destination string used by both map providers. */
export const FACTORY_MAP_DESTINATION = FACTORY_ADDRESS.zh;

export const FACTORY_MAP_LABEL = {
  zh: "佛山科宏纸品有限公司",
  en: "Foshan Kehong Paper Products Co., Ltd.",
} as const;

export function getFactoryLocationUrl(locale: string) {
  if (locale === "zh") {
    // Baidu's direction URI opens a route with the confirmed factory address
    // as its destination. It avoids the generic geocoder/search result page
    // and does not require a browser login or an API token.
    const params = new URLSearchParams({
      origin: "我的位置",
      destination: FACTORY_MAP_DESTINATION,
      region: "佛山",
      mode: "driving",
      output: "html",
      src: "webapp.kehong.website",
    });
    return `https://api.map.baidu.com/direction?${params.toString()}`;
  }

  const url = new URL("https://www.google.com/maps/dir/");
  url.search = new URLSearchParams({
    api: "1",
    destination: FACTORY_MAP_DESTINATION,
    travelmode: "driving",
  }).toString();
  return url.toString();
}

/** @deprecated Use getFactoryLocationUrl instead. */
export const getFactoryMapUrl = getFactoryLocationUrl;
export const FACTORY_BAIDU_MAP_URL = getFactoryLocationUrl("zh");
/** @deprecated Keep the export for older integrations; new UI uses Baidu directions. */
export const FACTORY_AMAP_URL = FACTORY_BAIDU_MAP_URL;
export const FACTORY_GOOGLE_MAPS_URL = getFactoryLocationUrl("en");
