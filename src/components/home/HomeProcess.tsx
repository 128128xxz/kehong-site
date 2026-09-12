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
    id: "material-preparation",
    title: "Material preparation",
    titleZh: "材料准备",
    body: "Select the paper, board and finish direction for the project.",
    bodyZh: "根据项目选择纸材、纸板和表面方向。",
    image: showcaseImages.structureMaterialReal,
    figure: "Fig.01 — Paper and board selection",
    figureZh: "图01 — 纸材与纸板选择",
    alt: "Paper and board materials prepared for a packaging project",
    altZh: "为包装项目准备的纸材与纸板",
  },
  {
    id: "slitting-converting",
    title: "Slitting & converting",
    titleZh: "分切与加工",
    body: "Prepare rolls or sheets in the working format required by the structure.",
    bodyZh: "将卷材或平张加工为结构所需的规格。",
    image: showcaseImages.machineClose,
    figure: "Fig.02 — Converting equipment",
    figureZh: "图02 — 加工设备",
    alt: "Paper converting equipment prepared for production",
    altZh: "用于纸材加工的生产设备",
  },
  {
    id: "corrugating-mounting",
    title: "Corrugating / mounting",
    titleZh: "瓦楞与裱纸",
    body: "Build the board construction for protection, rigidity and fit.",
    bodyZh: "完成保护性、挺度和尺寸匹配所需的板材结构。",
    image: showcaseImages.corrugatorHall,
    figure: "Fig.03 — Board construction",
    figureZh: "图03 — 板材结构",
    alt: "Corrugated paper structure prepared for packaging conversion",
    altZh: "用于包装加工的瓦楞纸结构",
  },
  {
    id: "printing",
    title: "Printing",
    titleZh: "印刷",
    body: "Apply the approved artwork, brand colours and print coverage.",
    bodyZh: "完成确认后的图稿、品牌颜色和印刷覆盖。",
    image: showcaseImages.swatch,
    figure: "Fig.04 — Colour and material review",
    figureZh: "图04 — 颜色与材料核对",
    alt: "Colour and material swatches used to review packaging print",
    altZh: "用于核对包装印刷的颜色和材料样卡",
  },
  {
    id: "die-cutting",
    title: "Die cutting",
    titleZh: "模切",
    body: "Cut panels, openings and fold lines to the selected structure.",
    bodyZh: "按选定结构完成面板、开口和折线模切。",
    image: showcaseImages.machine,
    figure: "Fig.05 — Automatic feeding and die cutting",
    figureZh: "图05 — 自动送料与模切",
    alt: "Automatic feeding line used for paper packaging production",
    altZh: "用于纸品包装生产的自动送料线",
  },
  {
    id: "forming-assembly",
    title: "Forming / assembly",
    titleZh: "成型与组装",
    body: "Fold, glue and assemble the finished packaging format.",
    bodyZh: "完成成品包装的折叠、粘合与组装。",
    image: showcaseImages.foodBoxRealAlt,
    figure: "Fig.06 — Finished packaging structure",
    figureZh: "图06 — 成品包装结构",
    alt: "Finished paper packaging structure ready for assembly review",
    altZh: "待核对组装的成品纸品包装结构",
  },
  {
    id: "quality-inspection",
    title: "Quality inspection",
    titleZh: "质量检验",
    body: "Review fit, appearance, dimensions and packing condition.",
    bodyZh: "检查配合度、外观、尺寸和包装状态。",
    image: showcaseImages.factorySamplesFloor,
    figure: "Fig.07 — Sample and production review",
    figureZh: "图07 — 样品与生产核对",
    alt: "Paper packaging samples arranged for quality review",
    altZh: "用于质量核对的纸品包装样品",
  },
  {
    id: "packing-shipment",
    title: "Packing & shipment",
    titleZh: "装箱与出货",
    body: "Pack the agreed quantity and prepare shipment information.",
    bodyZh: "按确认数量装箱并准备出货信息。",
    image: showcaseImages.kraftCartonsPallet,
    figure: "Fig.08 — Cartons prepared for shipment",
    figureZh: "图08 — 装箱出货",
    alt: "Paper cartons staged for shipment",
    altZh: "等待出货的纸箱包装",
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
              <h2 className="">{zh ? "科宏如何制造你的纸包装" : "How We Make Your Packaging"}</h2>
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
