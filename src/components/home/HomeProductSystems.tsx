import Image from "next/image";
import { ArrowRight, ArrowUpRight, Layers3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import { showcaseImages } from "@/data/visuals";
import { getHomepageProductEntries, getProductEntry } from "@/lib/product-routing";

const systemVisuals = [
  {
    id: "materials",
    title: "Paper Materials & Components",
    titleZh: "纸材与半成品",
    description: "Cupstock, cup fan blanks, coated rolls, kraft, corrugated board, specialty paper, inserts and pads.",
    descriptionZh: "杯纸、扇形片、淋膜卷材、牛皮纸、瓦楞纸板、特种纸、内托与纸垫。",
    details: ["Material grades", "GSM & coating", "Converting-ready formats"],
    detailsZh: ["材料等级", "克重与涂层", "适配加工的规格"],
    image: showcaseImages.structureMaterialReal,
    alt: "Paperboard layers and material cross sections for packaging conversion",
  },
  {
    id: "packaging",
    title: "Finished Packaging",
    titleZh: "成品纸包装",
    description: "Food boxes, cake boxes, paper bags, mailer boxes, trays and custom paperboard structures.",
    descriptionZh: "食品盒、蛋糕盒、纸袋、邮寄盒、纸托与定制纸板结构。",
    details: ["Structural sampling", "Print & finish", "Export packing support"],
    detailsZh: ["结构打样", "印刷与后加工", "出口包装协同"],
    image: showcaseImages.representativeBakeryPackaging,
    alt: "Representative unbranded food and bakery paper packaging structures",
  },
] as const;

export default function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const systems = systemVisuals.map((system) => ({ ...system, href: getProductEntry(system.id).href }));
  const featured = getHomepageProductEntries();
  return (
    <section className="kh-section kh-section-paper">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={zh ? "两类业务" : "Two ways to source"} />
              <h2>{zh ? "纸材与成品包装，在同一条供应链内衔接。" : "Source materials and finished packaging from one converting partner."}</h2>
            </div>
            <Link className="kh-text-link" href="/products">
              {zh ? "查看全部产品" : "View all products"}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {systems.map((system, index) => (
            <Reveal key={system.id} delay={index * 90}>
              <Link href={system.href} className="group block overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) shadow-sm transition hover:-translate-y-1 hover:border-(--kh-forest)/45 hover:shadow-lg">
                <div className="kh-media-shade relative aspect-[16/9] overflow-hidden">
                  <Image src={system.image} alt={system.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-300 group-hover:scale-[1.025]" />
                  <span className="kh-fig-caption kh-mono">{`0${index + 1} · ${zh ? (index === 0 ? "纸材与半成品" : "成品纸包装") : system.id}`}</span>
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="kh-eyebrow">{zh ? "产品体系" : "Product system"}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-(--kh-ink)">{zh ? system.titleZh : system.title}</h3>
                    </div>
                    <ArrowUpRight className="mt-1 size-5 shrink-0 text-(--kh-brass)" />
                  </div>
                  <p className="mt-3 max-w-[56ch] text-sm leading-6 text-(--kh-muted)">{zh ? system.descriptionZh : system.description}</p>
                  <ul className="mt-5 grid gap-2 text-sm font-semibold text-(--kh-forest) sm:grid-cols-3">
                    {(zh ? system.detailsZh : system.details).map((detail) => <li key={detail} className={`flex items-center gap-2 ${detail === "Converting-ready formats" ? "whitespace-nowrap text-[.82rem]" : ""}`}><span className="size-1.5 shrink-0 rounded-full bg-(--kh-brass)" />{detail}</li>)}
                  </ul>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
            <div><SectionKicker index="03" text={zh ? "重点产品方向" : "Selected product directions"} /><h3 className="mt-2 text-2xl font-semibold text-(--kh-ink)">{zh ? "先按产品形态开始筛选。" : "Start with the product form you need."}</h3></div>
            <p className="max-w-[46ch] text-sm leading-6 text-(--kh-muted)">{zh ? "以下入口按产品形态分开，避免将卷材、平张、扇形片与成品包装混在同一张视觉里。" : "These entries separate rolls, sheets, cup fan blanks and finished structures before you compare specifications."}</p>
          </div>
        </Reveal>
        <div data-testid="homepage-product-directions" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((item, index) => (
            <Link key={item.id} href={item.href} className="group flex min-h-38 items-start gap-4 rounded-lg border border-(--kh-line) bg-(--kh-surface) p-5 transition hover:border-(--kh-forest)/45 hover:shadow-md">
              <span className="kh-mono grid size-10 shrink-0 place-items-center rounded-md bg-(--kh-paper-deep) text-xs font-bold text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-semibold text-(--kh-ink)"><Layers3 className="size-4 text-(--kh-brass)" />{zh ? item.title.zh : item.title.en}</span><span className="mt-2 block text-sm leading-5 text-(--kh-muted)">{zh ? item.note.zh : item.note.en}</span><span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-(--kh-forest)">{item.hasPublicSku ? (zh ? "查看范围" : "View range") : (zh ? "提交需求" : "Explore options")}<ArrowRight className="size-4" /></span></span>
              <span className="relative hidden size-18 shrink-0 overflow-hidden rounded-md border border-(--kh-line) bg-(--kh-paper-deep) sm:block"><Image src={item.image} alt={zh ? item.alt.zh : item.alt.en} fill sizes="72px" className="object-cover" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
