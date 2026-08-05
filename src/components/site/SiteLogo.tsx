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
          src="/brand/kehong-mark-transparent.png"
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
    <Image
      src="/brand/kehong-logo-full-transparent.png"
      alt={zh ? "科宏纸品" : "Kehong Paper Products"}
      width={900}
      height={850}
      className="kh-footer-brand"
    />
  );
}
