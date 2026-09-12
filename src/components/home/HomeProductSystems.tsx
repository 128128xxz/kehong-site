import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import { showcaseImages } from "@/data/visuals";
import { productCatalogSections, type DirectoryLink } from "@/data/productDirectory";

type ProductVisual = DirectoryLink & { image: string; alt: string; altZh: string };

const materialVisuals: Record<string, Pick<ProductVisual, "image" | "alt" | "altZh">> = {
  "pe-coated-paper-roll": { image: showcaseImages.goldBoardSheets, alt: "Coated paper sheets for packaging conversion", altZh: "用于包装加工的淋膜纸张" },
  "pe-coated-paper-sheet": { image: showcaseImages.goldBoardSheets, alt: "Coated paper sheets for packaging conversion", altZh: "用于包装加工的淋膜纸张" },
  "food-tray-material": { image: showcaseImages.goldBoardPieces, alt: "Paper tray material pieces", altZh: "纸托材料片" },
};

const finishedVisuals: Record<string, Pick<ProductVisual, "image" | "alt" | "altZh">> = {
  "takeout-boxes": { image: showcaseImages.foodBoxRealAlt, alt: "Unbranded takeaway paper boxes", altZh: "外带食品纸盒" },
  "cake-boxes": { image: showcaseImages.cakeBoardRealAlt, alt: "Cake packaging components", altZh: "蛋糕包装组件" },
  "corrugated-mailer-boxes": { image: showcaseImages.kraftCartonsTall, alt: "Corrugated mailer cartons prepared for dispatch", altZh: "待出货的瓦楞邮寄盒" },
};

const shortZhDescriptions: Record<string, string> = {
  "pe-coated-paper-roll": "食品容器与包装加工用卷材。",
  "pe-coated-paper-sheet": "印刷、模切和成型用平张。",
  "food-tray-material": "纸托与纸内托成型用纸材。",
  "food-packaging": "餐饮项目用食品盒、纸托与垫纸。",
  "pizza-packaging": "披萨配送与外带用包装方案。",
  "corrugated-mailer-boxes": "电商发货与运输保护用邮寄盒。",
  "cosmetic-packaging": "美妆、护肤和香水用盒与纸内托。",
};

const getLink = (sectionId: "materials" | "finished-packaging", id: string) => {
  const section = productCatalogSections.find((item) => item.id === sectionId)!;
  const links = section.groups.flatMap((group) => group.links);
  const link = links.find((item) => item.id === id);
  if (!link) throw new Error(`Missing homepage product entry: ${sectionId}/${id}`);
  return link;
};

const homepageVisuals: Record<string, Pick<ProductVisual, "image" | "alt" | "altZh">> = {
  "food-packaging": { image: showcaseImages.foodBoxReal, alt: "Finished food packaging boxes", altZh: "成品食品包装盒" },
  "pizza-packaging": { image: showcaseImages.aiPizzaBox, alt: "Pizza packaging for takeaway and delivery", altZh: "披萨外带与配送包装" },
  "corrugated-mailer-boxes": { image: showcaseImages.kraftCartonsTall, alt: "Corrugated mailer boxes for e-commerce shipping", altZh: "电商运输用瓦楞邮寄盒" },
  "cosmetic-packaging": { image: showcaseImages.aiCosmeticsBox, alt: "Cosmetic packaging boxes with paper inserts", altZh: "带纸内托的化妆品包装盒" },
  "pe-coated-paper-roll": { image: showcaseImages.goldBoardSheets, alt: "Coated paper rolls and sheets for converting", altZh: "用于加工的淋膜纸卷与平张" },
  "pe-coated-paper-sheet": { image: showcaseImages.goldBoardPieces, alt: "Coated paper sheets for printing and die cutting", altZh: "用于印刷与模切的淋膜平张" },
};

