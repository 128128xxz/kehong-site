import type { ReactNode } from "react";
import { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { CountUp } from "@/components/home/interactive";
import { getProductEntry } from "@/lib/product-routing";

export default function HomeHero({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const materialEntry = getProductEntry("materials");
  const packagingEntry = getProductEntry("packaging");
  const alt = zh
    ? "科宏工厂车间:成排模切设备与纸板堆垛"
    : "Kehong factory hall with die-cutting lines and stacked board";

  const desktop = getImageProps({
    alt,
    src: showcaseImages.factoryHallWide,
    width: 1672,
    height: 941,
    sizes: "100vw",
    quality: 78,
    priority: true,
  });
  const mobile = getImageProps({
    alt,
    src: showcaseImages.machine,
    width: 1086,
    height: 1448,
    sizes: "100vw",
    quality: 78,
  });

  const stats: Array<{ value: ReactNode; label: string }> = [
    { value: <CountUp to={20} suffix="+" />, label: zh ? "年纸品制造经验" : "Years in paper converting" },
    { value: <CountUp to={8000} suffix="+" />, label: zh ? "平方米厂房面积" : "m² of factory floor" },
    { value: "OEM / ODM", label: zh ? "定制项目模式" : "Custom project models" },
    { value: "MOQ", label: zh ? "弹性起订量" : "Flexible order volumes" },
  ];

  return (
    <section className="kh-home-hero">
      <div className="kh-hero-bg" aria-hidden="true">
        <picture>
          <source media="(min-width: 761px)" srcSet={desktop.props.srcSet} sizes="100vw" />
          {/* eslint-disable-next-line jsx-a11y/alt-text -- mobile.props 已含 alt */}
          <img {...mobile.props} loading="eager" fetchPriority="high" />
        </picture>
      </div>
      <div className="kh-hero-scrim" aria-hidden="true" />
      <div className="kh-hero-noise" aria-hidden="true" />

      <div className="kh-shell kh-hero-inner">
        <p className="kh-mono kh-hero-index kh-rise kh-rise-1">
          <span>Foshan Kehong Paper Products</span>
          <span>Est. 20+ yrs</span>
          <span>OEM / ODM</span>
        </p>

        <div className="kh-hero-copy">
          <p className="kh-eyebrow kh-eyebrow-light kh-rise kh-rise-2">
            {zh ? "佛山 · 纸材加工与定制包装工厂" : "Foshan paper converting & custom packaging"}
          </p>
          <h1 className="kh-rise kh-rise-3">
            {zh ? (
              <>纸材、半成品与<span className="whitespace-nowrap">定制纸包装</span>，制造于佛山。</>
            ) : (
              "Paper Materials & Custom Packaging, Made in Foshan."
            )}
          </h1>
          <p className="kh-lede kh-rise kh-rise-4">
            {zh
              ? "纸材选择、结构打样、加工与出口协同在同一条项目流程里完成，服务海外品牌、经销商与采购团队。"
              : "Cupstock, converting components and finished paper packaging supported by in-house converting, structural sampling and export coordination."}
          </p>
          <div className="kh-actions kh-rise kh-rise-5">
            <Link className="kh-button kh-button-light" href={materialEntry.href}>
              {zh ? materialEntry.title.zh : materialEntry.title.en}
              <ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-ghost" href={packagingEntry.href}>
              {zh ? packagingEntry.title.zh : packagingEntry.title.en}
              <ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-ghost" href="/contact">
              {zh ? "提交询盘" : "Request a quote"}
            </Link>
          </div>
        </div>

        <dl className="kh-hero-stats kh-rise kh-rise-6">
          {stats.map((stat) => (
            <div className="kh-hero-stat" key={stat.label}>
              <b>{stat.value}</b>
              <span className="kh-mono">{stat.label}</span>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
