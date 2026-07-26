import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";

type ProductSystem = {
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
  image: string;
  href: string;
};

const systems: ProductSystem[] = [
  {
    title: "Paper materials",
    titleZh: "纸材与材料",
    body: "Kraft, card, corrugated and specialty paper for converting projects.",
    bodyZh: "牛皮纸、白卡、瓦楞与特种纸，按加工项目匹配材料方案。",
    image: showcaseImages.portalSwatch,
    href: "/products?system=materials",
  },
  {
    title: "Food & bakery packaging",
    titleZh: "食品与烘焙包装",
    body: "Boxes, trays, cake boards and inserts reviewed around the product brief.",
    bodyZh: "纸盒、纸托、蛋糕垫板与内托，围绕产品需求逐项确认。",
    image: showcaseImages.foodBoxReal,
    href: "/industries/bakery-packaging",
  },
  {
    title: "Custom boxes & inserts",
    titleZh: "定制纸盒与内托",
    body: "Structural packaging components that move from drawing to sample.",
    bodyZh: "从图纸到样品，结构包装部件按项目节奏落地。",
    image: showcaseImages.orinsFoodBoxReal,
    href: "/products?system=packaging",
  },
  {
    title: "Protective paper structures",
    titleZh: "保护型纸结构",
    body: "Fluted, honeycomb and die-cut paper solutions for handling and dispatch.",
    bodyZh: "坑纸、蜂窝纸与模切纸结构，兼顾搬运防护与出货包装。",
    image: showcaseImages.cakeBoardRealAlt,
    href: "/products?search=protective",
  },
];

export default function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-section kh-section-paper">
      <div className="kh-shell">
        <div className="kh-section-heading">
          <div>
            <p className="kh-eyebrow">{zh ? "产品系统" : "Product systems"}</p>
            <h2>{zh ? "从材料到成品，按项目选择路径。" : "Choose the product path that fits the project."}</h2>
          </div>
          <Link className="kh-text-link" href="/products">
            {zh ? "查看全部产品" : "View all products"}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="kh-system-grid">
          {systems.map((item) => (
            <Link key={item.title} href={item.href} className="kh-system-card">
              <div className="kh-system-image">
                <Image
                  src={item.image}
                  alt={zh ? item.titleZh : item.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="kh-system-copy">
                <h3>{zh ? item.titleZh : item.title}</h3>
                <p>{zh ? item.bodyZh : item.body}</p>
                <span>
                  {zh ? "了解方向" : "Explore system"}
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
