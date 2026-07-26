import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";

export default function HomeFactoryProof({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const proofItems = zh
    ? [
        companyProfile.location.zh,
        companyProfile.productionCapability.zh,
        companyProfile.exportExperience.zh,
      ]
    : [
        companyProfile.location.en,
        companyProfile.productionCapability.en,
        companyProfile.exportExperience.en,
      ];

  return (
    <section className="kh-section kh-section-forest">
      <div className="kh-shell kh-factory-grid">
        <div>
          <p className="kh-eyebrow kh-eyebrow-light">{zh ? "工厂与流程" : "Factory proof"}</p>
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
        </div>
        <div className="kh-factory-image">
          <Image
            src={showcaseImages.machine}
            alt={zh ? "科宏纸品生产线" : "Kehong paper converting production line"}
            fill
            sizes="(max-width: 900px) 100vw, 52vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
