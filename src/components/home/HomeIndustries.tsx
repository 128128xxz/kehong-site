import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type BuyerPath = {
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
  href: string;
};

const paths: BuyerPath[] = [
  {
    title: "Foodservice & bakery",
    titleZh: "餐饮与烘焙",
    body: "Boxes, boards and inserts for food and dessert workflows.",
    bodyZh: "餐盒、垫板与内托，适配餐饮和甜品的出品流程。",
    href: "/industries/bakery-packaging",
  },
  {
    title: "Retail & lifestyle",
    titleZh: "零售与生活方式",
    body: "Carry bags, presentation boxes and branded paper components.",
    bodyZh: "手提袋、展示盒与品牌纸品部件，支持零售陈列与品牌呈现。",
    href: "/industries/retail-lifestyle",
  },
  {
    title: "E-commerce & professional",
    titleZh: "电商与专业供应链",
    body: "Mailers and protective structures for dispatch and handling.",
    bodyZh: "快递纸盒与保护性纸结构，应对运输、分拣和仓储环节。",
    href: "/industries/ecommerce-industrial-professional",
  },
];

export default function HomeIndustries({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-section">
      <div className="kh-shell">
        <div className="kh-section-heading">
          <div>
            <p className="kh-eyebrow">{zh ? "行业与采购路径" : "Industries & buyer paths"}</p>
            <h2>{zh ? "从应用场景开始，找到合适的包装方向。" : "Start with the application, then shape the packaging."}</h2>
          </div>
        </div>
        <div className="kh-industry-list">
          {paths.map((path, index) => (
            <Link href={path.href} key={path.title} className="kh-industry-row">
              <span>0{index + 1}</span>
              <div>
                <h3>{zh ? path.titleZh : path.title}</h3>
                <p>{zh ? path.bodyZh : path.body}</p>
              </div>
              <ArrowUpRight className="size-5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
