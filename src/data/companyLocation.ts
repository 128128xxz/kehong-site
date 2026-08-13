export const FACTORY_ADDRESS = {
  zh: "佛山市南海区布新工业区7号",
  en: "No. 7 Buxin Industrial Zone, Nanhai District, Foshan, Guangdong, China",
} as const;

/** The single destination string used by both map providers. */
export const FACTORY_MAP_DESTINATION = FACTORY_ADDRESS.zh;

export const FACTORY_MAP_LABEL = {
  zh: "佛山科宏纸品",
  en: "Foshan Kehong Paper Products",
} as const;

export function getFactoryLocationUrl(locale: string) {
  if (locale === "zh") {
    const params = new URLSearchParams({
      address: FACTORY_MAP_DESTINATION,
      output: "html",
      src: "webapp.kehong.website",
    });
    return `https://api.map.baidu.com/geocoder?${params.toString()}`;
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
/** @deprecated Keep the export for older integrations; new UI uses Baidu geocoder. */
export const FACTORY_AMAP_URL = FACTORY_BAIDU_MAP_URL;
export const FACTORY_GOOGLE_MAPS_URL = getFactoryLocationUrl("en");
