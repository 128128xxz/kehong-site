import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { packagingCategories } from "@/data/packagingCategories";
import { productFamilies } from "@/data/company";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

/** 名片墙展示顺序:老板点名的烘焙类打头,末位收口到全部产品 */
const categoryOrder = [
  "cake-boxes",
  "cake-boards-cake-drums",
  "takeout-boxes",
  "paper-bags",
  "pillow-boxes",
  "corrugated-mailer-boxes",
  "labels-stickers",
  "all-products",
];

/** 使用 AI 渲染示意图的品类:图注追加 Render 标记,不冒充实拍 */
const renderImageSlugs = new Set(["cake-boxes", "pillow-boxes", "corrugated-mailer-boxes"]);

export default function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const cards = categoryOrder
    .map((slug) => packagingCategories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <section className="kh-section kh-section-paper">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={zh ? "产品品类" : "Product categories"} />
              <h2>{zh ? "每个品类，都有自己的板块。" : "Every category gets its own stage."}</h2>
            </div>
            <Link className="kh-text-link" href="/products">
              {zh ? "查看全部产品" : "View all products"}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="kh-category-grid">
          {cards.map((category, index) => (
            <Reveal key={category.slug} delay={(index % 4) * 80}>
              <Link
                href={category.slug === "all-products" ? "/products" : `/packaging/${category.slug}`}
                className="kh-system-card h-full"
              >
                <div className="kh-card-media kh-media-shade">
                  <Image
                    src={category.image}
                    alt={zh ? category.title.zh : category.title.en}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <span className="kh-fig-caption kh-mono">
                    {`Fig.0${index + 1} — ${zh ? category.title.zh : category.title.en}${renderImageSlugs.has(category.slug) ? (zh ? " · 渲染示意" : " · Render") : ""}`}
                  </span>
                </div>
                <div className="kh-system-copy">
                  <h3>{zh ? category.title.zh : category.title.en}</h3>
                  <p>{zh ? category.shortDescription.zh : category.shortDescription.en}</p>
                  <span>
                    {zh ? "进入品类板块" : "Open category"}
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <nav className="kh-index-row" aria-label={zh ? "材料方向索引" : "Material family index"}>
            {productFamilies.map((family, index) => (
              <Link key={family} className="kh-index-item" href={`/products?search=${encodeURIComponent(family)}`}>
                <b>0{index + 1}</b>
                {family}
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  );
}
