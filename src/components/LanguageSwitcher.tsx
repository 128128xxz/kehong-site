"use client";

import { useLocale } from "next-intl";
import { localeConfig } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const LanguageSwitcher = () => {
  const currentLanguage = useLocale();

  const switchLocale = (locale: (typeof routing.locales)[number]) => {
    if (locale === currentLanguage) return;

    const current = new URL(window.location.href);
    const localePattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);
    const unprefixedPath = current.pathname.replace(localePattern, "") || "/";
    const nextPath = `/${locale}${unprefixedPath === "/" ? "" : unprefixedPath}`;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    // Keep both the next-intl cookie and the site cookie in sync. This makes
    // a subsequent visit to the unprefixed root deterministic instead of
    // allowing a stale regional/browser signal to select Chinese again.
    document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    document.cookie = `kehong_locale=${locale}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;

    // Use the fully prefixed path even when the current page was reached via
    // the unprefixed root. This avoids a transient `/` navigation that can be
    // redirected by the locale middleware before the new choice is applied.
    window.location.assign(`${nextPath}${current.search}${current.hash}`);
  };

  return (
    <DropdownMenu dir="ltr">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="kh-language-trigger min-h-11 min-w-11 border-(--kh-line) bg-(--kh-surface)/90 px-3 font-semibold shadow-sm">
          {localeConfig[currentLanguage as keyof typeof localeConfig].label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="kh-language-menu min-w-32 border-(--kh-line) bg-(--kh-surface) p-1 shadow-xl">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className={`kh-language-option min-h-11 cursor-pointer rounded-md px-3 font-semibold ${locale === currentLanguage ? "bg-(--kh-forest) text-(--kh-surface)" : "text-(--kh-ink)"}`}
            aria-current={locale === currentLanguage ? "true" : undefined}
            onSelect={() => switchLocale(locale)}
          >
            {localeConfig[locale].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
