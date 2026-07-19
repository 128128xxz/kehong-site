"use client";

import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import ResilientImage from "@/components/ui/ResilientImage";

const solutions = [
  {
    id: "food",
    href: "/products?search=food",
    image: showcaseImages.foodOpen,
    imageAlt: "Food and bakery paper boxes prepared for delivery",
    en: { title: "Food & bakery packaging", body: "Oil-resistant boxes, pads and bakery structures for practical food programs.", tags: ["Food contact", "Oil resistance"] },
    zh: { title: "食品与烘焙包装", body: "面向食品项目的防油纸盒、纸垫与烘焙包装结构。", tags: ["食品接触", "防油结构"] },
  },
  {
    id: "cupstock",
    href: "/products?search=cup",
    image: showcaseImages.webPaperCupStacks,
    imageAlt: "Paper cup fan blanks and cupstock material",
    en: { title: "Cupstock & cup fan blanks", body: "Cupstock matched by GSM, coating, print area and forming requirement.", tags: ["GSM selection", "Coating"] },
    zh: { title: "杯纸与纸杯扇形片", body: "按克重、涂层、印刷区域与成型要求匹配杯纸。", tags: ["克重选择", "涂层"] },
  },
  {
    id: "corrugated",
    href: "/products?search=corrugated",
    image: showcaseImages.swatch,
    imageAlt: "Corrugated board edge and paperboard layers",
    en: { title: "Corrugated board & specialty paper", body: "Board sections and specialty stocks for protection, display and converting.", tags: ["Board structure", "Material match"] },
    zh: { title: "瓦楞纸板与特种纸", body: "用于防护、展示与加工的纸板结构和特种纸。", tags: ["坑型结构", "材料匹配"] },
  },
  {
    id: "inserts",
    href: "/products?search=insert",
    image: showcaseImages.cakeBoardReal,
    imageAlt: "Die-cut paper insert and bakery pad structure",
    en: { title: "Inserts, pads & custom structures", body: "Die-cut pads and inserts that keep products fitted and protected in transit.", tags: ["Die-cut", "Dimensional fit"] },
    zh: { title: "内托、纸垫与定制结构", body: "通过模切纸垫与内托，让产品在运输中保持稳定。", tags: ["模切", "尺寸贴合"] },
  },
] as const;

export default function SolutionsDirectory() {
  const locale = useLocale();
  const isZh = locale === "zh";
  const [activeId, setActiveId] = useState<(typeof solutions)[number]["id"]>(solutions[0].id);
  const active = solutions.find((solution) => solution.id === activeId) ?? solutions[0];
  const copy = isZh ? active.zh : active.en;

  return (
    <section className="solutions-directory texture-paper min-h-[calc(100svh-4.5rem)] bg-[#f6f4ec] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-8 border-b border-[#d9d2be] pb-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="kh-section-kicker">{isZh ? "包装解决方案" : "Packaging solutions"}</p>
            <h1 className="kh-editorial-heading mt-4 max-w-2xl text-5xl leading-[.94] tracking-[-.055em] text-[#171713] sm:text-7xl">{isZh ? "按应用选择结构。" : "Choose the structure by application."}</h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-[#626156]">{isZh ? "从食品、杯纸到瓦楞和内托，先确认应用与保护要求，再进入匹配的产品范围。" : "Start with the application and protection requirement, then move into a focused product range for sampling and quotation."}</p>
        </div>

        <div className="solutions-directory__grid mt-8 grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
          <div className="grid content-start gap-2" role="list" aria-label={isZh ? "解决方案方向" : "Solution directions"}>
            {solutions.map((solution, index) => {
              const item = isZh ? solution.zh : solution.en;
              const selected = active.id === solution.id;
              return (
                <Link
                  key={solution.id}
                  href={solution.href}
                  role="listitem"
                  onMouseEnter={() => setActiveId(solution.id)}
                  onFocus={() => setActiveId(solution.id)}
                  className={`solutions-directory__item ${selected ? "is-selected" : ""}`}
                >
                  <span className="solutions-directory__item-number">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.title}</strong><small>{item.body}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          <div className="solutions-directory__feature">
            <div className="solutions-directory__feature-media">
              <ResilientImage key={active.image} src={active.image} fallbackSrc={showcaseImages.foodOpen} alt={active.imageAlt} fill sizes="(min-width: 1024px) 58vw, 94vw" className="object-cover" />
              <span>{isZh ? "当前方向" : "Selected direction"}</span>
            </div>
            <div className="solutions-directory__feature-copy">
              <p className="kh-section-kicker">{isZh ? "应用与生产需求" : "Application & production need"}</p>
              <h2>{copy.title}</h2>
              <p>{copy.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">{copy.tags.map((tag) => <span key={tag} className="border border-[#18372e]/18 bg-[#f6f4ec] px-2.5 py-1.5 text-xs font-bold text-[#18372e]">{tag}</span>)}</div>
              <Link href={active.href} className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#18372e] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#102820]">{isZh ? "进入产品范围" : "Open product range"}<ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
