import { ArrowUpRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import ResilientImage from "@/components/ui/ResilientImage";
import { homeEnglish } from "@/content/en/home";

const solutions = [
  {
    id: "food",
    image: showcaseImages.foodDetail,
    visual: "photo",
    href: "/products?search=food",
    en: { title: "Food & bakery packaging", tags: ["Food contact", "Grease resistance"], body: homeEnglish.solutions.food, mobileBody: "Paperboard structures for stable delivery and grease resistance." },
    zh: { title: "食品与烘焙包装", tags: ["食品接触", "防油结构"], body: "围绕尺寸、通风和配送稳定性规划纸盒、纸垫与包装结构。", mobileBody: "围绕配送稳定性和防油要求选择纸盒结构。" },
  },
  {
    id: "cupstock",
    image: showcaseImages.webPaperCupStacks,
    visual: "cupstock",
    href: "/products?search=cup",
    en: { title: "Cupstock & cup fan blanks", tags: ["GSM selection", "Coating"], body: homeEnglish.solutions.cupstock, mobileBody: "Cup fan blanks matched by GSM, coating and print area." },
    zh: { title: "杯纸与纸杯扇形片", tags: ["克重选择", "涂层"], body: "在打样前确认杯纸方向、克重和涂层。", mobileBody: "按克重、涂层和印刷区域匹配杯纸。" },
  },
  {
    id: "corrugated",
    image: showcaseImages.honeycomb,
    visual: "corrugated",
    href: "/products?search=corrugated",
    en: { title: "Corrugated board & specialty paper", tags: ["Board structure", "Material match"], body: homeEnglish.solutions.corrugated, mobileBody: "Board sections matched to protection, display and converting." },
    zh: { title: "瓦楞与特种纸", tags: ["坑型结构", "材料匹配"], body: "为防护、展示和定制加工选择纸板与特种纸。", mobileBody: "为防护、展示和加工匹配纸板结构。" },
  },
  {
    id: "inserts",
    image: showcaseImages.cakeBoardReal,
    visual: "inserts",
    href: "/products?search=insert",
    en: { title: "Inserts, pads & custom structures", tags: ["Die-cut", "Dimensional fit"], body: homeEnglish.solutions.inserts, mobileBody: "Die-cut pads and inserts for secure product fit." },
    zh: { title: "内托、纸垫与定制结构", tags: ["模切", "尺寸贴合"], body: "通过模切纸垫和内托，让产品在配送中保持稳定。", mobileBody: "通过模切纸垫和内托保持产品稳定。" },
  },
] as const;

export default async function SelectedSolutions() {
  const locale = await getLocale();
  const isZh = locale === "zh";
  const [lead, ...supporting] = solutions;

  return (
    <section id="solutions" className="bg-[#faf8f3] px-4 py-12 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-5 border-b border-[#d9d2be] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="kh-section-kicker">{isZh ? "解决方案入口" : "Featured solutions"}</p>
            <h2 className="kh-editorial-heading mt-4 max-w-2xl text-4xl leading-[.98] tracking-[-.045em] text-[#171713] sm:text-6xl">
              {isZh ? "为真实生产需求准备的包装方案。" : homeEnglish.solutions.heading}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#626156]">
            {isZh ? "从应用场景进入已经筛选的产品范围。" : homeEnglish.solutions.intro}
          </p>
        </div>

        <div className="kh-solutions-grid mt-8 grid gap-4 lg:grid-cols-12">
          <SolutionCard solution={lead} locale={locale} featured />
          {supporting.map((solution, index) => (
            <SolutionCard key={solution.id} solution={solution} locale={locale} supportIndex={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionCard({ solution, locale, featured = false, supportIndex }: { solution: (typeof solutions)[number]; locale: string; featured?: boolean; supportIndex?: number }) {
  const copy = locale === "zh" ? solution.zh : solution.en;
  const gridClass = featured ? "lg:col-span-6 lg:row-span-2" : supportIndex === 2 ? "lg:col-span-6" : "lg:col-span-3";

  if (supportIndex === 2) {
    return (
      <Link href={solution.href} className={`kh-solution-card kh-solution-card--split group overflow-hidden border border-[#cfc5b3] bg-[#eee7da] text-[#171713] ${gridClass}`}>
        <div className="kh-solution-split__media relative overflow-hidden">
          <SolutionVisual solution={solution} copy={copy} />
        </div>
        <div className="kh-solution-split__copy flex min-w-0 flex-col justify-center p-5">
          <h3 className="text-[1.35rem] font-semibold leading-[1.06] tracking-[-.025em] sm:text-2xl">{copy.title}</h3>
          <p className="kh-solution-copy mt-2 text-sm leading-5 text-[#626156]"><span className="kh-solution-copy__full">{copy.body}</span><span className="kh-solution-copy__mobile">{copy.mobileBody}</span></p>
          <div className="kh-solution-tags mt-3 flex flex-wrap gap-1.5">
            {copy.tags.map((tag) => <span key={tag} className="border border-[#18372e]/16 bg-white/55 px-2 py-1 text-[10px] font-bold text-[#18372e]">{tag}</span>)}
          </div>
          <span className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#805716]">{locale === "zh" ? "查看方案" : "View solution"}<ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={solution.href} className={`kh-solution-card group relative overflow-hidden border border-[#cfc5b3] bg-[#171713] text-white ${gridClass} ${featured ? "kh-solution-card--featured" : ""}`}>
      <SolutionVisual solution={solution} copy={copy} />
      <div className="kh-solution-card__content relative flex h-full min-h-[inherit] flex-col justify-end p-5 sm:p-6">
        <h3 className={`font-semibold leading-[1.06] tracking-[-.025em] ${featured ? "text-[1.75rem] sm:text-4xl" : "text-[1.35rem] sm:text-2xl"}`}>{copy.title}</h3>
        <p className={`kh-solution-copy mt-2 max-w-md text-sm leading-5 text-white/76 ${featured ? "sm:text-base" : ""}`}><span className="kh-solution-copy__full">{copy.body}</span><span className="kh-solution-copy__mobile">{copy.mobileBody}</span></p>
        <div className="kh-solution-tags mt-3 flex flex-wrap gap-1.5">
          {copy.tags.map((tag) => <span key={tag} className="border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold text-white/84">{tag}</span>)}
        </div>
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#e8c06c]">{locale === "zh" ? "查看方案" : "View solution"}<ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

function SolutionVisual({ solution, copy }: { solution: (typeof solutions)[number]; copy: (typeof solutions)[number]["en"] | (typeof solutions)[number]["zh"] }) {
  if (solution.visual === "photo") {
    return (
      <div className="kh-solution-visual relative overflow-hidden">
        <ResilientImage src={showcaseImages.foodOpen} fallbackSrc={showcaseImages.foodDetail} alt={copy.title} fill sizes="(min-width: 1024px) 50vw, 94vw" className="object-cover object-[18%_16%] opacity-72 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-84" />
      </div>
    );
  }

  return (
    <div className={`kh-solution-visual kh-solution-visual--${solution.visual}`} role="img" aria-label={copy.title}>
      {solution.visual === "cupstock" ? <>
        <div className="kh-cupfan"><span /><span /><span /><span /><span /></div>
        <span className="kh-solution-visual__label kh-solution-visual__label--top">PRINT AREA</span>
        <span className="kh-solution-visual__label kh-solution-visual__label--bottom">SIDE SEAM · BOTTOM FIT</span>
      </> : null}
      {solution.visual === "corrugated" ? <>
        <div className="kh-corrugated-section"><span /><span /><span /><span /><span /></div>
        <span className="kh-solution-visual__label kh-solution-visual__label--top">PAPERBOARD SECTION</span>
        <span className="kh-solution-visual__label kh-solution-visual__label--bottom">LINER · FLUTE · LINER</span>
      </> : null}
      {solution.visual === "inserts" ? <>
        <div className="kh-insert-structure"><span className="kh-insert-structure__base" /><span className="kh-insert-structure__wall kh-insert-structure__wall--left" /><span className="kh-insert-structure__wall kh-insert-structure__wall--right" /><span className="kh-insert-structure__slot" /></div>
        <span className="kh-solution-visual__label kh-solution-visual__label--top">DIE-CUT STRUCTURE</span>
        <span className="kh-solution-visual__label kh-solution-visual__label--bottom">FLAT · FOLDED · FITTED</span>
      </> : null}
    </div>
  );
}
