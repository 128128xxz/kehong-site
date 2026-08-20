import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { productCatalogSections } from "@/data/productDirectory";
import { companyDisplayName } from "@/data/company";
import { MetricReveal } from "@/components/home/interactive";

type StatItem = { value: string; label: string };

export default async function HomeHero({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const materialEntry = productCatalogSections[0];
  const alt = zh
    ? "科宏工厂车间:成排模切设备与纸板堆垛"
    : "Kehong factory hall with die-cutting lines and stacked board";

  const stats: Array<{ value: ReactNode; ariaValue: string; label: string; long?: boolean }> = (
    t.raw("hero.stats") as StatItem[]
  ).map((stat) => ({
    value: stat.value,
    ariaValue: stat.value,
    label: stat.label,
    long: stat.value.length > 10,
  }));

  return (
    <section className="kh-home-hero">
      <div className="kh-hero-bg" aria-hidden="true">
        <picture>
          <source media="(min-width: 761px)" srcSet={showcaseImages.factoryHallWide} />
          {/* A pre-compressed local WebP avoids a cold image-optimizer request on the critical path. */}
          <img
            src={showcaseImages.machine}
            alt={alt}
            width={1086}
            height={1448}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="kh-hero-scrim" aria-hidden="true" />
      <div className="kh-hero-noise" aria-hidden="true" />

      <div className="kh-shell kh-hero-inner">
        <p className="kh-mono kh-hero-index kh-rise kh-rise-1">
          <span>{zh ? companyDisplayName.zh : companyDisplayName.en}</span>
          <span>{zh ? "广东佛山" : "Foshan, Guangdong"}</span>
          <span>OEM / ODM</span>
        </p>

        <div className="kh-hero-copy">
          <p className="kh-eyebrow kh-eyebrow-light kh-rise kh-rise-2">{t("hero.eyebrow")}</p>
          <h1 className="kh-rise kh-rise-3">{t("hero.title")}</h1>
          <p className="kh-lede kh-rise kh-rise-4">{t("hero.description")}</p>
          <div className="kh-actions kh-rise kh-rise-5">
            <Link className="kh-button kh-button-light" href={materialEntry.href}>
              {t("hero.primary")}
              <ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-ghost" href="/contact">
              {t("hero.secondary")}
            </Link>
          </div>
        </div>

        <dl className="kh-hero-stats kh-rise kh-rise-6">
          {stats.map((stat) => (
            <MetricReveal className={`kh-hero-stat${stat.long ? " is-long" : ""}`} key={stat.label}>
              <b className="kh-hero-stat-value" aria-label={stat.ariaValue}>
                <span aria-hidden="true" className="kh-hero-stat-number">{stat.value}</span>
              </b>
              <span className="kh-mono kh-hero-stat-label">{stat.label}</span>
            </MetricReveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
