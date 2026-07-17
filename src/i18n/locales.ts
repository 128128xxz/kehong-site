// ponytail: single edit point when adding a locale — routing, regional, OG, and switcher derive from here
export const localeConfig = {
  en: {
    label: "English",
    ogLocale: "en_US",
    currency: "USD",
    timeZone: "Asia/Singapore",
  },
  zh: {
    label: "中文",
    ogLocale: "zh_CN",
    currency: "CNY",
    timeZone: "Asia/Shanghai",
  },
  es: {
    label: "Español",
    ogLocale: "es_ES",
    currency: "EUR",
    timeZone: "Europe/Madrid",
  },
  id: {
    label: "Indonesia",
    ogLocale: "id_ID",
    currency: "IDR",
    timeZone: "Asia/Jakarta",
  },
  vi: {
    label: "Tiếng Việt",
    ogLocale: "vi_VN",
    currency: "VND",
    timeZone: "Asia/Ho_Chi_Minh",
  },
  th: {
    label: "ไทย",
    ogLocale: "th_TH",
    currency: "THB",
    timeZone: "Asia/Bangkok",
  },
  ms: {
    label: "Bahasa Melayu",
    ogLocale: "ms_MY",
    currency: "MYR",
    timeZone: "Asia/Kuala_Lumpur",
  },
} as const;

export type AppLocale = keyof typeof localeConfig;

export const locales = Object.keys(localeConfig) as AppLocale[];

export type Currency = (typeof localeConfig)[AppLocale]["currency"];
export type AppTimeZone = (typeof localeConfig)[AppLocale]["timeZone"];
