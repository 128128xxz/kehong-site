import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import HomeProductCarousel from "@/components/home/HomeProductCarousel";
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

export default async function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const materials = productCatalogSections[0];
  const finished = productCatalogSections[1];
  const systems = [
    {
      ...materials,
      label: t("products.materials"),
      intro: t("products.materialsIntro"),
      cta: t("products.materialsCta"),
      links: pickLinks("materials", ["paper-cup-fan", "pe-coated-paper-roll", "food-tray-material"]),
      visuals: materialVisuals,
    },
    {
      ...finished,
      label: t("products.finished"),
      intro: t("products.finishedIntro"),
      cta: t("products.finishedCta"),
      links: pickLinks("finished-packaging", ["takeout-boxes", "cake-boxes", "corrugated-mailer-boxes"]),
      visuals: finishedVisuals,
    },
  ];
  const carouselItems = systems.flatMap((system) =>
    system.links.map((item) => {
      const visual = system.visuals[item.id];
      return {
        id: item.id,
        href: item.href,
        title: zh ? item.zh : item.en,
        description: zh ? shortZhDescriptions[item.id] : item.description.en,
        image: visual.image,
        alt: zh ? visual.altZh : visual.alt,
        systemLabel: system.label,
      };
    }),
  );

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

        <Reveal delay={90}>
          <HomeProductCarousel items={carouselItems} viewLabel={t("products.viewAll")} isZh={zh} />
        </Reveal>
      </div>
    </section>
  );
}
