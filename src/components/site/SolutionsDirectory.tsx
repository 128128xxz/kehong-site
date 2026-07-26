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
    <section className="texture-paper min-h-[calc(100svh-4.5rem)] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[78rem]">
        <div className="grid gap-8 border-b border-(--kh-line) pb-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="kh-section-kicker">{isZh ? "包装解决方案" : "Packaging solutions"}</p>
            <h1 className="kh-editorial-heading mt-4 max-w-2xl text-4xl text-(--kh-ink) sm:text-6xl">
              {isZh ? "按应用选择结构。" : "Choose the structure by application."}
            </h1>
          </div>
          <p className="kh-lede max-w-xl">
            {isZh
              ? "从食品、杯纸到瓦楞和内托，先确认应用与保护要求，再进入匹配的产品范围。"
              : "Start with the application and protection requirement, then move into a focused product range for sampling and quotation."}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
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
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border p-4 transition ${
                    selected
                      ? "border-(--kh-forest) bg-(--kh-surface) shadow-(--kh-shadow-soft)"
                      : "border-(--kh-line) bg-(--kh-surface)/60 hover:border-(--kh-brass)"
                  }`}
                >
                  <span className="text-xs font-bold text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong className="block text-base font-semibold text-(--kh-ink)">{item.title}</strong>
                    <span className="mt-1 block text-sm leading-6 text-(--kh-muted)">{item.body}</span>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" className={selected ? "text-(--kh-forest)" : "text-(--kh-muted)"} />
                </Link>
              );
            })}
          </div>

          <div className="kh-panel overflow-hidden">
            <div className="relative aspect-[16/10] min-h-[280px]">
              <ResilientImage
                key={active.image}
                src={active.image}
                fallbackSrc={showcaseImages.foodOpen}
                alt={active.imageAlt}
                fill
                sizes="(min-width: 1024px) 58vw, 94vw"
                className="object-cover"
              />
              <span className="absolute bottom-4 left-4 rounded-md bg-(--kh-ink)/75 px-3 py-1.5 text-xs font-bold text-white">
                {isZh ? "当前方向" : "Selected direction"}
              </span>
            </div>
            <div className="p-6 sm:p-7">
              <p className="kh-section-kicker">{isZh ? "应用与生产需求" : "Application & production need"}</p>
              <h2 className="mt-3 text-2xl font-semibold text-(--kh-ink)">{copy.title}</h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-(--kh-muted)">{copy.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {copy.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-(--kh-line) bg-(--kh-paper) px-2.5 py-1.5 text-xs font-semibold text-(--kh-forest)">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={active.href} className="kh-button kh-button-primary mt-6">
                {isZh ? "进入产品范围" : "Open product range"}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
