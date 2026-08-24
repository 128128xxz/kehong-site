import { ArrowRight, BookOpen, Newspaper, Box } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

type ResourceEntry = { title: string; body: string; href: string; cta: string };

export default async function HomeResources({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Stage2.home" });
  const items = t.raw("resources.items") as ResourceEntry[];
  const icons = [BookOpen, Newspaper, Box];

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
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = icons[index] ?? BookOpen;
            return (
              <Reveal key={item.href} delay={index * 70}>
                <Link href={item.href} className="kh-panel kh-resource-entry block h-full p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-(--kh-brass-soft)/35 text-(--kh-brass)">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{item.body}</p>
                  <span className="kh-text-link mt-4 inline-flex items-center gap-1">
                    {item.cta}<ArrowRight className="size-4" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
