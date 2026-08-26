import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type ResourceEntry = { title: string; body: string; href: string; cta: string };

export default async function HomeResources({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const items = t.raw("resources.items") as ResourceEntry[];

  return (
    <section className="kh-section kh-section-muted kh-home-insights" data-testid="home-latest-insights">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="06" text={t("resources.kicker")} />
              <h2>{t("resources.title")}</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <ol className="kh-editorial-list">
            {items.map((item, index) => (
              <li key={item.href}>
                <Link href={item.href} className="kh-editorial-row">
                  <span className="kh-mono kh-editorial-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="kh-editorial-title">{item.title}</span>
                  <span className="kh-editorial-body">{item.body}</span>
                  <ArrowRight className="kh-editorial-arrow size-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
