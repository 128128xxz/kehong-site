import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import { packagingCategories } from "@/data/packagingCategories";
import { showcaseImages } from "@/data/visuals";

const comparisonRows = [
  ["Cake Board", "Paperboard support", "Everyday single-layer cakes and display", "Shape, surface and edge confirmed by project"],
  ["Cake Drum", "Thicker support direction", "Heavier or multi-layer presentation", "Finish and edge options confirmed by project"],
  ["MDF / Masonite", "Rigid board direction when offered", "Rigid or repeat-use requirements", "Only recommend when included in the confirmed range"],
  ["Mini Board", "Small-format board", "Single portions and small desserts", "Shape and finish confirmed by project"],
];
const comparisonRowsZh = [
  ["蛋糕底托", "纸板承托方向", "日常单层蛋糕与展示", "形状、表面与边缘按项目确认"],
  ["蛋糕鼓", "更厚的承托方向", "较重或多层蛋糕展示", "表面与边缘方案按项目确认"],
  ["MDF / 硬质纤维板", "可提供时的硬质板方向", "硬质或重复使用需求", "仅在确认产品范围内推荐"],
  ["迷你底托", "小尺寸承托板", "单人份与小型甜品", "形状与表面按项目确认"],
];

export default function BakeryPackagingPage({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const cakeBoxes = packagingCategories.find((item) => item.slug === "cake-boxes");
  const cakeBoards = packagingCategories.find((item) => item.slug === "cake-boards-cake-drums");
  const subcategoryCount =
    ((isZh ? cakeBoxes?.subcategories.zh.length : cakeBoxes?.subcategories.en.length) ?? 0) +
    ((isZh ? cakeBoards?.subcategories.zh.length : cakeBoards?.subcategories.en.length) ?? 0);
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "科宏 · 烘焙包装" : "Kehong · Bakery Packaging"}
          title={isZh ? "从蛋糕盒到承托底板，按烘焙场景选择" : "Bakery packaging built around presentation, support and transport."}
          lede={
            isZh
              ? "将蛋糕盒、纸板底托、蛋糕鼓和内托分开比较，围绕尺寸、开窗、携带、展示和运输需求提交项目。"
              : "Compare cake boxes, cake boards, cake drums and inserts by the job they need to do: presentation, support, carrying or transport."
          }
          image={{ src: showcaseImages.cakeBoardReal, alt: "Cake board and bakery packaging reference" }}
          meta={
            isZh
              ? [`${subcategoryCount} 个子类方向`, "OEM / ODM", "中国广东佛山"]
              : [`${subcategoryCount} subcategory directions`, "OEM / ODM", "Foshan, Guangdong, China"]
          }
        >
          <Link href="/packaging/cake-boxes" className="kh-button kh-button-light">
            {isZh ? "浏览蛋糕盒" : "Explore cake boxes"} <ArrowRight className="size-4" />
          </Link>
          <Link href="/packaging/cake-boards-cake-drums" className="kh-button kh-button-ghost">
            {isZh ? "对比蛋糕底托" : "Compare cake boards"}
          </Link>
        </PageHero>

        <section className="kh-section kh-section-paper border-b border-(--kh-line)">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="02" text={isZh ? "烘焙品类" : "Bakery categories"} />
                  <h2>{isZh ? "展示与承托，两条主线。" : "Presentation and support, two directions."}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 lg:grid-cols-2">
              {[cakeBoxes, cakeBoards].filter(Boolean).map((item, index) => (
                <Reveal key={item!.slug} className="h-full" delay={index * 100}>
                  <article className="kh-system-card h-full">
                    <div className="kh-card-media kh-media-shade">
                      <Image
                        src={item!.image}
                        alt={`${item!.title.en} reference`}
                        fill
                        sizes="(min-width: 1024px) 46vw, 96vw"
                        className="object-cover"
                      />
                      <span className="kh-fig-caption kh-mono">
                        {`Fig.0${index + 1} — ${isZh ? item!.title.zh : item!.title.en}`}
                      </span>
                    </div>
                    <div className="kh-system-copy">
                      <h3>{isZh ? item!.title.zh : item!.title.en}</h3>
                      <p>{isZh ? item!.description.zh : item!.description.en}</p>
                      <ul className="grid gap-2">
                        {(isZh ? item!.subcategories.zh : item!.subcategories.en).slice(0, 7).map((sub) => (
                          <li key={sub} className="flex gap-2 text-sm font-medium text-(--kh-ink)">
                            <Check className="mt-1 size-4 shrink-0 text-(--kh-brass)" />
                            {sub}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={item!.slug === "cake-boxes" ? "/packaging/cake-boxes" : "/packaging/cake-boards-cake-drums"}
                        className="kh-text-link mt-6"
                      >
                        {isZh ? "查看范围" : "View range"} <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="03" text={isZh ? "选型对照" : "Board comparison"} />
                  <h2>{isZh ? "四种底托，逐项对比。" : "Compare the four board formats."}</h2>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="overflow-x-auto rounded-lg border border-(--kh-line) bg-(--kh-surface)">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <caption className="sr-only">{isZh ? "蛋糕底托、蛋糕鼓、MDF 硬质板和迷你底托对比" : "Cake Board vs Cake Drum vs MDF / Masonite vs Mini Board"}</caption>
                  <thead className="bg-(--kh-paper) text-(--kh-brass)">
                    <tr>
                      <th className="kh-mono px-5 py-3">{isZh ? "类型" : "Type"}</th>
                      <th className="kh-mono px-5 py-3">{isZh ? "结构" : "Construction"}</th>
                      <th className="kh-mono px-5 py-3">{isZh ? "适用场景" : "Best use"}</th>
                      <th className="kh-mono px-5 py-3">{isZh ? "表面 / 边缘" : "Surface / edge"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isZh ? comparisonRowsZh : comparisonRows).map((row) => (
                      <tr key={row[0]} className="border-t border-(--kh-line)">
                        <th className="px-5 py-4 font-bold">{row[0]}</th>
                        {row.slice(1).map((cell) => (
                          <td key={cell} className="px-5 py-4 leading-6 text-(--kh-muted)">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-6 rounded-lg border border-(--kh-line) bg-(--kh-brass-soft) p-6">
                <h3 className="text-2xl font-semibold text-(--kh-ink)">{isZh ? "如何选择" : "How to choose"}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-(--kh-ink)">
                  {isZh ? "日常单层蛋糕可先从蛋糕底托开始；较重或多层展示可评审蛋糕鼓方向；硬质或重复使用需求请确认 MDF / 硬质纤维板是否属于当前可供范围；小型甜品可考虑迷你底托。" : "Everyday single-layer cake: start with a Cake Board. Heavier or multi-layer presentation: review a Cake Drum. Rigid or repeat-use directions: ask whether MDF/Masonite is part of the confirmed range. Small desserts: consider a Mini Board."}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
