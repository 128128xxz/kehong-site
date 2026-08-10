import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

const paths = [
  {
    title: "Food & bakery",
    titleZh: "餐饮与烘焙",
    body: "Boxes and cake components for takeaway and bakery projects.",
    bodyZh: "餐饮烘焙纸盒。",
    href: "/industries/bakery-packaging",
    image: showcaseImages.bakeryDessertDisplay,
    alt: "Bakery desserts presented on paper packaging",
    altZh: "纸品包装上的烘焙甜品陈列",
  },
  {
    title: "Retail & brand",
    titleZh: "零售与品牌包装",
    body: "Carry bags and presentation packaging for retail shelves.",
    bodyZh: "零售品牌包装。",
    href: "/industries/retail-lifestyle",
    image: showcaseImages.retailShelfDisplay,
    alt: "Retail paper packaging display",
    altZh: "零售纸品包装陈列",
  },
  {
    title: "E-commerce & shipping",
    titleZh: "电商与运输包装",
    body: "Corrugated mailers and protective structures for dispatch.",
    bodyZh: "电商运输包装。",
    href: "/industries/ecommerce-industrial-professional",
    image: showcaseImages.textileLine,
    alt: "Industrial packaging production line",
    altZh: "工业包装生产现场",
  },
] as const;

export default function HomeIndustries({ locale }: { locale: string }) {
  const zh = locale === "zh";
  return (
    <section className="kh-section kh-section-paper kh-industries-section">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="05" text={zh ? "用途" : "Packaging by application"} />
              <h2>{zh ? "按场景选。" : "Start with the job your packaging must do."}</h2>
            </div>
          </div>
        </Reveal>
        <div className="kh-industry-cards">
          {paths.map((path, index) => (
            <Reveal key={path.title} delay={index * 70}>
              <Link href={path.href} className="kh-industry-card">
                <span className="kh-industry-card-media kh-media-shade">
                  <Image src={path.image} alt={zh ? path.altZh : path.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 33vw, 30vw" className="object-cover" loading="lazy" />
                  <span className="kh-fig-caption kh-mono">0{index + 1}</span>
                </span>
                <span className="kh-industry-card-copy">
                  <span className="kh-industry-card-title">{zh ? path.titleZh : path.title}</span>
                  <span className="kh-industry-card-body">{zh ? path.bodyZh : path.body}</span>
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
