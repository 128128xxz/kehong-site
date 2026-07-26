import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";

type CapabilityStep = {
  en: string;
  zh: string;
};

const steps: CapabilityStep[] = [
  { en: "Brief & material review", zh: "需求与材料确认" },
  { en: "Structural sampling", zh: "结构打样" },
  { en: "Converting & finishing", zh: "加工与后工艺" },
  { en: "Inspection & export packing", zh: "检验与出口包装" },
];

export default function HomeCapabilities({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-section kh-section-muted">
      <div className="kh-shell kh-capability-grid">
        <div className="kh-capability-media">
          <Image
            src={showcaseImages.machineClose}
            alt={zh ? "科宏纸品加工设备细节" : "Precision paper converting equipment at Kehong"}
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
            className="object-cover"
          />
        </div>
        <div className="kh-capability-copy">
          <p className="kh-eyebrow">{zh ? "定制能力" : "Custom capability"}</p>
          <h2>{zh ? "把规格变成可执行的生产方案。" : "Turn a packaging brief into a production-ready plan."}</h2>
          <p>
            {zh
              ? "尺寸、材料、印刷和后加工在同一个项目流程中确认，减少反复沟通，让样品更接近最终交付。"
              : "Dimensions, paper, printing and finishing are reviewed in one project workflow so sampling stays close to the final specification."}
          </p>
          <ol>
            {steps.map((step, index) => (
              <li key={step.en}>
                <b>0{index + 1}</b>
                <span>{zh ? step.zh : step.en}</span>
              </li>
            ))}
          </ol>
          <Link className="kh-text-link" href="/capabilities">
            {zh ? "查看制造能力" : "View manufacturing capabilities"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
