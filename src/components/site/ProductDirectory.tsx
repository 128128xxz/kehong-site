import Image from "next/image";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getHomepageProductEntries } from "@/lib/product-routing";
import { packagingCategories } from "@/data/packagingCategories";

type Props = { locale: string };

const materialGroups = [
  { id: "cupstock", title: { en: "Cupstock & cup components", zh: "杯纸与纸杯组件" }, entries: ["paper-cup-fan", "paper-cup-bottom-roll", "cupstock-paper"] },
  { id: "coated", title: { en: "Coated rolls & sheets", zh: "淋膜卷材与平张" }, entries: ["pe-coated-paper-roll", "pe-coated-paper-sheet"] },
  { id: "tray", title: { en: "Tray & forming materials", zh: "纸托与成型材料" }, entries: ["food-tray-material"] },
] as const;

/**
 * The public directory deliberately starts from what a buyer is sourcing.
 * Level 2 nodes are current product groups or current packaging categories;
 * level 3 nodes are their real public SKU aggregates or project-led entries.
 */
export default function ProductDirectory({ locale }: Props) {
  const zh = locale === "zh";
  const materialEntries = getHomepageProductEntries();

  return (
    <section aria-labelledby="product-directory-title" className="kh-section kh-section-paper border-y border-(--kh-line)">
      <div className="kh-shell">
        <div className="kh-section-heading">
          <div>
            <p className="kh-eyebrow">{zh ? "01 · 分层目录" : "01 · Source directory"}</p>
            <h2 id="product-directory-title">{zh ? "先区分纸材与成品，再进入具体方向。" : "Start with materials or finished packaging, then narrow the direction."}</h2>
          </div>
          <p className="max-w-[42ch] text-sm leading-6 text-(--kh-muted)">{zh ? "纸材与半成品对应当前已发布 SKU；成品包装按现有可承接的项目方向组织。" : "Materials and semi-finished components lead to published SKU groups; finished packaging leads to current project directions."}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section aria-labelledby="materials-directory-title" className="rounded-lg border border-(--kh-line) bg-(--kh-surface) p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kh-eyebrow">{zh ? "第一层 · 纸材与半成品" : "Level 1 · Materials & components"}</p>
                <h3 id="materials-directory-title" className="mt-2 text-2xl font-semibold tracking-tight text-(--kh-ink)">{zh ? "纸材与半成品" : "Paper materials & semi-finished components"}</h3>
              </div>
              <Layers3 className="size-5 shrink-0 text-(--kh-brass)" />
            </div>
            <div className="mt-6 grid gap-4">
              {materialGroups.map((group, groupIndex) => (
                <div key={group.id} className="rounded-md border border-(--kh-line) bg-(--kh-paper) p-3">
                  <p className="kh-mono text-xs font-bold text-(--kh-brass)">{`0${groupIndex + 1} · ${zh ? "第二层 · 产品大类" : "Level 2 · Product group"}`}</p>
                  <h4 className="mt-1 text-base font-semibold text-(--kh-ink)">{zh ? group.title.zh : group.title.en}</h4>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.entries.map((entryId) => {
                      const entry = materialEntries.find((candidate) => candidate.id === entryId);
                      if (!entry) return null;
                      return <Link key={entry.id} href={entry.href} className="group rounded-sm border border-(--kh-line) bg-(--kh-surface) p-3 transition hover:border-(--kh-forest)/45">
                        <p className="kh-mono text-[.65rem] font-bold text-(--kh-brass)">{zh ? "第三层 · 当前 SKU 聚合" : "Level 3 · Published SKU group"}</p>
                        <span className="mt-1 block text-sm font-semibold text-(--kh-ink)">{zh ? entry.title.zh : entry.title.en}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-(--kh-forest)">{zh ? "查看规格" : "View specifications"}<ArrowRight className="size-3.5" /></span>
                      </Link>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="packaging-directory-title" className="rounded-lg border border-(--kh-line) bg-(--kh-surface) p-5 sm:p-6">
            <div>
              <p className="kh-eyebrow">{zh ? "第一层 · 成品包装" : "Level 1 · Finished packaging"}</p>
              <h3 id="packaging-directory-title" className="mt-2 text-2xl font-semibold tracking-tight text-(--kh-ink)">{zh ? "成品包装" : "Finished packaging"}</h3>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {packagingCategories.map((category, index) => (
                <Link key={category.slug} href={`/packaging/${category.slug}`} className="group grid min-h-38 grid-cols-[5rem_1fr] gap-3 overflow-hidden rounded-md border border-(--kh-line) bg-(--kh-paper) p-3 transition hover:border-(--kh-forest)/45 hover:bg-(--kh-surface)">
                  <span className="relative block h-20 overflow-hidden rounded-sm">
                    <Image src={category.image} alt="" fill sizes="80px" className="object-cover transition duration-200 group-hover:scale-[1.03]" />
                  </span>
                  <span className="min-w-0">
                    <span className="kh-mono block text-xs font-bold text-(--kh-brass)">{`0${index + 1} · ${zh ? "第二层 · 成品大类" : "Level 2 · Finished category"}`}</span>
                    <span className="mt-1 block text-base font-semibold leading-5 text-(--kh-ink)">{zh ? category.title.zh : category.title.en}</span>
                    <span className="mt-2 block text-sm leading-5 text-(--kh-muted)">{zh ? category.shortDescription.zh : category.shortDescription.en}</span>
                    <span className="mt-2 block text-[.7rem] font-semibold leading-4 text-(--kh-forest)">{zh ? `第三层 · ${category.subcategories.zh.slice(0, 2).join("、")}` : `Level 3 · ${category.subcategories.en.slice(0, 2).join(" · ")}`}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
