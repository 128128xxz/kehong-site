import Image from "next/image";
import { getBrandConfig } from "@/lib/site-config";

type SiteLogoProps = {
  locale: string;
  placement: "header" | "footer";
};

/**
 * The only public logo lock-up. It renders the supplied official artwork
 * unchanged (the display file only removes surrounding empty canvas).
 */
export default function SiteLogo({ locale, placement }: SiteLogoProps) {
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  if (placement === "header") {
    return (
      <>
        <Image
          src="/brand/kehong-mark-512.png"
          alt=""
          width={512}
          height={512}
          priority
          className="kh-header-brand-mark"
        />
        <span className="kh-header-brand-copy">
          <span className="kh-brand-name">{brand.name}</span>
          <span className="kh-brand-tag">{brand.tagline}</span>
        </span>
      </>
    );
  }
  return (
    <div className="kh-footer-brand" aria-label={brand.name}>
      <Image
        src="/brand/kehong-mark-512.png"
        alt=""
        width={523}
        height={535}
        className="kh-footer-brand-mark"
      />
      <span className="kh-footer-brand-copy">
        <span className="kh-footer-brand-name">{brand.name}</span>
        <span className="kh-footer-brand-tag">{zh ? "纸品加工与定制包装" : "Paper products & custom packaging"}</span>
      </span>
    </div>
  );
}
