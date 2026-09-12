import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

const paths = [
  {
    title: "Food & Takeaway",
    titleZh: "食品与外带",
    body: "Boxes, trays and pads for foodservice programs.",
    bodyZh: "面向餐饮项目的盒、托与垫纸。",
    href: "/packaging/food-packaging",
    image: showcaseImages.foodBoxReal,
    alt: "Finished paper food packaging",
    altZh: "成品食品纸包装",
  },
  {
    title: "Bakery & Cake",
    titleZh: "烘焙与蛋糕",
    body: "Cake boxes, boards and bakery presentation packaging.",
    bodyZh: "蛋糕盒、底托和烘焙展示包装。",
    href: "/packaging/cake-boxes",
    image: showcaseImages.providedBakeryBox,
    alt: "Bakery and cake packaging",
    altZh: "烘焙与蛋糕包装",
  },
  {
    title: "E-commerce & shipping",
    titleZh: "电商与运输包装",
    body: "Corrugated mailers and protective structures for dispatch.",
    bodyZh: "电商运输包装。",
    href: "/packaging/corrugated-mailer-boxes",
    image: showcaseImages.kraftCartonsTall,
    alt: "Corrugated mailer boxes for shipping",
    altZh: "电商运输用瓦楞邮寄盒",
  },
  {
    title: "Cosmetics & Retail",
    titleZh: "化妆品与零售",
    body: "Presentation boxes and fitted paper inserts for retail products.",
    bodyZh: "零售产品展示盒与配套纸内托。",
    href: "/packaging/cosmetic-packaging",
    image: showcaseImages.aiCosmeticsBox,
    alt: "Cosmetic presentation box with paper insert",
    altZh: "带纸内托的化妆品展示盒",
  },
] as const;

export default function HomeIndustries({ locale }: { locale: string }) {
  const zh = locale === "zh";
  return (
    <section className="kh-section kh-section-paper kh-industries-section kh-home-industries">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="05" text={zh ? "用途" : "Packaging by application"} />
              <h2>{zh ? "按场景选" : "Start with the job your packaging must do"}</h2>
            </div>
          </div>
        </Reveal>
        <div className="kh-industry-cards">
          {paths.map((path, index) => (
            <Reveal key={path.title} delay={index * 70}>
              <Link href={path.href} className="kh-industry-card">
                <span className="kh-industry-card-media kh-media-shade">
                  <Image src={path.image} alt={zh ? path.altZh : path.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 33vw, 30vw" className="object-cover" loading={index === 0 ? "eager" : "lazy"} />
                  <span className="kh-fig-caption kh-mono">0{index + 1}</span>
                </span>
                <span className="kh-industry-card-copy">
                  <span className="kh-industry-card-title">{zh ? path.titleZh : path.title}</span>
                  <span className="kh-industry-card-body">{zh ? path.bodyZh : path.body}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
