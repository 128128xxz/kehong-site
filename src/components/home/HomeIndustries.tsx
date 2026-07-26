"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type BuyerPath = {
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
  href: string;
  image: string;
  alt: string;
  altZh: string;
};

const paths: BuyerPath[] = [
  {
    title: "Foodservice & bakery",
    titleZh: "餐饮与烘焙",
    body: "Boxes, boards and inserts for food and dessert workflows.",
    bodyZh: "餐盒、垫板与内托，适配餐饮和甜品的出品流程。",
    href: "/industries/bakery-packaging",
    image: showcaseImages.foodDetail,
    alt: "Food-grade fluted box detail",
    altZh: "食品级瓦楞纸盒细节",
  },
  {
    title: "Retail & lifestyle",
    titleZh: "零售与生活方式",
    body: "Carry bags, presentation boxes and branded paper components.",
    bodyZh: "手提袋、展示盒与品牌纸品部件，支持零售陈列与品牌呈现。",
    href: "/industries/retail-lifestyle",
    image: showcaseImages.displayWide,
    alt: "Retail display boxes",
    altZh: "零售展示纸盒",
  },
  {
    title: "E-commerce & professional",
    titleZh: "电商与专业供应链",
    body: "Mailers and protective structures for dispatch and handling.",
    bodyZh: "快递纸盒与保护性纸结构，应对运输、分拣和仓储环节。",
    href: "/industries/ecommerce-industrial-professional",
    image: showcaseImages.structureMaterialReal,
    alt: "Slitting line with white paper web",
    altZh: "分切产线上的白色纸幅",
  },
];

export default function HomeIndustries({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [previewOffset, setPreviewOffset] = useState(0);

  const focusRow = (index: number) => {
    setActive(index);
    const list = listRef.current;
    const row = rowRefs.current[index];
    if (!list || !row) return;
    const offset = row.offsetTop - list.offsetTop;
    setPreviewOffset(Math.max(0, offset));
  };

  return (
    <section className="kh-section">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="06" text={zh ? "行业与采购路径" : "Industries & buyer paths"} />
              <h2>{zh ? "从应用场景开始，找到合适的包装方向。" : "Start with the application, then shape the packaging."}</h2>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="kh-industry-wrap" ref={listRef}>
            <div className="kh-industry-list">
              {paths.map((path, index) => (
                <Link
                  href={path.href}
                  key={path.title}
                  ref={(node) => {
                    rowRefs.current[index] = node;
                  }}
                  className="kh-industry-row"
                  onMouseEnter={() => focusRow(index)}
                  onFocus={() => focusRow(index)}
                >
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{zh ? path.titleZh : path.title}</h3>
                    <p>{zh ? path.bodyZh : path.body}</p>
                  </div>
                  <span className="kh-industry-thumb" aria-hidden="true">
                    <Image src={path.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <ArrowUpRight className="size-5" />
                </Link>
              ))}
            </div>
            <div
              className="kh-industry-preview kh-media-shade"
              aria-hidden="true"
              style={{ transform: `translateY(${previewOffset}px)` }}
            >
              {paths.map((path, index) => (
                <div key={path.title} className={`kh-process-img${index === active ? " is-active" : ""}`}>
                  <Image src={path.image} alt="" fill sizes="280px" className="object-cover" />
                </div>
              ))}
              <span className="kh-fig-caption kh-mono">
                {`0${active + 1} — ${zh ? paths[active].titleZh : paths[active].title}`}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
