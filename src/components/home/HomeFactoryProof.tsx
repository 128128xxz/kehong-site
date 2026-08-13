import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { FACTORY_ADDRESS, FACTORY_MAP_LABEL, getFactoryLocationUrl } from "@/data/companyLocation";
import { Parallax, Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import FactoryLocationCard from "@/components/site/FactoryLocationCard";

export default function HomeFactoryProof({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const facts = zh
    ? ["20+ 年纸品加工经验", "8,000+ ㎡生产场地", "模切、分切、裱纸、瓦楞"]
    : ["20+ years in paper converting", "8,000+ ㎡ production site", "Die-cutting, slitting, mounting and corrugated processing"];

  return (
    <section className="kh-section kh-section-forest kh-home-factory">
      <div className="kh-shell kh-factory-grid">
        <Reveal>
          <SectionKicker index="04" text={zh ? "工厂" : "Factory & capability"} light />
          <h2>{zh ? "从选材、打样到出货准备。" : "From material selection to shipment preparation."}</h2>
          <p className="kh-section-lede">
            {zh
              ? "科宏位于广东佛山，可根据产品结构和规格要求安排选材、结构打样、纸材加工、后道工艺、质量检查和出货准备。"
              : "Kehong is based in Foshan and arranges material selection, structural sampling, paper converting, finishing, quality checks and shipment preparation according to product structure and specification requirements."}
          </p>
          <ul>
            {facts.map((item) => (
              <li key={item}><Check className="size-4" />{item}</li>
            ))}
          </ul>
          <Link className="kh-button kh-button-light" href="/factory">
            {zh ? "了解工厂" : "See the factory"}<ArrowRight className="size-4" />
          </Link>
          <FactoryLocationCard
            className="mt-4 max-w-xl"
            locale={locale}
            sourceBlock="home"
            mapProvider={zh ? "baidu_geocoder" : "google_directions"}
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
              <Image src={showcaseImages.factorySamplesFloor} alt={zh ? "科宏工厂样品与生产现场" : "Kehong factory samples and production floor"} fill sizes="(max-width: 1100px) 100vw, 48vw" className="object-cover" loading="lazy" />
              <span className="kh-fig-caption kh-mono">{zh ? "图04 — 生产现场" : "Fig.04 — Foshan production floor"}</span>
            </div>
          </Parallax>
          <Parallax strength={10} className="kh-factory-mini kh-media-shade">
            <Image src={showcaseImages.boothInterior01} alt={zh ? "纸品样品展示细节" : "Paper product sample display"} fill sizes="260px" className="object-cover" loading="lazy" />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
