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
        "20+ 年纸品制造 · 8000+ 平方米厂房",
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
          <SectionKicker index="05" text={zh ? "公司与工厂" : "Company & factory"} light />
          <h2>{zh ? "看得见的加工能力，服务海外项目。" : "Converting capability you can verify."}</h2>
          <p className="kh-section-lede">
            {zh
              ? "科宏纸品是佛山的纸材加工与定制包装制造商。自有生产线覆盖模切、分切、裱纸与瓦楞成型，从纸材到成品在同一座工厂内完成，为海外 B2B 项目提供稳定的打样与交付协同。"
              : "Kehong Paper Products is a Foshan-based paper converting and custom packaging manufacturer. In-house lines cover die-cutting, slitting, lamination and corrugating, taking projects from raw board to finished packaging in one plant with dependable sampling and delivery coordination."}
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
            {zh ? "了解工厂与流程" : "See factory & process"}
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
