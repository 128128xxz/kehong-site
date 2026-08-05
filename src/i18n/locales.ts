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
} as const;

export type AppLocale = keyof typeof localeConfig;

export const locales = Object.keys(localeConfig) as AppLocale[];

export type Currency = (typeof localeConfig)[AppLocale]["currency"];
export type AppTimeZone = (typeof localeConfig)[AppLocale]["timeZone"];
