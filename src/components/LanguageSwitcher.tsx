"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const currentLanguage = useLocale();

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
            onClick={() => {
              const secure = window.location.protocol === "https:" ? "; Secure" : "";
              document.cookie = `kehong_locale=${locale}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
              // Keep an RFQ/product prefill intact when a buyer changes language.
              // next-intl's pathname switch intentionally omits search params.
              const current = new URL(window.location.href);
              const localePattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);
              const nextPath = current.pathname.replace(localePattern, `/${locale}`);
              if (nextPath !== current.pathname || current.search || current.hash) {
                window.location.assign(`${nextPath}${current.search}${current.hash}`);
                return;
              }
              router.replace(pathname, { locale });
            }}
          >
            {localeConfig[locale].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
