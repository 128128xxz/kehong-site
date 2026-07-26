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
    ? [companyProfile.location.zh, companyProfile.productionCapability.zh, companyProfile.exportExperience.zh]
    : [companyProfile.location.en, companyProfile.productionCapability.en, companyProfile.exportExperience.en];

  return (
    <section className="kh-section kh-section-forest">
      <div className="kh-shell kh-factory-grid">
        <Reveal>
          <SectionKicker index="05" text={zh ? "工厂与流程" : "Factory"} light />
          <h2>{zh ? "看得见的加工能力，服务海外项目。" : "Converting capability you can verify."}</h2>
          <p className="kh-section-lede">
            {zh
              ? "佛山工厂协调纸材加工、模切、分切、裱纸与定制打样，为海外 B2B 项目提供稳定的项目协同。"
              : "Our Foshan operation coordinates paper converting, die-cutting, slitting, lamination and custom sampling for overseas B2B projects."}
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
