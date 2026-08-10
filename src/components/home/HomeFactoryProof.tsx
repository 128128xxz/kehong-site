import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { Parallax, Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

export default function HomeFactoryProof({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const proofItems = zh
    ? [
        companyProfile.location.zh,
        "20+ 年纸品制造 · 8,000+ 平方米厂房",
        companyProfile.productionCapability.zh,
        "OEM / ODM 定制与弹性起订量",
        companyProfile.exportExperience.zh,
      ]
    : [
        companyProfile.location.en,
        "20+ years in paper converting · 8000+ m² factory",
        companyProfile.productionCapability.en,
        "OEM / ODM projects with flexible order volumes",
        companyProfile.exportExperience.en,
      ];

  return (
    <section className="kh-section kh-section-forest">
      <div className="kh-shell kh-factory-grid">
        <Reveal>
          <SectionKicker index="05" text={zh ? "公司和工厂" : "Company & factory"} light />
          <h2>{zh ? "佛山工厂完成纸材加工、结构打样与成品包装。" : "Paper converting and packaging production in Foshan."}</h2>
          <p className="kh-section-lede">
            {zh
              ? "科宏在佛山工厂完成模切、分切、裱纸和瓦楞成型，按项目要求安排结构打样、质量检验和出货准备。"
              : "Kehong operates die-cutting, slitting, paper mounting and corrugated converting lines in Foshan. The same team handles sampling, inspection and shipment preparation."}
          </p>
          <ul>
            {proofItems.map((item) => (
              <li key={item}>
                <Check className="size-4" />
                {item}
              </li>
            ))}
          </ul>
          <Link className="kh-button kh-button-light" href="/factory">
            {zh ? "了解工厂和流程" : "See factory & process"}
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <div className="kh-factory-stack">
          <Parallax strength={-10}>
            <div className="kh-factory-main kh-media-shade">
              <Image
                src={showcaseImages.feederOperator}
                alt={zh ? "科宏工人操作自动飞达设备" : "Kehong operator working at an automatic feeder"}
                fill
                sizes="(max-width: 1100px) 100vw, 40vw"
                className="object-cover"
              />
              <span className="kh-fig-caption kh-mono">
                {zh ? "图05 — 飞达操作" : "Fig.05 — Feeder operator"}
              </span>
            </div>
          </Parallax>
          <Parallax strength={14} className="kh-factory-mini kh-media-shade">
            <Image
              src={showcaseImages.machine}
              alt={zh ? "自动上料产线" : "Automatic feeder line"}
              fill
              sizes="260px"
              className="object-cover"
            />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
