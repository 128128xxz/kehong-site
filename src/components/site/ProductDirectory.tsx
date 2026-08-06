import { ArrowRight, Layers3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { finishedPackagingDirectoryGroups, materialDirectoryGroups, type DirectoryGroup } from "@/data/productDirectory";

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
  const groups: readonly DirectoryGroup[] = materials ? materialDirectoryGroups : finishedPackagingDirectoryGroups;
  const heading = materials
    ? { en: "Paper materials & semi-finished components", zh: "纸材与半成品规格目录" }
    : { en: "Finished packaging project directory", zh: "成品包装项目目录" };
  const description = materials
    ? { en: "These published SKU groups are the only scope of the specification filters below.", zh: "以下已发布 SKU 分组是本页规格筛选的唯一范围。" }
    : { en: "These finished packaging directions are developed by project; no fixed SKU count or specification is implied.", zh: "以下成品包装按项目开发，不代表固定 SKU 数量或固定规格。" };

  return (
    <section id={materials ? "materials-and-components" : "finished-packaging"} aria-labelledby={`${section}-directory-title`} className="kh-section kh-section-paper border-y border-(--kh-line) scroll-mt-24">
      <div className="kh-shell">
        <div className="kh-section-heading">
          <div>
            <p className="kh-eyebrow">{materials ? (zh ? "01 · 纸材与半成品" : "01 · Materials & components") : (zh ? "02 · 成品包装" : "02 · Finished packaging")}</p>
            <h2 id={`${section}-directory-title`}>{title(heading, zh)}</h2>
          </div>
          <p className="max-w-[48ch] text-sm leading-6 text-(--kh-muted)">{title(description, zh)}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {groups.map((group, groupIndex) => (
            <section key={group.id} className="rounded-lg border border-(--kh-line) bg-(--kh-surface) p-5" aria-labelledby={`${section}-${group.id}-title`}>
              <div className="flex items-start gap-3">
                <Layers3 className="mt-0.5 size-5 shrink-0 text-(--kh-brass)" />
                <div>
                  <p className="kh-mono text-xs font-bold text-(--kh-brass)">{`0${groupIndex + 1} · ${zh ? "第二层 · 产品大类" : "Level 2 · Product group"}`}</p>
                  <h3 id={`${section}-${group.id}-title`} className="mt-1 text-lg font-semibold text-(--kh-ink)">{title(group, zh)}</h3>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {group.links.map((item) => (
                  <Link key={item.id} href={item.href} className="group flex items-center justify-between gap-3 rounded-sm border border-(--kh-line) bg-(--kh-paper) p-3 transition hover:border-(--kh-forest)/45">
                    <span>
                      <span className="kh-mono block text-[.62rem] font-bold text-(--kh-brass)">{zh ? "第三层 · 具体方向" : "Level 3 · Direction"}</span>
                      <span className="mt-1 block text-sm font-semibold text-(--kh-ink)">{title(item, zh)}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-(--kh-forest)" />
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
