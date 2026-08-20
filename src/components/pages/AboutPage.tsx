import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type WhatItem = { title: string; body: string };
type WhoItem = string;
type HowItem = { title: string; body: string };

export default async function AboutPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Stage2.about" });

  const whatItems = t.raw("what.items") as WhatItem[];
  const whoItems = t.raw("who.items") as WhoItem[];
  const howItems = t.raw("how.items") as HowItem[];

  return (
    <>
      {/* Hero */}
      <section className="kh-page-hero">
        <div className="kh-page-hero-bg" aria-hidden="true">
          <Image
            src={showcaseImages.machine}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="kh-page-hero-scrim" aria-hidden="true" />
        <div className="kh-shell kh-page-hero-inner">
          <SectionKicker index="01" text={t("hero.kicker")} light />
          <h1>{t("hero.title")}</h1>
          <p className="kh-lede">{t("hero.lede")}</p>
          <div className="kh-actions">
            <Link href="/contact" className="kh-button kh-button-light">
              {t("hero.ctaQuote")}<ArrowRight className="size-4" />
            </Link>
            <Link href="/capabilities" className="kh-button kh-button-ghost">
              {t("hero.ctaCapabilities")}
            </Link>
          </div>
          <p className="kh-mono kh-page-hero-meta">
            <span>{t("hero.metaScope")}</span>
            <span>{t("hero.metaCustom")}</span>
            <span>{t("hero.metaLocation")}</span>
          </p>
        </div>
      </section>

      {/* What Kehong Does */}
      <section className="kh-section">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="02" text={t("what.kicker")} />
                <h2>{t("what.title")}</h2>
                <p className="kh-section-lede mt-5">{t("what.lede")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {whatItems.map((item) => (
                <div key={item.title} className="kh-panel p-6">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="kh-section kh-section-muted">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="03" text={t("who.kicker")} />
                <h2>{t("who.title")}</h2>
                <p className="kh-section-lede mt-5">{t("who.lede")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ul className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {whoItems.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-lg border border-(--kh-line) p-4">
                  <Check className="mt-0.5 size-4 shrink-0 text-(--kh-brass)" />
                  <span className="text-sm leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* How We Support Projects */}
      <section className="kh-section">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="04" text={t("how.kicker")} />
                <h2>{t("how.title")}</h2>
                <p className="kh-section-lede mt-5">{t("how.lede")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ol className="mt-10 list-none border-t border-(--kh-line) p-0">
              {howItems.map((item, index) => (
                <li key={item.title} className="grid gap-x-6 gap-y-2 border-b border-(--kh-line) py-6 md:grid-cols-[3.2rem_minmax(0,1fr)_minmax(0,2fr)]">
                  <b className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</b>
                  <h3 className="m-0 text-xl font-semibold">{item.title}</h3>
                  <p className="m-0 text-sm leading-6 text-(--kh-muted)">{item.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Factory & Capabilities Entry */}
      <section className="kh-section kh-section-forest">
        <div className="kh-shell">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <Reveal>
              <SectionKicker index="05" text={t("entry.kicker")} light />
              <h2 className="mt-4">{t("entry.title")}</h2>
              <p className="kh-section-lede mt-4 text-(--kh-muted)/80">{t("entry.lede")}</p>
              <div className="kh-cta-actions mt-6">
                <Link href="/factory" className="kh-button kh-button-light">
                  {t("entry.factoryCta")}<ArrowRight className="size-4" />
                </Link>
                <Link href="/capabilities" className="kh-button kh-button-ghost">
                  {t("entry.capabilitiesCta")}<ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="kh-media-shade relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={showcaseImages.factorySamplesFloor}
                  alt={t("entry.imageAlt")}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="kh-section kh-section-cta">
        <div className="kh-shell">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionKicker index="06" text={t("cta.kicker")} light />
              <h2 className="mt-4">{t("cta.title")}</h2>
              <p className="kh-section-lede mt-4 text-(--kh-muted)/80">{t("cta.lede")}</p>
              <div className="kh-cta-actions mt-6 justify-center">
                <Link href="/contact" className="kh-button kh-button-light">
                  {t("cta.discussBtn")}<ArrowRight className="size-4" />
                </Link>
                <Link href="/contact" className="kh-button kh-button-ghost">
                  {t("cta.quoteBtn")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}