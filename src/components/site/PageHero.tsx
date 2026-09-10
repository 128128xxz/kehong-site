import type { ReactNode } from "react";
import Image from "next/image";
import { SectionKicker } from "@/components/home/annotations";

type PageHeroProps = {
  /** 区块索引注记,如 "01" */
  index?: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  /** 右下 mono 元信息行,如 SKU 数、产地 */
  meta?: string[];
  /** 可选背景图(自动叠加 scrim 保证对比度) */
  image?: { src: string; alt: string };
  /** Material heroes with reflective surfaces need a lighter scrim. */
  imageScrim?: "standard" | "soft";
  /** 底部动作区(按钮等) */
  children?: ReactNode;
};

/**
 * 内页统一 Cinema 头部:深绿暗场带 + 工程注记 + 展示字体标题。
 * 页面内必须只有这一个 h1。
 */
export default function PageHero({ index = "01", kicker, title, lede, meta, image, imageScrim = "standard", children }: PageHeroProps) {
  return (
    <section className="kh-page-hero">
      {image ? (
        <>
          <div className="kh-page-hero-bg" aria-hidden="true">
            <Image src={image.src} alt="" fill sizes="100vw" className="object-cover" priority />
          </div>
          <div className={`kh-page-hero-scrim${imageScrim === "soft" ? " kh-page-hero-scrim-soft" : ""}`} aria-hidden="true" />
        </>
      ) : null}
      <div className="kh-shell kh-page-hero-inner">
        <SectionKicker index={index} text={kicker} light />
        <h1>{title}</h1>
        {lede ? <p className="kh-lede">{lede}</p> : null}
        {children ? <div className="kh-actions">{children}</div> : null}
        {meta?.length ? (
          <p className="kh-mono kh-page-hero-meta">
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        ) : null}
      </div>
    </section>
  );
}
