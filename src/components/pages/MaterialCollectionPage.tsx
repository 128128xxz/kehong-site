import { ArrowRight, Check, Layers3 } from "lucide-react";
import Image from "next/image";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import RelatedLinks from "@/components/site/RelatedLinks";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import type { MaterialCollection, MaterialCopy } from "@/data/materialCollections";

function text(value: MaterialCopy, locale: string) {
  return locale === "zh" ? value.zh : value.en;
}

function BulletList({ items, locale }: { items: MaterialCopy[]; locale: string }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item.en} className="flex gap-3 text-sm leading-6 text-(--kh-muted)">
          <Check className="mt-1 size-4 shrink-0 text-(--kh-brass)" />
          <span>{text(item, locale)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MaterialCollectionPage({ locale, collection }: { locale: string; collection: MaterialCollection }) {
  const zh = locale === "zh";
  const isCorrugated = collection.slug === "corrugated-paper";
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={zh ? "科宏 · 材料集合" : "Kehong · Material collection"}
          title={text(collection.title, locale)}
          lede={text(collection.description, locale)}
          image={{ src: collection.image.src, alt: text(collection.image.alt, locale) }}
          imageScrim={collection.slug === "metallic-paper" || collection.slug === "pearlescent-paper" ? "soft" : "standard"}
          meta={[`${collection.groups.reduce((total, group) => total + group.items.length, 0)} ${zh ? "个材料方向" : "material directions"}`, "OEM / ODM", zh ? "中国广东佛山" : "Foshan, Guangdong, China"]}
        >
          <Link href="/contact" className="kh-button kh-button-light">{zh ? "索取材料样品" : "Request material samples"}<ArrowRight className="size-4" /></Link>
          <Link href="/materials" className="kh-button kh-button-ghost">{zh ? "返回材料总览" : "Back to materials"}</Link>
        </PageHero>

        <div className="kh-shell pt-7">
          <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="kh-mono text-(--kh-muted)">
            <Link href="/" className="hover:text-(--kh-ink)">{zh ? "首页" : "Home"}</Link>
            <span className="mx-2 text-(--kh-ink)/35">/</span>
            <Link href="/materials" className="hover:text-(--kh-ink)">{zh ? "材料" : "Materials"}</Link>
            <span className="mx-2 text-(--kh-ink)/35">/</span>
            <span className="text-(--kh-ink)">{text(collection.title, locale)}</span>
          </nav>
        </div>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="max-w-3xl">
                <SectionKicker index="02" text={zh ? "材料方向" : "Material directions"} />
                <h2>{isCorrugated ? (zh ? "区分坑型与板材结构" : "Separate flute from board construction") : (zh ? "按表面与视觉效果选择" : "Choose by surface and visual effect")}</h2>
                <p className="kh-section-lede mt-5">{isCorrugated ? (zh ? "按坑型、层数和表面选择瓦楞纸板。发送尺寸、图稿或参考样品，我们可以推荐合适的材料方向。" : "Choose corrugated board by flute, layers and surface. Send us your dimensions, artwork or reference sample and we can recommend suitable options.") : (zh ? "按颜色、表面和纹理选择材料。生产前可申请样品，也可以发送图稿或参考样品让我们推荐合适的包装材料。" : "Choose by color, surface and texture. Samples are available before production; send us your artwork or reference sample and we can recommend suitable material options.")}</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {collection.groups.map((group) => (
                  <article key={group.title.en} className="kh-panel h-full p-6">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--kh-brass-soft)/30 text-(--kh-brass)"><Layers3 className="size-5" /></span>
                      <h3 className="text-lg font-semibold">{text(group.title, locale)}</h3>
                    </div>
                    <div className="mt-5"><BulletList items={group.items} locale={locale} /></div>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {isCorrugated ? (
          <section className="kh-section kh-section-muted border-y border-(--kh-line)">
            <div className="kh-shell grid gap-10 lg:grid-cols-2">
              <Reveal>
                <SectionKicker index="03" text={zh ? "结构与坑型" : "Construction & flute"} />
                <h2>{zh ? "按项目组合纸材与克重" : "Combine paper layers and grammage for the project"}</h2>
                <p className="kh-section-lede mt-5">{zh ? "支持 E / F / G 坑型、双层和三层结构，以及不同纸材和克重组合。发送尺寸与用途，我们可以推荐合适的板材方向，生产前可申请样品。" : "Choose from E / F / G flute, double-layer or triple-layer construction, with paper and grammage options for the intended use. Send us dimensions and application details; samples are available before production."}</p>
              </Reveal>
              <Reveal delay={80}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["E Flute", zh ? "适合细致折叠与小型结构方向" : "For fine folds and compact structure directions"],
                    ["F Flute", zh ? "适合表面与结构平衡的项目评审" : "For a balance of surface and structure"],
                    ["G Flute", zh ? "适合更细的瓦楞视觉与部件方向" : "For finer corrugated visual and component directions"],
                    [zh ? "双层 / 三层" : "Double-layer / triple-layer", zh ? "按承托与运输需求选择" : "Choose by support and transport needs"],
                  ].map(([title, body]) => (
                    <div key={title} className="kh-panel p-5"><p className="kh-mono text-(--kh-brass)">{title}</p><p className="mt-3 text-sm leading-6 text-(--kh-muted)">{body}</p></div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        <section className="kh-section">
          <div className="kh-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <Reveal>
              <SectionKicker index={isCorrugated ? "04" : "03"} text={zh ? "表面与应用" : "Surface & applications"} />
              <h2>{zh ? "让材料选择连接到包装应用" : "Connect material selection to the packaging application"}</h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="grid gap-8 sm:grid-cols-2">
                <div><h3 className="text-lg font-semibold">{zh ? "表面与后道" : "Surface & finish"}</h3><div className="mt-4"><BulletList items={collection.finishes} locale={locale} /></div></div>
                <div><h3 className="text-lg font-semibold">{zh ? "颜色与纹理" : "Color & texture"}</h3><div className="mt-4"><BulletList items={collection.colorsOrTextures} locale={locale} /></div></div>
                <div className="sm:col-span-2 border-t border-(--kh-line) pt-6"><h3 className="text-lg font-semibold">{zh ? "适用包装" : "Packaging applications"}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><BulletList items={collection.applications} locale={locale} /></div></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-paper border-y border-(--kh-line)">
          <div className="kh-shell">
            <Reveal><SectionKicker index={isCorrugated ? "05" : "04"} text={zh ? "代表性视觉" : "Representative visuals"} /><h2>{zh ? "用于材料沟通的参考图" : "Reference visuals for material communication"}</h2><p className="kh-section-lede mt-4">{zh ? "图片展示材料方向和表面效果，生产前可申请样品。" : "Compare material directions and surface effects here; samples are available before production."}</p></Reveal>
            <Reveal delay={80}>
              <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {collection.gallery.map((image) => <figure key={image.src} className="overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface)"><div className="relative aspect-[4/3]"><Image src={image.src} alt={text(image.alt, locale)} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="object-cover" /></div><figcaption className="p-3 text-xs leading-5 text-(--kh-muted)">{text(image.alt, locale)}</figcaption></figure>)}
              </div>
            </Reveal>
          </div>
        </section>

        <RelatedLinks locale={locale} index={isCorrugated ? "06" : "05"} title={{ en: "View packaging applications", zh: "查看包装应用" }} links={[
          { href: "/packaging/corrugated-mailer-boxes", en: "Corrugated mailer boxes", zh: "瓦楞邮寄盒" },
          { href: "/packaging/pizza-packaging", en: "Pizza boxes & food paper pads", zh: "披萨盒与食品纸垫" },
          { href: "/packaging/inserts-dividers", en: "Inserts & dividers", zh: "内托与隔板" },
          { href: "/contact", en: "Get a quote / request samples", zh: "询价 / 申请样品" },
        ]} />
      </main>
      <SiteFooter />
    </div>
  );
}
