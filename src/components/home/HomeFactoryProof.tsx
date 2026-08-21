import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { FACTORY_ADDRESS, FACTORY_MAP_LABEL, getFactoryLocationUrl } from "@/data/companyLocation";
import { Parallax, Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import FactoryLocationCard from "@/components/site/FactoryLocationCard";

export default async function HomeFactoryProof({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const facts = t.raw("factoryProof.facts") as string[];

  return (
    <section className="kh-section kh-section-forest kh-home-factory">
      <div className="kh-shell kh-factory-grid">
        <Reveal>
          <SectionKicker index="04" text={t("factoryProof.kicker")} light />
          <h2 className="kh-editorial-serif">{t("factoryProof.title")}</h2>
          <p className="kh-section-lede">
            {t("factoryProof.lede")}
          </p>
          <ul>
            {facts.map((item) => (
              <li key={item}><Check className="size-4" />{item}</li>
            ))}
          </ul>
          <div className="kh-cta-actions">
            <Link className="kh-button kh-button-light" href="/factory">
              {t("factoryProof.factoryCta")}<ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-ghost" href="/capabilities">
              {t("factoryProof.capabilitiesCta")}<ArrowRight className="size-4" />
            </Link>
          </div>
          <FactoryLocationCard
            className="mt-4 max-w-xl"
            locale={locale}
            sourceBlock="home"
            mapProvider={zh ? "baidu_directions" : "google_directions"}
            href={getFactoryLocationUrl(locale)}
            title={zh ? "工厂位置" : "Factory location"}
            mapLabel={zh ? FACTORY_MAP_LABEL.zh : FACTORY_MAP_LABEL.en}
            address={zh ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}
            viewLabel={zh ? "查看位置" : "View location"}
            copyLabel={zh ? "复制地址" : "Copy address"}
            copiedLabel={zh ? "地址已复制" : "Copied"}
          />
        </Reveal>

        <div className="kh-factory-stack">
          <Parallax strength={-8}>
            <div className="kh-factory-main kh-media-shade">
              <Image src={showcaseImages.factorySamplesFloor} alt={t("factoryProof.imageAlt")} fill sizes="(max-width: 1100px) 100vw, 48vw" className="object-cover" loading="eager" fetchPriority="low" decoding="async" />
              <span className="kh-fig-caption kh-mono">{t("factoryProof.imageCaption")}</span>
            </div>
          </Parallax>
          <Parallax strength={10} className="kh-factory-mini kh-media-shade">
            <Image src={showcaseImages.boothInterior01} alt={t("factoryProof.miniImageAlt")} fill sizes="260px" className="object-cover" loading="lazy" decoding="async" />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
