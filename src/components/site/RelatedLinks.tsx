import { Link } from "@/i18n/navigation";

type RelatedLink = { href: string; en: string; zh: string };

export default function RelatedLinks({
  locale,
  title,
  index = "05",
  links,
  sectionId,
}: {
  locale: string;
  title?: { en: string; zh: string };
  index?: string;
  links: RelatedLink[];
  sectionId?: string;
}) {
  const zh = locale === "zh";
  return (
    <section id={sectionId} aria-labelledby={sectionId ? `${sectionId}-title` : undefined} className="kh-section kh-section-muted border-y border-(--kh-line)">
      <div className="kh-shell">
        <p id={sectionId ? `${sectionId}-title` : undefined} className="kh-eyebrow">{index} · {title ? (zh ? title.zh : title.en) : (zh ? "相关入口" : "Related next steps")}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="group flex min-h-22 items-center justify-between gap-4 rounded-md border border-(--kh-line) bg-(--kh-surface) px-5 py-4 text-sm font-semibold text-(--kh-ink) transition hover:border-(--kh-forest)/45 hover:shadow-sm">
              <span>{zh ? link.zh : link.en}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
