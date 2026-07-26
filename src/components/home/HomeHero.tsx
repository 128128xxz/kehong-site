import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";

export default function HomeHero({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const facts = zh
    ? ["20+ 年纸品经验", "8000+㎡工厂", "OEM / ODM", "海外订单支持"]
    : ["20+ years", "8000+ m² factory", "OEM / ODM", "Export-ready support"];

  return (
    <section className="kh-home-hero">
      <div className="kh-shell kh-home-hero-grid">
        <div className="kh-home-hero-copy">
          <p className="kh-eyebrow">
            {zh ? "佛山纸材加工与定制包装" : "Foshan paper converting & custom packaging"}
          </p>
          <h1>
            {zh ? (
              <>
                从纸材到<span className="whitespace-nowrap">包装结构</span>，清晰地交付。
              </>
            ) : (
              "Paper packaging, built from the material up."
            )}
          </h1>
          <p className="kh-lede">
            {zh
              ? "从纸材选择、结构打样到成品包装，科宏为海外品牌、经销商和采购团队提供可执行的项目支持。"
              : "From paper selection and structural sampling to finished packaging, Kehong supports overseas brands, distributors and procurement teams with a clear production workflow."}
          </p>
          <div className="kh-actions">
            <Link className="kh-button kh-button-primary" href="/products">
              {zh ? "探索产品" : "Explore products"}
              <ArrowRight className="size-4" />
            </Link>
            <Link className="kh-button kh-button-secondary" href="/contact">
              {zh ? "提交询盘" : "Request a quote"}
            </Link>
          </div>
          <div className="kh-proof-strip">
            {facts.map((fact, index) => (
              <span key={fact}>
                <Check className="size-4" />
                {fact}
                {index < facts.length - 1 && <i aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>
        <div className="kh-home-hero-media">
          <Image
            src={showcaseImages.webCorrugatedSheet}
            alt={zh ? "科宏瓦楞纸与纸材样本" : "Corrugated and paper material samples at Kehong"}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className="object-cover"
          />
          <span className="kh-image-label">
            {zh ? "纸材与生产参考" : "Paper materials / production reference"}
          </span>
          <div className="kh-hero-caption">
            <p>{zh ? "纸材、结构与加工能力" : "Material, structure and converting"}</p>
            <span>{zh ? companyProfile.location.zh : companyProfile.location.en}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
