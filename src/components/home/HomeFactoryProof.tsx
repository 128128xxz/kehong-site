import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { getFactoryMapUrl } from "@/data/companyLocation";
import { Parallax, Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

export default function HomeFactoryProof({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const facts = zh
    ? ["佛山生产场地", "20+ 年纸品加工", "模切、分切、裱纸、瓦楞"]
    : ["Foshan production site", "20+ years in paper converting", "Die-cutting, slitting, mounting and corrugated processing"];

  return (
    <section className="kh-section kh-section-forest">
      <div className="kh-shell kh-factory-grid">
        <Reveal>
          <SectionKicker index="04" text={zh ? "工厂" : "Factory & capability"} light />
          <h2>{zh ? "佛山完成纸材加工。" : "Paper converting that moves from sample to shipment."}</h2>
          <p className="kh-section-lede">
            {zh ? "材料、结构、加工对接。" : "One team coordinates material, structure, converting and dispatch."}
          </p>
          <ul>
            {facts.map((item) => (
              <li key={item}><Check className="size-4" />{item}</li>
            ))}
          </ul>
          <Link className="kh-button kh-button-light" href="/factory">
            {zh ? "了解工厂" : "See the factory"}<ArrowRight className="size-4" />
          </Link>
          <a className="kh-text-link mt-4 min-h-11 px-1 text-white/80" href={getFactoryMapUrl(locale)} target="_blank" rel="noopener noreferrer" aria-label={zh ? "在高德地图中查看科宏纸品工厂位置" : "View Kehong factory location on Google Maps"}>
            {zh ? "查看工厂位置" : "View factory location"}<ArrowRight className="size-4" />
          </a>
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
