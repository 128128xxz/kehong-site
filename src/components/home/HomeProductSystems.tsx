import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import { showcaseImages } from "@/data/visuals";
import { productCatalogSections, type DirectoryLink } from "@/data/productDirectory";

type ProductVisual = DirectoryLink & { image: string; alt: string; altZh: string };

const materialVisuals: Record<string, Pick<ProductVisual, "image" | "alt" | "altZh">> = {
  "paper-cup-fan": { image: showcaseImages.colorPaperFan, alt: "Paper cup fan blanks ready for converting", altZh: "待加工的纸杯扇形片" },
  "pe-coated-paper-roll": { image: showcaseImages.goldBoardSheets, alt: "Coated paper sheets for packaging conversion", altZh: "用于包装加工的淋膜纸张" },
  "food-tray-material": { image: showcaseImages.goldBoardPieces, alt: "Paper tray material pieces", altZh: "纸托材料片" },
};

const finishedVisuals: Record<string, Pick<ProductVisual, "image" | "alt" | "altZh">> = {
  "takeout-boxes": { image: showcaseImages.foodBoxRealAlt, alt: "Unbranded takeaway paper boxes", altZh: "外带食品纸盒" },
  "cake-boxes": { image: showcaseImages.cakeBoardRealAlt, alt: "Cake packaging components", altZh: "蛋糕包装组件" },
  "corrugated-mailer-boxes": { image: showcaseImages.kraftCartonsTall, alt: "Corrugated mailer cartons prepared for dispatch", altZh: "待出货的瓦楞邮寄盒" },
};

const shortZhDescriptions: Record<string, string> = {
  "paper-cup-fan": "纸杯杯身扇形片。",
  "pe-coated-paper-roll": "食品容器淋膜卷材。",
  "food-tray-material": "纸托内托用纸材。",
  "takeout-boxes": "外带餐饮纸盒。",
  "cake-boxes": "蛋糕甜点纸盒。",
  "corrugated-mailer-boxes": "电商发货邮寄盒。",
};

const pickLinks = (sectionId: "materials" | "finished-packaging", ids: string[]) => {
  const section = productCatalogSections.find((item) => item.id === sectionId)!;
  const links = section.groups.flatMap((group) => group.links);
  return ids.map((id) => links.find((link) => link.id === id)!).filter(Boolean);
};

export default function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const materials = productCatalogSections[0];
  const finished = productCatalogSections[1];
  const systems = [
    {
      ...materials,
      label: zh ? "纸材与半成品" : "Paper materials & semi-finished components",
      intro: zh ? "先从纸材、杯纸组件和成型材料入手。" : "Start with paper grades, cup components and forming materials.",
      links: pickLinks("materials", ["paper-cup-fan", "pe-coated-paper-roll", "food-tray-material"]),
      visuals: materialVisuals,
    },
    {
      ...finished,
      label: zh ? "成品包装" : "Finished packaging",
      intro: zh ? "按用途查看餐饮、烘焙和运输包装。" : "Review food, bakery and shipping packaging by use.",
      links: pickLinks("finished-packaging", ["takeout-boxes", "cake-boxes", "corrugated-mailer-boxes"]),
      visuals: finishedVisuals,
    },
  ];

  return (
    <section className="kh-section kh-section-paper kh-product-systems kh-home-product-systems">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={zh ? "产品" : "Product range"} />
              <h2>{zh ? "按产品体系进入分类" : "Choose a product system, then go deeper by category"}</h2>
            </div>
            <Link className="kh-text-link" href="/products">
              {zh ? "查看全部产品" : "View all products"}
            </Link>
          </div>
        </Reveal>

        <div className="kh-product-system-grid" data-testid="homepage-product-systems">
          {systems.map((system, index) => (
            <Reveal key={system.id} delay={index * 90}>
              <article className="kh-product-system">
                <div className="kh-product-system-media kh-media-shade">
                  <Image
                    src={index === 0 ? showcaseImages.structureMaterialReal : showcaseImages.foodBoxReal}
                    alt={index === 0 ? (zh ? "纸材与纸板材料" : "Paper materials and board") : (zh ? "成品包装样品" : "Finished packaging samples")}
                    fill
                    sizes="(max-width: 760px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="kh-product-system-copy">
                  <div className="kh-product-system-head">
                    <h3>{system.label}</h3>
                    <Link className="kh-product-system-cta" href={system.href}>{zh ? system.cta.zh : system.cta.en}</Link>
                  </div>
                  <p>{zh ? "先选分类，再看产品和规格。" : system.intro}</p>
                  <div className="kh-product-card-grid">
                    {system.links.map((item) => {
                      const visual = system.visuals[item.id];
                      return (
                        <Link key={item.id} href={item.href} data-testid="homepage-product-entry" className="kh-product-card">
                          <span className="kh-product-card-media">
                            <Image src={visual.image} alt={zh ? visual.altZh : visual.alt} fill sizes="(max-width: 760px) 42vw, (max-width: 1100px) 22vw, 16vw" className="object-cover" loading="lazy" />
                          </span>
                          <span className="kh-product-card-copy">
                            <span className="kh-product-card-title">{zh ? item.zh : item.en}</span>
                            <span className="kh-product-card-description">{zh ? shortZhDescriptions[item.id] : item.description.en}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
