import { Layers3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { productCatalogSections } from "@/data/productDirectory";

type Props = {
  locale: string;
  section: "materials" | "finished";
};

function title(group: { en: string; zh: string }, zh: boolean) {
  return zh ? group.zh : group.en;
}

export default function ProductDirectory({ locale, section }: Props) {
  const zh = locale === "zh";
  const materials = section === "materials";
  const catalogSection = productCatalogSections.find(({ id }) => id === (materials ? "materials" : "finished-packaging"));
  if (!catalogSection) return null;

  return (
    <section id={materials ? "materials-and-components" : "finished-packaging"} aria-labelledby={`${section}-directory-title`} className="kh-section kh-section-paper border-y border-(--kh-line) scroll-mt-24">
      <div className="kh-shell">
        <div className="kh-section-heading">
          <div>
            <p className="kh-eyebrow">{materials ? (zh ? "02 · 材料与加工" : "02 · Materials & converting") : (zh ? "01 · 成品包装" : "01 · Finished packaging")}</p>
            <h2 id={`${section}-directory-title`}>{title(catalogSection.label, zh)}</h2>
          </div>
          <p className="max-w-[48ch] text-sm leading-6 text-(--kh-muted)">{title(catalogSection.description, zh)}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {catalogSection.groups.map((group) => (
            <section key={group.id} className="rounded-lg border border-(--kh-line) bg-(--kh-surface) p-5" aria-labelledby={`${section}-${group.id}-title`}>
              <div className="flex items-start gap-3">
                <Layers3 className="mt-0.5 size-5 shrink-0 text-(--kh-brass)" />
                <div>
                  <h3 id={`${section}-${group.id}-title`} className="text-lg font-semibold text-(--kh-ink)">{title(group, zh)}</h3>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {group.links.map((item) => (
                  <Link key={item.id} href={item.href} className="group flex items-center justify-between gap-3 rounded-sm border border-(--kh-line) bg-(--kh-paper) p-3 transition hover:border-(--kh-forest)/45">
                    <span>
                      <span className="block text-sm font-semibold text-(--kh-ink)">{title(item, zh)}</span>
                      <span className="mt-1 block text-xs leading-5 text-(--kh-muted)">{title(item.description, zh)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
