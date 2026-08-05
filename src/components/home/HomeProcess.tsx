"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type ProcessStep = {
  id: string;
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
  image: string;
  figure: string;
  figureZh: string;
  alt: string;
  altZh: string;
  /** goldBoard 实为分切产线,画面偏亮,叠深绿色罩保证图注可读 */
  veil?: boolean;
};

const steps: ProcessStep[] = [
  {
    id: "die-cutting",
    title: "Die-cutting & forming",
    titleZh: "模切与成型",
    body: "Precision die-cutting turns approved drawings into repeatable structures.",
    bodyZh: "精密模切把确认后的图纸变成可重复生产的结构。",
    image: showcaseImages.machineClose,
    figure: "Fig.01 — Die-cutting line",
    figureZh: "图01 — 模切产线",
    alt: "Close-up of the automatic feeder on a die-cutting line",
    altZh: "模切产线自动飞达近景",
  },
  {
    id: "corrugated",
    title: "Corrugating & board",
    titleZh: "瓦楞与纸板",
    body: "Fluted and laminated board built for strength, weight and finish.",
    bodyZh: "坑纸与复合纸板兼顾强度、克重与表面效果。",
    image: showcaseImages.structureMaterialReal,
    figure: "Fig.02 — Slitting line",
    figureZh: "图02 — 分切产线",
    alt: "White paper web running through a slitting line",
    altZh: "分切产线上的白色纸幅",
  },
  {
    id: "dyeing",
    title: "Color & surface",
    titleZh: "染色与印面",
    body: "Dyed papers and surface treatments matched against approved samples.",
    bodyZh: "染色纸与表面处理按封样逐批对色。",
    image: showcaseImages.swatch,
    figure: "Fig.03 — Color library",
    figureZh: "图03 — 色卡样库",
    alt: "Colored fluted paper swatch library",
    altZh: "彩色坑纸样卡库",
  },
  {
    id: "laminating",
    title: "Lamination & finishing",
    titleZh: "裱纸与后加工",
    body: "Lamination, mounting and finishing prepared for export packing.",
    bodyZh: "裱纸、复合与后加工，按出口包装要求收尾。",
    image: showcaseImages.slittingLinePink,
    figure: "Fig.04 — Converting hall",
    figureZh: "图04 — 加工车间",
    alt: "Converting hall with slitting equipment and paper rolls",
    altZh: "配备分切设备与纸卷的加工车间",
    veil: true,
  },
];

export default function HomeProcess({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);

  // 桌面端:滚动经过步骤时切换左侧媒体(原生滚动,非劫持)
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1101px)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stepRefs.current.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    for (const node of stepRefs.current) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="kh-section kh-section-muted">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="04" text={zh ? "工艺流程" : "Process"} />
              <h2>{zh ? "把规格变成可执行的生产方案。" : "Turn a packaging brief into a production-ready plan."}</h2>
            </div>
            <Link className="kh-text-link" href="/capabilities">
              {zh ? "查看制造能力" : "View manufacturing capabilities"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="kh-process-grid">
          <div className="kh-process-media kh-media-shade">
            {steps.map((step, index) => (
              <div key={step.id} className={`kh-process-img${index === active ? " is-active" : ""}`}>
                <Image
                  src={step.image}
                  alt={zh ? step.altZh : step.alt}
                  fill
                  sizes="(max-width: 1100px) 100vw, 52vw"
                  className="object-cover"
                />
                {step.veil ? <div className="absolute inset-0 bg-(--kh-forest)/25" aria-hidden="true" /> : null}
              </div>
            ))}
            <span className="kh-fig-caption kh-mono">{zh ? steps[active].figureZh : steps[active].figure}</span>
          </div>

          <div>
            <ol className="kh-process-steps">
              {steps.map((step, index) => (
                <li
                  key={step.id}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  className={`kh-process-step${index === active ? " is-active" : ""}`}
                >
                  <b>0{index + 1}</b>
                  <div>
                    <h3>{zh ? step.titleZh : step.title}</h3>
                    <p>{zh ? step.bodyZh : step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="kh-process-tabs" role="tablist" aria-label={zh ? "工艺步骤" : "Process steps"}>
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={index === active ? "is-active" : ""}
                  onClick={() => setActive(index)}
                >
                  {`0${index + 1} ${zh ? step.titleZh : step.title}`}
                </button>
              ))}
            </div>
            <p className="kh-process-mobile-copy hidden">
              {zh ? steps[active].bodyZh : steps[active].body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
