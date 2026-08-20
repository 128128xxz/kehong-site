import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FACTORY_ADDRESS, FACTORY_MAP_LABEL, getFactoryLocationUrl } from "@/data/companyLocation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import FactoryLocationCard from "@/components/site/FactoryLocationCard";

const workWithImages = [
  { src: "/media/materials/honeycomb-paper-roll-reference.webp" },
  { src: "/media/materials/paper-color-swatch-detail-01.webp" },
  { src: "/media/products/paper-cup-materials/pe-coated-paper-roll-reference-01.jpg" },
  { src: "/media/products/paper-materials/kraft-paper-roll-sheet-reference-01.webp" },
  { src: "/media/products/paper-cup-materials/paper-cup-fan-product-reference-01.webp" },
  { src: "/media/materials/paper-die-cut-sheet-reference.jpg" },
] as const;

export default async function FactoryOverview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Stage2" });
  const workWith = t.raw("factory.workWith.items") as Array<{
    title: string;
    body: string;
    alt: string;
  }>;
  const processSteps = t.raw("factory.process.steps") as Array<{
    title: string;
    what: string;
    material: string;
    output: string;
  }>;
  const qualityItems = t.raw("factory.quality.items") as Array<{ title: string; body: string }>;
  const preparationItems = t.raw("factory.preparation.items") as string[];

  return (
    <>
      <section className="kh-section">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="02" text={t("factory.workWith.kicker")} />
                <h2>{t("factory.workWith.title")}</h2>
                <p className="kh-section-lede mt-5">{t("factory.workWith.lede")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ul className="m-0 mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {workWith.map((item, index) => (
                <li
                  key={item.title}
                  className="kh-media-shade flex flex-col overflow-hidden rounded-lg border border-(--kh-line)"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={workWithImages[index]?.src ?? showcaseImages.honeycomb}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="m-0 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="kh-section kh-section-muted">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="03" text={t("factory.process.kicker")} />
                <h2>{t("factory.process.title")}</h2>
                <p className="kh-section-lede mt-5">{t("factory.process.lede")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ol className="m-0 mt-10 list-none border-t border-(--kh-line) p-0">
              {processSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-x-8 gap-y-2 border-b border-(--kh-line) py-6 md:grid-cols-[3.2rem_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <b className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <h3 className="m-0 text-xl font-semibold">{step.title}</h3>
                  </div>
                  <div>
                    <p className="kh-mono text-xs uppercase tracking-wide text-(--kh-muted)">{t("factory.process.whatLabel")}</p>
                    <p className="mt-1 text-sm leading-6 text-(--kh-muted)">{step.what}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                    <p className="m-0 text-sm leading-6">
                      <strong>{t("factory.process.materialLabel")}: </strong>
                      <span className="text-(--kh-muted)">{step.material}</span>
                    </p>
                    <p className="m-0 text-sm leading-6">
                      <strong>{t("factory.process.outputLabel")}: </strong>
                      <span className="text-(--kh-muted)">{step.output}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="kh-section kh-section-forest">
        <div className="kh-shell">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <SectionKicker index="04" text={t("factory.quality.kicker")} light />
                <h2>{t("factory.quality.title")}</h2>
              </div>
              <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                {t("factory.quality.lede")}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ol className="m-0 mt-10 list-none border-t border-white/15 p-0">
              {qualityItems.map((item, index) => (
                <li key={item.title} className="grid gap-4 border-b border-white/15 py-5 md:grid-cols-[3.2rem_minmax(0,1fr)]">
                  <b className="kh-mono text-(--kh-brass-soft)">{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <h3 className="m-0 text-lg font-semibold text-[#fffdf8]">{item.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="kh-section">
        <div className="kh-shell grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start lg:gap-16">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="05" text={t("factory.preparation.kicker")} />
                <h2>{t("factory.preparation.title")}</h2>
                <p className="kh-section-lede mt-5">{t("factory.preparation.lede")}</p>
              </div>
            </div>
            <ul className="m-0 mt-8 grid list-none gap-3 border-y border-(--kh-line) py-5 p-0 text-sm leading-6">
              {preparationItems.map((item) => (
                <li key={item} className="grid grid-cols-[1.5rem_1fr] gap-3">
                  <span className="kh-mono text-(--kh-brass)">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="kh-button kh-button-dark mt-8">
              {t("factory.preparation.cta")}
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <FactoryLocationCard
              locale={locale}
              sourceBlock="factory"
              mapProvider={locale === "zh" ? "baidu_directions" : "google_directions"}
              href={getFactoryLocationUrl(locale)}
              title={locale === "zh" ? "工厂地址" : "Factory address"}
              mapLabel={locale === "zh" ? FACTORY_MAP_LABEL.zh : FACTORY_MAP_LABEL.en}
              address={locale === "zh" ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}
              viewLabel={locale === "zh" ? "查看位置" : "View location"}
              copyLabel={locale === "zh" ? "复制地址" : "Copy address"}
              copiedLabel={locale === "zh" ? "地址已复制" : "Copied"}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
