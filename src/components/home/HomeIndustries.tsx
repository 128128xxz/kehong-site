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
    body: "Boxes, cake boards and paper inserts for takeaway food, bakery and foodservice packaging.",
    bodyZh: "餐盒、蛋糕托和纸内托，面向外带、烘焙和餐饮包装需求。",
    href: "/industries/bakery-packaging",
    image: showcaseImages.bakeryDessertDisplay,
    alt: "Bakery desserts presented on Kehong paper packaging",
    altZh: "科宏纸品包装上的烘焙甜品陈列",
  },
  {
    title: "Retail & lifestyle",
    titleZh: "零售与品牌包装",
    body: "Paper bags, presentation boxes and paper components for retail display and branded carry packaging.",
    bodyZh: "纸袋、展示盒和纸质配件，面向零售陈列和品牌手提袋包装。",
    href: "/industries/retail-lifestyle",
    image: showcaseImages.displayWide,
    alt: "Retail display boxes",
    altZh: "零售展示纸盒",
  },
  {
    title: "E-commerce & distribution",
    titleZh: "电商与运输包装",
    body: "Corrugated mailers and protective paper structures for e-commerce dispatch, transport and storage.",
    bodyZh: "瓦楞邮寄盒和保护性纸结构，面向电商发货、运输和仓储场景。",
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
              <SectionKicker index="06" text={zh ? "按用途选择包装" : "Packaging by application"} />
              <h2>{zh ? "按产品用途选择合适的包装类型。" : "Choose packaging by product use."}</h2>
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
