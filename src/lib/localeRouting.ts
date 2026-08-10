export type RootLocaleSignals = {
  cookieLocale?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
};

/**
 * Chooses the locale for the unprefixed marketing root only. Explicit locale
 * paths are handled by the router and must never call this helper.
 */
export function getRootLocale({ cookieLocale, country, acceptLanguage }: RootLocaleSignals): "en" | "zh" {
  if (cookieLocale === "zh" || cookieLocale === "en") return cookieLocale;
  if (country?.toUpperCase() === "CN") return "zh";

  const language = acceptLanguage?.toLowerCase() ?? "";
  if (/(^|,)\s*zh(?:-|,|;|$)/u.test(language) || language.includes("zh-hans")) return "zh";
  return "en";
}
