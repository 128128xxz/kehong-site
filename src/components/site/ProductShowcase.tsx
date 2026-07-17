import Image from "next/image";
import { ArrowRight, Boxes, Layers3, PackageCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFamilies, getFeaturedProductGroups, getLocalizedCatalogValue, getLocalizedProductMaterial, getLocalizedProductTitle } from "@/lib/catalog";
import { showcaseImages } from "@/data/visuals";
import ProductImageWithStatus from "@/components/site/ProductImageWithStatus";

export default async function ProductShowcase() {
  const t = await getTranslations("Site");
  const locale = await getLocale();
  const families = getFamilies().filter((family) => family.count > 0).slice(0, 8);
  const featuredGroups = getFeaturedProductGroups(8);
  const familyVisuals = [
    showcaseImages.webKraftBox,
    showcaseImages.webWhiteBox,
    showcaseImages.foodDetail,
    showcaseImages.webBakeryCakeBox,
    showcaseImages.swatch,
    showcaseImages.webBakeryDisplayBox,
    showcaseImages.cakeBoardRealAlt,
    showcaseImages.webFactoryWorktable,
  ] as const;
  const cabinetCards = [
    {
      key: "semi-finished",
      icon: Layers3,
      image: showcaseImages.structureMaterialReal,
      title: locale === "zh" ? "半成品材料" : "Semi-finished materials",
      body:
        locale === "zh"
          ? "纸杯扇形片、杯纸卷、牛皮纸、白卡、瓦楞 / 坑纸、特种纸和纸垫片。"
          : "Cup fan blanks, cupstock rolls, kraft, white board, corrugated materials, specialty paper and pads.",
      meta: locale === "zh" ? "按材质 / 克重 / 涂层选择" : "Choose by material / GSM / coating",
      href: "/products/paper-packaging-materials",
      cta: locale === "zh" ? "查看材料" : "Browse materials",
    },
    {
      key: "finished",
      icon: PackageCheck,
      image: showcaseImages.unsplashTakeawayPackaging,
      title: locale === "zh" ? "成品包装" : "Finished packaging",
      body:
        locale === "zh"
          ? "食品包装盒、纸盒、内托、烘焙包装、展示盒和定制包装结构。"
          : "Food boxes, paper boxes, inserts, bakery packaging, display boxes and custom structures.",
      meta: locale === "zh" ? "按用途 / 结构 / 尺寸咨询" : "Choose by use / structure / size",
      href: "/products/food-packaging-boxes",
      cta: locale === "zh" ? "查看包装" : "Browse packaging",
    },
  ] as const;

  return (
    <section
      id="product-window"
      className="texture-paper scroll-mt-20 bg-[#f6f4ec] px-4 py-24 sm:px-6 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9a6b1f]">
            {locale === "zh" ? "产品架构" : "Product architecture"}
          </p>
          <h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.035em] text-[#171713] sm:text-6xl">
            {locale === "zh" ? "先选材料，还是直接选成品包装？" : "Start with the material or the finished pack."}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#626156] sm:text-lg">
            {locale === "zh"
              ? "将材料与成品包装分开呈现，方便您按项目阶段快速找到合适的产品。"
              : "Separate material and finished-packaging ranges make it easier to find the right product for each project stage."}
          </p>
        </div>
        <div className="mb-20 grid gap-6 lg:grid-cols-2">
          {cabinetCards.map((cabinet) => {
            const Icon = cabinet.icon;

            return (
              <Link
                key={cabinet.key}
                href={cabinet.href}
                className="premium-depth group relative min-h-[380px] overflow-hidden rounded-[1.5rem] border border-[#d9d2be] bg-[#171713] shadow-xl shadow-[#171713]/10 lg:min-h-[440px]"
              >
                <Image
                  src={cabinet.image}
                  alt={cabinet.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 94vw"
                  className="object-cover opacity-72 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-86"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,19,.94),rgba(23,23,19,.42)_62%,rgba(23,23,19,.08))]" />
                <div className="relative flex min-h-[380px] flex-col justify-end p-7 text-white sm:p-10 lg:min-h-[440px]">
                  <span className="mb-auto grid size-12 place-items-center rounded-xl bg-[#e8c06c] text-[#171713] shadow-lg shadow-black/15">
                    <Icon className="size-5" />
                  </span>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#e8c06c]">
                    {cabinet.key === "semi-finished" ? "01" : "02"} / {locale === "zh" ? "产品范围" : "Product range"}
                  </p>
                  <h2 className="mt-4 max-w-md text-4xl font-black leading-[0.98] tracking-[-0.03em] sm:text-5xl">{cabinet.title}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#f7f0df]/78 sm:text-base">{cabinet.body}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#f7f0df]/86 backdrop-blur-xl">
                      {cabinet.meta}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#e8c06c] px-4 py-2 text-sm font-black text-[#171713]">
                      {cabinet.cta}
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
          <div className="product-window-texture rounded-[1.5rem] p-7 sm:p-9 lg:p-11">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#b47b18]">
              {t("products.eyebrow")}
            </p>
            <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.03em] text-[#171713] sm:text-6xl">
              {t("products.title")}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#626156] sm:text-lg">
              {t("products.description")}
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#171713] px-5 py-3 text-sm font-bold text-white shadow-xl shadow-[#171713]/12 transition hover:-translate-y-0.5 hover:bg-[#2b2b24]"
            >
              {t("products.viewAll")}
              <ArrowRight className="size-4" />
            </Link>

          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {families.map((family, index) => {
              const image = familyVisuals[index % familyVisuals.length];
              const familyTitle =
                locale === "zh"
                  ? family.title.zh
                  : getLocalizedCatalogValue(family.title.en, locale, "Paper packaging range");

              return (
                <Link
                  key={family.id}
                  href="/products"
                  className="premium-depth group relative overflow-hidden rounded-2xl border border-[#d9d2be] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#171713]/50 hover:shadow-xl hover:shadow-[#171713]/12"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={image}
                      alt={familyTitle}
                      fill
                      loading="eager"
                      sizes="(min-width: 1024px) 320px, 50vw"
                      className="object-cover transition duration-200 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(23,23,19,.52))]" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-white/18 px-3 py-1 text-[11px] font-black text-white shadow-lg shadow-black/12 backdrop-blur-xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <Layers3 className="size-5 shrink-0 text-[#171713]" />
                      <span className="rounded-full bg-[#f1e7cf] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a6b1f]">
                        OEM
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-black leading-tight text-[#171713]">
                      {familyTitle}
                    </h3>
                    <div className="mt-3 h-px bg-gradient-to-r from-[#171713]/18 via-[#e8c06c]/64 to-transparent" />
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[#626156]">
                        {family.count} {locale === "zh" ? "个产品" : "products"}
                      </span>
                      <span className="inline-flex items-center gap-1 font-black text-[#b47b18] transition group-hover:translate-x-1">
                        {locale === "zh" ? "查看规格" : "View specs"}
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="premium-depth kh-micro-grid mt-20 overflow-hidden rounded-[1.5rem] border border-[#d9d2be] bg-[#171713] p-6 text-white shadow-2xl shadow-[#171713]/18 sm:p-8">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
                {t("products.featured")}
              </p>
            </div>
            <Boxes className="size-6 text-[#e8c06c]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredGroups.map((group, index) => {
              const sku = group.representative;

              return (
              <Link
                key={group.id}
                href={`/products/${sku.slug}`}
                className="group overflow-hidden rounded-xl border border-white/12 bg-white/7 transition hover:-translate-y-1 hover:border-[#e8c06c]/60 hover:bg-white/10"
              >
                <div className="relative h-36">
                  <ProductImageWithStatus
                    sku={sku}
                    locale={locale}
                    imageIndex={index}
                    sizes="(min-width: 1280px) 280px, 50vw"
                    className="object-cover transition duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e8c06c]">
                    {sku.sku}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-base font-bold leading-tight text-white">
                    {getLocalizedProductTitle(sku, locale)}
                  </h3>
                  <p className="mt-2 line-clamp-1 text-sm leading-6 text-[#f7f0df]/72">
                    {getLocalizedProductMaterial(sku, locale) || getLocalizedCatalogValue(sku.gsmOrThickness, locale)}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#e8c06c]/80">
                    {group.variants.length} {locale === "zh" ? "个变体" : group.variants.length === 1 ? "variant" : "variants"}
                  </p>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
