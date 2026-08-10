import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import { showcaseImages } from "@/data/visuals";
import { productCatalogSections } from "@/data/productDirectory";

const sectionVisuals = {
  materials: {
    image: showcaseImages.structureMaterialReal,
    alt: "Paperboard layers and material cross sections for packaging conversion",
  },
  "finished-packaging": {
    image: showcaseImages.representativeBakeryPackaging,
    alt: "Representative unbranded food and bakery paper packaging structures",
  },
} as const;

export default function HomeProductSystems({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-section kh-section-paper">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="02" text={zh ? "产品体系" : "Product range"} />
              <h2>{zh ? "先选择纸材与半成品，或成品包装，再查看对应产品和规格。" : "Choose paper materials or finished packaging, then review the relevant products and specifications."}</h2>
            </div>
            <Link className="kh-text-link" href="/products">
              {zh ? "查看全部产品" : "View all products"}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2" data-testid="homepage-product-systems">
          {productCatalogSections.map((section, index) => {
            const visual = sectionVisuals[section.id];
            const label = zh ? section.label.zh : section.label.en;
            const description = zh ? section.description.zh : section.description.en;
            const cta = zh ? section.cta.zh : section.cta.en;

            return (
              <Reveal key={section.id} delay={index * 90}>
                <article className="overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) shadow-sm">
                  <div className="kh-media-shade relative aspect-[16/9] overflow-hidden">
                    <Image src={visual.image} alt={visual.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <span className="kh-fig-caption kh-mono">{`0${index + 1} · ${label}`}</span>
                  </div>
                  <div className="p-6 sm:p-7">
                    <p className="kh-eyebrow">{zh ? "产品范围" : "Product range"}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-(--kh-ink)">{label}</h3>
                    <p className="mt-3 max-w-[56ch] text-sm leading-6 text-(--kh-muted)">{description}</p>
                    <div className="mt-5 grid gap-2">
                      {section.groups.flatMap((group) => group.links).map((item) => (
                        <Link key={item.id} href={item.href} data-testid="homepage-product-entry" className="group flex items-center justify-between gap-3 rounded-sm border border-(--kh-line) bg-(--kh-paper) px-3 py-2.5 transition hover:border-(--kh-forest)/45">
                          <span>
                            <span className="block text-sm font-semibold text-(--kh-ink)">{zh ? item.zh : item.en}</span>
                            <span className="mt-1 block text-xs leading-5 text-(--kh-muted)">{zh ? item.description.zh : item.description.en}</span>
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-(--kh-forest) transition group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                    <Link href={section.href} className="kh-text-link mt-6 inline-flex">
                      {cta}<ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
