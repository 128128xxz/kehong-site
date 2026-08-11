"use client";

import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import ResilientImage from "@/components/ui/ResilientImage";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";

const solutions = [
  {
    id: "food",
    href: "/products?search=food",
    image: showcaseImages.foodOpen,
    imageAlt: "Food and bakery paper boxes prepared for delivery",
    en: { title: "Food & bakery packaging", body: "Paper boxes, pads and bakery structures for practical food programs; final material and use requirements are confirmed by project.", tags: ["Structure review", "Material confirmation"] },
    zh: { title: "食品与烘焙包装", body: "食品包装盒、纸垫和烘焙包装结构", tags: ["结构适配", "材料确认"] },
  },
  {
    id: "cupstock",
    href: "/products?search=cup",
    image: showcaseImages.webPaperCupStacks,
    imageAlt: "Paper cup fan blanks and cupstock material",
    en: { title: "Cupstock & cup fan blanks", body: "Cupstock matched by GSM, coating, print area and forming requirement.", tags: ["GSM selection", "Coating"] },
    zh: { title: "杯纸与纸杯扇形片", body: "按克重、涂层、印刷区域和成型要求匹配杯纸", tags: ["克重选择", "涂层"] },
  },
  {
    id: "corrugated",
    href: "/products?search=corrugated",
    image: showcaseImages.swatch,
    imageAlt: "Corrugated board edge and paperboard layers",
    en: { title: "Corrugated board & specialty paper", body: "Board sections and specialty stocks for protection, display and converting.", tags: ["Board structure", "Material match"] },
    zh: { title: "瓦楞纸板与特种纸", body: "防护、展示和加工用纸板结构和特种纸", tags: ["坑型结构", "材料匹配"] },
  },
  {
    id: "inserts",
    href: "/products?search=insert",
    image: showcaseImages.cakeBoardReal,
    imageAlt: "Die-cut paper insert and bakery pad structure",
    en: { title: "Inserts, pads & custom structures", body: "Die-cut pads and inserts that keep products fitted and protected in transit.", tags: ["Die-cut", "Dimensional fit"] },
    zh: { title: "内托、纸垫与定制结构", body: "通过模切纸垫和内托让产品在运输中保持稳定", tags: ["模切", "尺寸贴合"] },
  },
] as const;

export default function SolutionsDirectory() {
  const locale = useLocale();
  const isZh = locale === "zh";
  const [activeId, setActiveId] = useState<(typeof solutions)[number]["id"]>(solutions[0].id);
  const active = solutions.find((solution) => solution.id === activeId) ?? solutions[0];
  const activeIndex = solutions.findIndex((solution) => solution.id === active.id);
  const copy = isZh ? active.zh : active.en;

  return (
    <section id="solutions-directory" className="kh-section kh-section-paper scroll-mt-24">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={isZh ? "解决方案" : "Solutions"} />
              <h2>{isZh ? "四类应用，覆盖主要生产需求。" : "Four applications for common production needs."}</h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
            <div className="grid content-start gap-2" role="list" aria-label={isZh ? "解决方案分类" : "Solution categories"}>
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
                        ? "border-(--kh-forest) bg-(--kh-paper) shadow-(--kh-shadow-soft)"
                        : "border-(--kh-line) bg-(--kh-paper)/55 hover:border-(--kh-brass)"
                    }`}
                  >
                    <span className="kh-mono kh-kicker-index">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <strong className="block text-base font-semibold text-(--kh-ink)">{item.title}</strong>
                      <span className="mt-1 block text-sm leading-6 text-(--kh-muted)">{item.body}</span>
                    </span>
                    <ArrowRight size={17} aria-hidden="true" className={selected ? "text-(--kh-forest)" : "text-(--kh-muted)"} />
                  </Link>
                );
              })}
            </div>

            <div className="kh-system-card">
              <div className="kh-card-media kh-media-shade aspect-[16/10] min-h-[280px]">
                <ResilientImage
                  key={active.image}
                  src={active.image}
                  fallbackSrc={showcaseImages.foodOpen}
                  alt={active.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 94vw"
                  className="object-cover"
                />
                <span className="kh-fig-caption kh-mono">
                  {`Fig.0${activeIndex + 1} — ${copy.title}`}
                </span>
              </div>
              <div className="kh-system-copy p-6 sm:p-7">
                <p className="kh-eyebrow">{isZh ? "应用和生产需求" : "Application & production need"}</p>
                <h3 className="mt-3 text-2xl font-semibold text-(--kh-ink)">{copy.title}</h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-(--kh-muted)">{copy.body}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {copy.tags.map((tag) => (
                    <span key={tag} className="kh-mono rounded-md border border-(--kh-line) bg-(--kh-paper) px-2.5 py-1.5 text-(--kh-forest)">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={active.href} className="kh-button kh-button-primary mt-6">
                  {isZh ? "查看规格" : "Open product range"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
