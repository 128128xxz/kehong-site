import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import RelatedLinks from "@/components/site/RelatedLinks";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import { materialCollections, type MaterialCollection, type MaterialCopy } from "@/data/materialCollections";

function text(value: MaterialCopy, locale: string) {
  return locale === "zh" ? value.zh : value.en;
}

function CollectionCard({ collection, locale }: { collection: MaterialCollection; locale: string }) {
  const directionCount = collection.groups.reduce((total, group) => total + group.items.length, 0);
  return (
    <Link href={`/materials/${collection.slug}`} className="group grid overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) transition hover:-translate-y-1 hover:border-(--kh-forest)/45 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-(--kh-paper)">
        <Image src={collection.image.src} alt={text(collection.image.alt, locale)} fill sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-(--kh-ink)/55 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 kh-eyebrow kh-eyebrow-light">{directionCount} {locale === "zh" ? "个材料方向" : "material directions"}</span>
      </div>
      <div className="grid gap-3 p-5">
        <h2 className="text-xl font-semibold text-(--kh-ink)">{text(collection.title, locale)}</h2>
        <p className="text-sm leading-6 text-(--kh-muted)">{text(collection.description, locale)}</p>
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-(--kh-forest)">{locale === "zh" ? "浏览材料集合" : "Browse material collection"}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

export default function MaterialsPage({ locale }: { locale: string }) {
  const zh = locale === "zh";
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={zh ? "科宏 · 材料与加工" : "Kehong · Materials & converting"}
          title={zh ? "为成品包装服务的材料选择" : "Material options for finished packaging"}
          lede={zh ? "从瓦楞结构、坑型和层数，到金属、珠光、压纹和镭射表面，按包装项目整理材料方向。" : "From corrugated construction, flute and layers to metallic, pearlescent, embossed and laser surfaces, organized around the packaging project."}
          meta={[zh ? "6 个材料集合" : "6 material collections", "OEM / ODM", zh ? "中国广东佛山" : "Foshan, Guangdong, China"]}
        >
          <Link href="/contact" className="kh-button kh-button-light">{zh ? "索取材料样品" : "Request material samples"}<ArrowRight className="size-4" /></Link>
          <Link href="/packaging" className="kh-button kh-button-ghost">{zh ? "查看成品包装" : "View finished packaging"}</Link>
        </PageHero>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="max-w-3xl">
                <SectionKicker index="02" text={zh ? "材料集合" : "Material collections"} />
                <h2>{zh ? "材料不是终点，而是包装结构的起点" : "Materials are the starting point for the packaging structure"}</h2>
                <p className="kh-section-lede mt-5">{zh ? "按颜色、表面、纹理、坑型和层数选择材料。生产前可申请样品，发送图稿或参考样品后，我们可以推荐合适的包装材料。" : "Choose by color, surface, texture, flute and layers. Samples are available before production; send us your artwork or reference sample and we can recommend suitable material options."}</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {materialCollections.map((collection) => <CollectionCard key={collection.slug} collection={collection} locale={locale} />)}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-muted border-y border-(--kh-line)">
          <div className="kh-shell grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <Reveal>
              <SectionKicker index="03" text={zh ? "项目连接" : "Project connection"} />
              <h2>{zh ? "从材料到成品包装" : "From material direction to finished packaging"}</h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["01", zh ? "材料选择" : "Material selection", zh ? "颜色、表面、纹理、坑型和层数" : "Color, surface, texture, flute and layers"],
                  ["02", zh ? "结构评审" : "Structure review", zh ? "尺寸、开启方式、承托和运输" : "Dimensions, opening, support and transport"],
                  ["03", zh ? "加工与后道" : "Converting & finishing", zh ? "印刷、模切、覆膜、涂层和组装" : "Printing, die-cutting, lamination, coating and assembly"],
                  ["04", zh ? "成品包装" : "Finished packaging", zh ? "盒、袋、内托、纸垫与包装部件" : "Boxes, bags, inserts, pads and packaging components"],
                ].map(([index, title, body]) => (
                  <div key={index} className="kh-panel p-5">
                    <p className="kh-mono text-(--kh-brass)">{index}</p>
                    <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <RelatedLinks
          locale={locale}
          index="04"
          title={{ en: "Continue to a packaging application", zh: "继续查看包装应用" }}
          links={[
            { href: "/packaging/corrugated-mailer-boxes", en: "Corrugated mailer boxes", zh: "瓦楞邮寄盒" },
            { href: "/packaging/pizza-packaging", en: "Pizza boxes & food paper pads", zh: "披萨盒与食品纸垫" },
            { href: "/packaging/inserts-dividers", en: "Corrugated inserts", zh: "瓦楞内托与隔板" },
            { href: "/contact", en: "Get a project quote", zh: "提交项目询价" },
          ]}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
