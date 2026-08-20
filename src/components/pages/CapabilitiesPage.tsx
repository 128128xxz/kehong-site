import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import { getTranslations } from "next-intl/server";

type CapabilityItem = { title: string; what: string; materials: string; output: string };
type CapabilityGroup = { kicker: string; lede: string; items: CapabilityItem[] };

export default async function CapabilitiesPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Stage2" });
  const groups = t.raw("capabilities.groups") as CapabilityGroup[];
  const startSteps = t.raw("capabilities.start.steps") as Array<{ title: string; body: string }>;
  const whatLabel = t("factory.process.whatLabel");
  const materialLabel = t("factory.process.materialLabel");
  const outputLabel = t("factory.process.outputLabel");

  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("capabilities.hero.kicker")}
          title={t("capabilities.hero.title")}
          lede={t("capabilities.hero.lede")}
          meta={[t("capabilities.hero.metaGroups"), t("capabilities.hero.metaOem"), t("capabilities.hero.metaLocation")]}
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {t("capabilities.hero.requestQuote")}
          </Link>
        </PageHero>

        <section className="kh-section">
          <div className="kh-shell">
            {groups.map((group, groupIndex) => (
              <div key={group.kicker} className={groupIndex > 0 ? "mt-16" : ""}>
                <Reveal>
                  <div className="kh-section-heading">
                    <div>
                      <SectionKicker index={String(groupIndex + 2).padStart(2, "0")} text={group.kicker} />
                      <h2>{group.kicker}</h2>
                      <p className="kh-section-lede mt-4">{group.lede}</p>
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <ol className="m-0 mt-8 grid list-none gap-5 p-0 md:grid-cols-3">
                    {group.items.map((item) => (
                      <li
                        key={item.title}
                        className="flex flex-col rounded-lg border border-(--kh-line) p-6"
                      >
                        <h3 className="m-0 text-lg font-semibold">{item.title}</h3>
                        <p className="kh-mono mt-4 text-xs uppercase tracking-wide text-(--kh-muted)">{whatLabel}</p>
                        <p className="mt-1 text-sm leading-6 text-(--kh-muted)">{item.what}</p>
                        <div className="mt-4 grid gap-3 border-t border-(--kh-line) pt-4 text-sm leading-6">
                          <p className="m-0">
                            <strong>{materialLabel}</strong>
                            <span className="block text-(--kh-muted)">{item.materials}</span>
                          </p>
                          <p className="m-0">
                            <strong>{outputLabel}</strong>
                            <span className="block text-(--kh-muted)">{item.output}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>
            ))}
          </div>
        </section>

        <section className="kh-section kh-section-muted">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index={String(groups.length + 2).padStart(2, "0")} text={t("capabilities.start.kicker")} />
                  <h2>{t("capabilities.start.title")}</h2>
                  <p className="kh-section-lede mt-5">{t("capabilities.start.lede")}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <ol className="m-0 grid list-none gap-x-14 border-t border-(--kh-line) p-0 md:grid-cols-2">
                {startSteps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-(--kh-line) py-6">
                    <b className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</b>
                    <div>
                      <h3 className="m-0 text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-cta">
          <Reveal mode="none">
            <div className="kh-keyline" aria-hidden="true" />
          </Reveal>
          <div className="kh-shell">
            <Reveal>
              <SectionKicker index={String(groups.length + 3).padStart(2, "0")} text={t("capabilities.cta.kicker")} light />
              <h2>{t("capabilities.cta.title")}</h2>
              <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                {t("capabilities.cta.lede")}
              </p>
              <div className="kh-actions mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="kh-button kh-button-light">
                  {t("capabilities.cta.requestQuote")}
                </Link>
                <Link href="/contact" className="kh-button kh-button-ghost">
                  {t("capabilities.cta.sendReference")}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
