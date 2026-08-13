import type { ReactNode } from "react";
import { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { productCatalogSections } from "@/data/productDirectory";
import { CountUp, MetricReveal } from "@/components/home/interactive";

export default function HomeHero({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const materialEntry = productCatalogSections[0];
  const packagingEntry = productCatalogSections[1];
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

  const stats: Array<{ value: ReactNode; ariaValue: string; label: string; long?: boolean }> = [
    { value: <CountUp to={20} suffix="+" />, ariaValue: "20+", label: zh ? "纸品加工经验" : "Years in paper converting" },
    {
      value: <><CountUp to={8000} suffix="+" /><span className="kh-hero-stat-unit">{zh ? "㎡" : "m²"}</span></>,
      ariaValue: zh ? "8,000+ ㎡" : "8,000+ m²",
      label: zh ? "生产场地" : "Production site",
    },
    { value: "OEM / ODM", ariaValue: "OEM / ODM", label: zh ? "定制开发" : "Custom development", long: true },
    { value: "MOQ", ariaValue: "MOQ", label: zh ? "灵活起订" : "Flexible order quantities" },
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
          <span>{zh ? "佛山科宏纸品" : "Foshan Kehong Paper Products"}</span>
          <span>{zh ? "20+ 年" : "Est. 20+ yrs"}</span>
          <span>OEM / ODM</span>
        </p>

        <div className="kh-hero-copy">
          <p className="kh-eyebrow kh-eyebrow-light kh-rise kh-rise-2">
            {zh ? "佛山" : "Foshan paper converting"}
          </p>
          <h1 className="kh-rise kh-rise-3">
            {zh ? (
              <>纸材、半成品与<span className="whitespace-nowrap">定制包装</span>，制造于佛山。</>
            ) : (
              "Paper materials, components & custom packaging, made in Foshan."
            )}
          </h1>
          <p className="kh-lede kh-rise kh-rise-4">
            {zh
              ? "科宏提供纸材加工、纸杯部件和定制纸包装，并根据项目要求安排结构打样、生产和出货准备。"
              : "Paper materials, semi-finished components and finished packaging, made for your brief."}
          </p>
          <div className="kh-actions kh-rise kh-rise-5">
            <Link className="kh-button kh-button-light" href={materialEntry.href}>
              {zh ? "查看纸材与半成品" : "Explore materials"}
              <ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-ghost" href={packagingEntry.href}>
              {zh ? "查看成品包装" : "Explore packaging"}
            </Link>
          </div>
        </div>

        <dl className="kh-hero-stats kh-rise kh-rise-6">
          {stats.map((stat) => (
            <MetricReveal className={`kh-hero-stat${stat.long ? " is-long" : ""}`} key={stat.label}>
              <b className="kh-hero-stat-value" aria-label={stat.ariaValue}>
                <span aria-hidden="true" className="kh-hero-stat-number">{stat.value}</span>
              </b>
              <span className="kh-mono kh-hero-stat-label">{stat.label}</span>
            </MetricReveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
