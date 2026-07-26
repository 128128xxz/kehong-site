import { ArrowRight, FileText, Palette, Ruler, Scissors } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { Link } from "@/i18n/navigation";
import { finishOptions, resourceItems } from "@/data/siteContent";

const icons = [Palette, FileText, Scissors, Ruler, FileText, FileText];

export default function ResourcesPage({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  return (
    <div className="texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <p className="kh-eyebrow">Kehong · Design Center</p>
          <h1 className="kh-editorial-heading mt-4 max-w-4xl text-4xl sm:text-6xl">
            {isZh ? "让文件、材料和结构更容易被确认" : "Resources for a cleaner packaging handoff."}
          </h1>
          <p className="kh-lede mt-6 max-w-2xl">
            {isZh
              ? "从 artwork、材料和工艺，到 dieline、选型和打样，先把采购问题整理清楚。"
              : "Use the Design Center to prepare artwork, compare materials and finishes, request a dieline and understand the sample path before production."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact" className="kh-button kh-button-primary">
              Talk to a packaging expert <ArrowRight className="size-4" />
            </Link>
            <Link href="/capabilities" className="kh-button kh-button-secondary">
              Explore capabilities
            </Link>
          </div>
        </section>

        <section className="border-y border-(--kh-line) bg-(--kh-surface)">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {resourceItems.map((item, index) => {
              const Icon = icons[index] ?? FileText;
              return (
                <article key={item.slug} className="rounded-lg border border-(--kh-line) bg-(--kh-paper) p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-(--kh-brass-soft)/35 text-(--kh-brass)">
                      <Icon className="size-5" />
                    </span>
                    <span className="kh-eyebrow">{item.type === "request" ? "Request" : "Guide"}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{item.summary}</p>
                  <ul className="mt-4 grid gap-2">
                    {item.topics.map((topic) => (
                      <li key={topic} className="flex gap-2 text-sm text-(--kh-muted)">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-(--kh-brass)" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                  {item.type === "request" ? (
                    <Link href="/contact" className="kh-text-link mt-5">
                      Request a dieline <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-(--kh-forest)">
                      <FileText className="size-4" />
                      Read guide on this page
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="kh-panel p-7">
              <h2 className="text-2xl font-semibold">Finishes at a glance</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {finishOptions.map((finish) => (
                  <p key={finish} className="rounded-md bg-(--kh-paper) px-4 py-3 text-sm font-medium text-(--kh-ink)">
                    {finish}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-lg texture-ink p-7">
              <h2 className="text-2xl font-semibold">Need a structure recommendation?</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Send the product, dimensions, quantity and destination. We will review the brief without forcing you to know every packaging term.
              </p>
              <Link href="/contact" className="kh-button kh-button-light mt-5">
                Start guided RFQ <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