const homepageCopy: Record<string, Partial<Pick<DirectoryLink, "en" | "zh" | "description">>> = {
  "food-packaging": { en: "Food Packaging", zh: "食品包装" },
  "pizza-packaging": { en: "Pizza & Bakery Packaging", zh: "披萨与烘焙包装" },
  "corrugated-mailer-boxes": { en: "Mailer & Retail Boxes", zh: "邮寄盒与零售包装" },
  "cosmetic-packaging": { en: "Cosmetic Packaging", zh: "化妆品包装" },
};

const homepageEntry = (sectionId: "materials" | "finished-packaging", id: string): ProductVisual => ({
  ...getLink(sectionId, id),
  ...homepageCopy[id],
  ...homepageVisuals[id],
});

export default async function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const materials = productCatalogSections[0];
  const finished = productCatalogSections[1];
  const systems = [
    {
      ...finished,
      label: zh ? "成品包装" : "Finished Packaging First",
      intro: zh ? "先从食品、烘焙、电商和零售包装方案开始，再按项目确认材料与结构。" : "Start with the finished packaging route, then confirm the material, structure and finish around your brief.",
      cta: t("products.finishedCta"),
      links: [
        homepageEntry("finished-packaging", "food-packaging"),
        homepageEntry("finished-packaging", "pizza-packaging"),
        homepageEntry("finished-packaging", "corrugated-mailer-boxes"),
        homepageEntry("finished-packaging", "cosmetic-packaging"),
      ],
      visuals: finishedVisuals,
      image: showcaseImages.providedOrinsFoodBox,
      imageAlt: zh ? "科宏成品食品包装盒" : "Kehong finished food packaging boxes",
    },
    {
      ...materials,
      label: zh ? "制造材料与配套能力" : "Manufacturing Materials & Supporting Capability",
      intro: t("products.materialsIntro"),
      cta: t("products.materialsCta"),
      links: [
        homepageEntry("materials", "pe-coated-paper-roll"),
        homepageEntry("materials", "pe-coated-paper-sheet"),
      ],
      visuals: materialVisuals,
      image: showcaseImages.providedStructureMaterial,
      imageAlt: zh ? "科宏纸材与包装结构材料" : "Kehong paper materials and packaging structures",
    },
  ];

  return (
    <section className="kh-section kh-section-paper kh-product-systems kh-home-product-systems">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={t("products.eyebrow")} />
              <h2>{t("products.title")}</h2>
            </div>
            <Link className="kh-text-link" href="/products">
              {t("products.viewAll")}
            </Link>
          </div>
        </Reveal>

        <div className="kh-product-system-grid" data-testid="homepage-product-systems">
          {systems.map((system, index) => (
            <Reveal key={system.id} delay={index * 90}>
              <article className="kh-product-system">
                <div className="kh-product-system-media kh-media-shade">
                  <Image
                    src={system.image}
                    alt={system.imageAlt}
                    fill
                    sizes="(max-width: 760px) 100vw, 50vw"
                    className="object-cover"
                    loading="eager"
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </div>
                <div className="kh-product-system-copy">
                  <div className="kh-product-system-head">
                    <h3>{system.label}</h3>
                    <Link className="kh-product-system-cta" href={system.href}>{system.cta}</Link>
                  </div>
                  <p>{system.intro}</p>
                  <div className="kh-product-card-grid">
                    {system.links.map((item) => {
                      return (
                    <Link key={item.id} href={item.href} data-testid="homepage-product-entry" className="kh-product-card">
                      <span className="kh-product-card-media" aria-hidden="true">
                        <Image src={item.image} alt="" fill sizes="72px" className="object-cover" loading="lazy" />
                      </span>
                      <span className="kh-product-card-copy">
                            <span className="kh-product-card-title">{zh ? item.zh : item.en}</span>
                            <span className="kh-product-card-description">{zh ? shortZhDescriptions[item.id] : item.description.en}</span>
                            <ArrowRight className="kh-product-card-arrow size-4" aria-hidden="true" />
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
