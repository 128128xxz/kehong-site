"use client";

import Image from "next/image";
import { useState } from "react";
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
};

const steps: readonly ProcessStep[] = [
  {
    id: "structure-dieline",
    title: "Structure & dieline confirmation",
    titleZh: "结构与刀模确认",
    body: "Confirm the box style, dimensions, dieline and sample against the intended use and load requirements.",
    bodyZh: "根据尺寸、用途和承重要求，确认盒型、刀模和样品。",
    image: showcaseImages.machineClose,
    figure: "Fig.01 — Die-cutting equipment",
    figureZh: "图01 — 模切设备",
    alt: "Close-up of automatic feeding equipment used for die-cutting preparation",
    altZh: "用于模切准备的自动送料设备近景",
  },
  {
    id: "paper-board-converting",
    title: "Paper & board converting",
    titleZh: "纸材与纸板加工",
    body: "Prepare paper and board to the confirmed grade, width, construction and surface specification.",
    bodyZh: "按确认的纸张等级、幅宽、纸板结构和表面要求进行加工准备。",
    image: showcaseImages.structureMaterialReal,
    figure: "Fig.02 — Paperboard material",
    figureZh: "图02 — 纸板材料",
    alt: "Paperboard material used to review structure and surface requirements",
    altZh: "用于核对结构与表面要求的纸板材料",
  },
  {
    id: "printing-finishing",
    title: "Printing & surface finishing",
    titleZh: "印刷与表面处理",
    body: "Check artwork, color and surface finish against the approved sample before the relevant production stage.",
    bodyZh: "根据确认样稿，核对颜色、图文内容和表面效果。",
    image: showcaseImages.swatch,
    figure: "Fig.03 — Colour and material swatches",
    figureZh: "图03 — 色样与材料样卡",
    alt: "Colour and material swatches used to review print and surface finish",
    altZh: "用于核对印刷颜色与表面效果的色样和材料样卡",
  },
  {
    id: "forming-packing",
    title: "Die-cutting, forming & packing",
    titleZh: "模切、成型与出货",
    body: "Complete die-cutting, creasing, mounting and forming, then inspect and pack for shipment.",
    bodyZh: "完成模切、压痕、裱贴和成型，检验后按项目要求包装出货。",
    image: showcaseImages.kraftCartonsPallet,
    figure: "Fig.04 — Cartons prepared for dispatch",
    figureZh: "图04 — 待出货纸箱",
    alt: "Kraft cartons staged on a pallet for dispatch",
    altZh: "码放在托盘上、等待出货的牛皮纸箱",
  },
];

export default function HomeProcess({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const [active, setActive] = useState(0);
  const current = steps[active];

  const move = (direction: 1 | -1) => {
    setActive((index) => (index + direction + steps.length) % steps.length);
  };

  return (
    <section className="kh-section kh-section-muted" data-testid="home-process">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="04" text={zh ? "生产流程" : "Process"} />
              <h2>{zh ? "从结构确认到成品出货，逐步完成打样、加工、检验和包装。" : "From structure approval to shipment, each stage covers a specific production task."}</h2>
            </div>
            <Link className="kh-text-link" href="/capabilities">
              {zh ? "查看制造能力" : "View manufacturing capabilities"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="kh-process-grid">
          <div
            id="home-process-panel"
            role="tabpanel"
            aria-labelledby={`home-process-tab-${current.id}`}
            className="kh-process-media kh-media-shade"
            data-active-step={current.id}
          >
            {steps.map((step, index) => (
              <div key={step.id} className={`kh-process-img${index === active ? " is-active" : ""}`} aria-hidden={index !== active}>
                <Image
                  src={step.image}
                  alt={index === active ? (zh ? step.altZh : step.alt) : ""}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1100px) 100vw, 52vw"
                  className="object-cover"
                />
              </div>
            ))}
            <span className="kh-fig-caption kh-mono" data-testid="process-caption">{zh ? current.figureZh : current.figure}</span>
          </div>

          <div role="tablist" aria-label={zh ? "首页生产步骤" : "Homepage production steps"} className="kh-process-steps">
            {steps.map((step, index) => (
              <button
                key={step.id}
                id={`home-process-tab-${step.id}`}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-controls="home-process-panel"
                tabIndex={index === active ? 0 : -1}
                className={`kh-process-step${index === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                    event.preventDefault();
                    move(1);
                  }
                  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    move(-1);
                  }
                  if (event.key === "Home") {
                    event.preventDefault();
                    setActive(0);
                  }
                  if (event.key === "End") {
                    event.preventDefault();
                    setActive(steps.length - 1);
                  }
                }}
              >
                <b>0{index + 1}</b>
                <span>
                  <span className="kh-process-step-title">{zh ? step.titleZh : step.title}</span>
                  <span className="kh-process-step-copy">{zh ? step.bodyZh : step.body}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
