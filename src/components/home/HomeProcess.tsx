"use client";

import Image from "next/image";
import { useState } from "react";
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
    body: "Confirm the box style, dimensions and dieline before sampling.",
    bodyZh: "确认盒型、刀模。",
    image: showcaseImages.machineClose,
    figure: "Fig.01 — Die-cutting equipment",
    figureZh: "图01 — 模切",
    alt: "Close-up of automatic feeding equipment used for die-cutting preparation",
    altZh: "用于模切准备的自动送料设备近景",
  },
  {
    id: "paper-board-converting",
    title: "Paper & board converting",
    titleZh: "纸材与纸板加工",
    body: "Prepare paper and board to the confirmed specification.",
    bodyZh: "按纸张要求备料。",
    image: showcaseImages.honeycomb,
    figure: "Fig.02 — Paperboard material",
    figureZh: "图02 — 纸材",
    alt: "Paperboard material used to review structure and surface requirements",
    altZh: "用于核对结构与表面要求的纸板材料",
  },
  {
    id: "printing-finishing",
    title: "Printing & surface finishing",
    titleZh: "印刷与表面处理",
    body: "Check artwork, colour and surface finish against the sample.",
    bodyZh: "核对颜色和效果。",
    image: showcaseImages.swatch,
    figure: "Fig.03 — Colour and material swatches",
    figureZh: "图03 — 色样",
    alt: "Colour and material swatches used to review print and surface finish",
    altZh: "用于核对印刷颜色与表面效果的色样和材料样卡",
  },
  {
    id: "forming-packing",
    title: "Die-cutting, forming & packing",
    titleZh: "模切、成型与出货",
    body: "Complete converting, inspect the result and pack for dispatch.",
    bodyZh: "加工、检验、出货。",
    image: showcaseImages.kraftCartonsPallet,
    figure: "Fig.04 — Cartons prepared for dispatch",
    figureZh: "图04 — 出货",
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
    <section className="kh-section kh-section-muted kh-home-process" data-testid="home-process">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="03" text={zh ? "流程" : "Process"} />
              <h2>{zh ? "确认结构，完成加工" : "Four clear steps from structure approval to dispatch"}</h2>
            </div>
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
            <div key={current.id} className="kh-process-img is-active">
              <Image
                src={current.image}
                alt={zh ? current.altZh : current.alt}
                fill
                loading="eager"
                fetchPriority="low"
                decoding="async"
                sizes="(max-width: 1100px) 100vw, 52vw"
                className="object-cover"
              />
            </div>
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
