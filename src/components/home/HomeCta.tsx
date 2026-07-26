import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function HomeCta({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-section kh-section-cta">
      <div className="kh-shell kh-cta-inner">
        <div>
          <p className="kh-eyebrow kh-eyebrow-light">{zh ? "开始一个包装项目" : "Start a packaging project"}</p>
          <h2>
            {zh
              ? "把尺寸、材料和目标市场交给我们确认下一步。"
              : "Bring your dimensions, materials and market requirements into the brief."}
          </h2>
        </div>
        <Link className="kh-button kh-button-light" href="/contact">
          {zh ? "提交询盘" : "Request a quote"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
