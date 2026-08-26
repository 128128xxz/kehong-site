"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type MaterialCard = {
  image: string;
  figure: string;
  figureZh: string;
  alt: string;
  altZh: string;
};

const cards: MaterialCard[] = [
  { image: showcaseImages.honeycomb, figure: "Honeycomb core", figureZh: "蜂窝纸芯", alt: "Honeycomb paper core roll", altZh: "蜂窝纸芯纸卷" },
  { image: showcaseImages.swatch, figure: "Color flutes", figureZh: "彩色坑纸", alt: "Colored fluted paper swatches", altZh: "彩色坑纸样卡" },
  { image: showcaseImages.cakeBoardReal, figure: "Metallic boards", figureZh: "金银卡垫板", alt: "Metallic cake boards", altZh: "金银卡蛋糕垫板" },
  { image: showcaseImages.representativeMaterialSamples, figure: "Paper layers", figureZh: "纸材层次", alt: "Representative paper material layers", altZh: "代表性纸材层次示意图" },
  { image: showcaseImages.representativeBoxRange, figure: "Structural box", figureZh: "结构纸盒", alt: "Representative structural paper box range", altZh: "代表性结构纸盒示意图" },
  { image: showcaseImages.representativeInserts, figure: "Paper inserts", figureZh: "纸质内托", alt: "Representative paper inserts and trays", altZh: "代表性纸质内托与纸托示意图" },
  { image: showcaseImages.webPaperCupsKraft, figure: "Cupstock & cups", figureZh: "纸杯与杯纸", alt: "Kraft paper cups and box", altZh: "牛皮纸纸杯与纸盒" },
  { image: showcaseImages.representativeProtectiveStructures, figure: "Protective structures", figureZh: "保护型纸结构", alt: "Representative protective paper structures", altZh: "代表性保护型纸结构示意图" },
];

export default function HomeMaterialsGallery({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".kh-gallery-card");
    const step = (card?.offsetWidth ?? 320) + 16;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="kh-section">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="04" text={zh ? "材料与质感" : "Materials"} />
              <h2 className="">{zh ? "材料决定包装的手感与强度" : "Material sets the feel and the strength"}</h2>
            </div>
            <div className="kh-gallery-nav">
              <button type="button" aria-label={zh ? "向前浏览材料" : "Scroll materials backward"} onClick={() => scrollByCard(-1)}>
                <ArrowLeft className="size-4" />
              </button>
              <button type="button" aria-label={zh ? "向后浏览材料" : "Scroll materials forward"} onClick={() => scrollByCard(1)}>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div ref={trackRef} className="kh-gallery-track" tabIndex={0} aria-label={zh ? "材料画廊" : "Materials gallery"}>
            {cards.map((card, index) => (
              <figure key={card.figure} className="kh-gallery-card kh-media-shade m-0">
                <Image
                  src={card.image}
                  alt={zh ? card.altZh : card.alt}
                  fill
                  sizes="(max-width: 760px) 78vw, 30vw"
                  className="object-cover"
                />
                <figcaption className="kh-fig-caption kh-mono">
                  {`Fig.0${index + 1} — ${zh ? card.figureZh : card.figure}`}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
