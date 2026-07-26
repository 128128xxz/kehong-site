import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { productFamilies } from "@/data/company";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type ProductSystem = {
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
  image: string;
  alt: string;
  altZh: string;
  href: string;
  tone: "a" | "b" | "c" | "d";
  sizes: string;
};

const systems: ProductSystem[] = [
  {
    title: "Paper materials",
    titleZh: "纸材与材料",
    body: "Kraft, card, corrugated and specialty paper matched to each converting project.",
    bodyZh: "牛皮纸、白卡、瓦楞与特种纸，按加工项目匹配材料方案。",
    image: showcaseImages.swatch,
    alt: "Colored fluted paper swatches in the Kehong material library",
    altZh: "科宏材料库中的彩色坑纸样卡",
    href: "/products?system=materials",
    tone: "a",
    sizes: "(max-width: 760px) 100vw, (max-width: 1100px) 100vw, 50vw",
  },
  {
    title: "Food & bakery packaging",
    titleZh: "食品与烘焙包装",
    body: "Boxes, trays, cake boards and inserts reviewed around the product brief.",
    bodyZh: "纸盒、纸托、蛋糕垫板与内托，围绕产品需求逐项确认。",
    image: showcaseImages.foodBoxReal,
    alt: "Food-grade paper boxes produced by Kehong",
    altZh: "科宏生产的食品级纸盒",
    href: "/industries/bakery-packaging",
    tone: "b",
    sizes: "(max-width: 760px) 100vw, (max-width: 1100px) 100vw, 50vw",
  },
  {
    title: "Custom boxes & inserts",
    titleZh: "定制纸盒与内托",
    body: "Structural packaging components that move from drawing to sample.",
    bodyZh: "从图纸到样品，结构包装部件按项目节奏落地。",
    image: showcaseImages.orinsFoodBoxReal,
    alt: "Custom printed box structures and detail views",
    altZh: "定制印刷纸盒的结构与细节",
    href: "/products?system=packaging",
    tone: "c",
    sizes: "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw",
  },
  {
    title: "Protective paper structures",
    titleZh: "保护型纸结构",
    body: "Fluted, honeycomb and die-cut paper solutions for handling and dispatch.",
    bodyZh: "坑纸、蜂窝纸与模切纸结构，兼顾搬运防护与出货包装。",
    image: showcaseImages.honeycomb,
    alt: "Honeycomb paper core roll",
    altZh: "蜂窝纸芯纸卷",
    href: "/packaging/corrugated-mailer-boxes",
    tone: "d",
    sizes: "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw",
  },
];

export default function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-section kh-section-paper">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={zh ? "产品系统" : "Product systems"} />
              <h2>{zh ? "四个方向，覆盖从纸材到成品。" : "Four systems, from raw board to finished packaging."}</h2>
            </div>
            <Link className="kh-text-link" href="/products">
              {zh ? "查看全部产品" : "View all products"}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="kh-bento">
          {systems.map((system, index) => (
            <Reveal key={system.title} className={`kh-bento-${system.tone}`} delay={index * 80}>
              <Link href={system.href} className="kh-system-card h-full">
                <div className="kh-card-media kh-media-shade">
                  <Image src={system.image} alt={zh ? system.altZh : system.alt} fill sizes={system.sizes} className="object-cover" />
                  <span className="kh-fig-caption kh-mono">
                    {`Fig.0${index + 1} — ${zh ? system.titleZh : system.title}`}
                  </span>
                </div>
                <div className="kh-system-copy">
                  <h3>{zh ? system.titleZh : system.title}</h3>
                  <p>{zh ? system.bodyZh : system.body}</p>
                  <span>
                    {zh ? "了解方向" : "Explore direction"}
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
