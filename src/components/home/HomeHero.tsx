import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { productCatalogSections } from "@/data/productDirectory";
import { companyDisplayName } from "@/data/company";
import HomeProductCarousel, { type HomeProductCarouselItem } from "@/components/home/HomeProductCarousel";

type StatItem = { value: string; label: string };

const heroProductVisuals: Record<string, { image: string; alt: string; altZh: string }> = {
  "pe-coated-paper-roll": { image: showcaseImages.goldBoardSheets, alt: "Coated paper sheets for packaging conversion", altZh: "用于包装加工的淋膜纸张" },
  "food-tray-material": { image: showcaseImages.goldBoardPieces, alt: "Paper tray material pieces", altZh: "纸托材料片" },
  "takeout-boxes": { image: showcaseImages.foodBoxRealAlt, alt: "Unbranded takeaway paper boxes", altZh: "外带食品纸盒" },
  "cake-boxes": { image: showcaseImages.cakeBoardRealAlt, alt: "Cake packaging components", altZh: "蛋糕包装组件" },
  "cake-boards-cake-drums": { image: showcaseImages.cakeBoardReal, alt: "Cake boards and cake drums for bakery support", altZh: "用于烘焙承托的蛋糕底托与蛋糕鼓" },
  "corrugated-mailer-boxes": { image: showcaseImages.kraftCartonsTall, alt: "Corrugated mailer cartons prepared for dispatch", altZh: "待出货的瓦楞邮寄盒" },
  "paper-bags": { image: showcaseImages.aiPaperBagBranded, alt: "Custom paper bags for retail packaging", altZh: "用于零售包装的定制纸袋" },
};

const heroProductDescriptions: Record<string, { en: string; zh: string }> = {
  "pe-coated-paper-roll": { en: "Coated paper rolls for food-contact packaging.", zh: "食品容器淋膜卷材。" },
  "food-tray-material": { en: "Paper materials for formed food trays.", zh: "纸托内托用纸材。" },
  "takeout-boxes": { en: "Takeaway paper boxes for foodservice programs.", zh: "外带餐饮纸盒。" },
  "cake-boxes": { en: "Paper packaging components for cakes and desserts.", zh: "蛋糕甜点纸盒。" },
  "cake-boards-cake-drums": { en: "Boards and drums for cake support and transport.", zh: "蛋糕承托与运输用底托和蛋糕鼓。" },
  "corrugated-mailer-boxes": { en: "Corrugated mailer cartons prepared for dispatch.", zh: "电商发货邮寄盒。" },
  "paper-bags": { en: "Carry packaging for retail and branded applications.", zh: "零售与品牌手提包装。" },
};

const heroProductIds = [
  "takeout-boxes",
  "cake-boxes",
  "cake-boards-cake-drums",
  "corrugated-mailer-boxes",
  "paper-bags",
] as const;

export default async function HomeHero({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const materialEntry = productCatalogSections[0];
  const alt = zh
    ? "科宏工厂车间:成排模切设备与纸板堆垛"
    : "Kehong factory hall with die-cutting lines and stacked board";

  const stats: Array<{ value: ReactNode; ariaValue: string; label: string; long?: boolean }> = (
    t.raw("hero.stats") as StatItem[]
  ).map((stat) => ({
    value: stat.value,
    ariaValue: stat.value,
    label: stat.label,
    long: stat.value.length > 10,
  }));

  const catalogLinks = productCatalogSections.flatMap((section) => section.groups.flatMap((group) => group.links));
  const heroProducts: HomeProductCarouselItem[] = heroProductIds.map((id) => {
    const product = catalogLinks.find((item) => item.id === id);
    const visual = heroProductVisuals[id];
    const description = heroProductDescriptions[id];
    if (!product) throw new Error(`Missing homepage product: ${id}`);
    return {
      id,
      href: product.href,
      title: zh ? product.zh : product.en,
      description: zh ? description.zh : description.en,
      image: visual.image,
      alt: zh ? visual.altZh : visual.alt,
      systemLabel: zh ? "主营产品" : "Main products",
    };
  });

  return (
    <section className="kh-home-hero">
      <div className="kh-hero-bg" aria-hidden="true">
        <picture>
          <source media="(min-width: 761px)" srcSet={showcaseImages.factoryHallWide} />
          {/* A pre-compressed local WebP avoids a cold image-optimizer request on the critical path. */}
          <img
            src={showcaseImages.machine}
            alt={alt}
            width={1086}
            height={1448}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="kh-hero-scrim" aria-hidden="true" />
      <div className="kh-hero-noise" aria-hidden="true" />

      <div className="kh-shell kh-hero-inner">
        <p className="kh-mono kh-hero-index kh-rise kh-rise-1">
          <span>{zh ? companyDisplayName.zh : companyDisplayName.en}</span>
          <span>{zh ? "广东佛山" : "Foshan, Guangdong"}</span>
          <span>OEM / ODM</span>
        </p>

        <div className="kh-hero-copy">
          <p className="kh-eyebrow kh-eyebrow-light kh-rise kh-rise-2">{t("hero.eyebrow")}</p>
          <h1 className="kh-rise kh-rise-3">{t("hero.title")}</h1>
          <p className="kh-lede kh-rise kh-rise-4">{t("hero.description")}</p>
          <div className="kh-actions kh-rise kh-rise-5">
            <Link className="kh-button kh-button-light" href={materialEntry.href}>
              {t("hero.primary")}
              <ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-ghost" href="/contact">
              {t("hero.secondary")}
            </Link>
          </div>
        </div>

        <div className="kh-hero-product-rail">
          <HomeProductCarousel items={heroProducts} viewLabel={zh ? "查看产品" : "View product"} isZh={zh} compact />
        </div>

        <dl className="kh-hero-stats kh-rise kh-rise-6">
          {stats.map((stat) => (
            <div className="kh-hero-stat" key={stat.label}>
              <dt className="kh-mono kh-hero-stat-label">{stat.label}</dt>
              <dd className="kh-hero-stat-value">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
