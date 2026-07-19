import { ArrowRight, Layers3, PackageCheck } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import ResilientImage from "@/components/ui/ResilientImage";
import { homeEnglish } from "@/content/en/home";

const productSystems = [
  {
    id: "materials",
    icon: Layers3,
    image: showcaseImages.swatch,
    href: "/products?system=materials",
    en: homeEnglish.systems.materials,
    zh: {
      number: "01 / 材料",
      title: "为下一道生产工序选择合适纸材。",
      body: "按材质、克重、涂层和加工要求选择。",
      items: ["杯纸", "牛皮纸", "白卡纸", "瓦楞纸"],
      cta: "浏览纸材",
    },
  },
  {
    id: "packaging",
    icon: PackageCheck,
    image: showcaseImages.foodOpen,
    href: "/products?system=packaging",
    en: homeEnglish.systems.packaging,
    zh: {
      number: "02 / 成品包装",
      title: "面向真实应用的成品包装结构。",
      body: "按用途、结构、尺寸和后工艺选择。",
      items: ["食品与烘焙盒", "纸盒", "纸托", "内托"],
      cta: "浏览包装",
    },
  },
] as const;

export default async function ProductShowcase() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <section
      id="product-window"
      data-visual-section="product-architecture"
      className="kh-systems-section product-window-texture scroll-mt-20 px-4 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-5 border-b border-[#d9d2be] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="kh-section-kicker">{isZh ? "产品入口" : "Product systems"}</p>
            <h2 className="kh-editorial-heading mt-4 max-w-2xl text-4xl leading-[.96] tracking-[-.045em] text-[#171713] sm:text-6xl">
              {isZh ? "两个产品体系，一个制造伙伴。" : homeEnglish.systems.heading}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#626156]">
            {isZh ? "从材料采购或成品包装方向进入产品目录。" : homeEnglish.systems.intro}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {productSystems.map((system) => {
            const Icon = system.icon;
            const copy = isZh ? system.zh : system.en;

            return (
              <Link
                key={system.id}
                href={system.href}
                className={`kh-system-card group relative overflow-hidden border border-[#cdbb9a] shadow-[0_18px_48px_rgba(62,49,28,.12)] ${system.id === "packaging" ? "kh-system-card--packaging bg-[#eee8db] text-[#171713]" : "bg-[#18372e] text-white"}`}
              >
                {system.id === "packaging" ? (
                  <div className="kh-packaging-diagram absolute inset-0" role="img" aria-label={isZh ? "暖白纸盒、打开状态和纸托结构示意" : "Warm-white carton, open state, and tray structure diagram"}>
                    <span className="kh-packaging-diagram__lid" />
                    <span className="kh-packaging-diagram__base" />
                    <span className="kh-packaging-diagram__tray" />
                    <span className="kh-packaging-diagram__crease kh-packaging-diagram__crease--one" />
                    <span className="kh-packaging-diagram__crease kh-packaging-diagram__crease--two" />
                  </div>
                ) : (
                  <ResilientImage
                    src={system.image}
                    fallbackSrc={showcaseImages.structureMaterialReal}
                    alt={copy.title}
                    fill
                    sizes="(min-width: 1024px) 48vw, 94vw"
                    className="object-cover opacity-72 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-84"
                  />
                )}
                <div className="kh-system-card__veil absolute inset-0" />
                <div className="kh-system-card__content relative flex flex-col justify-between p-5 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-10 place-items-center border border-[#e8c06c]/60 bg-[#e8c06c] text-[#171713]">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs font-bold tracking-[.18em] text-[#e8c06c]">{copy.number}</span>
                  </div>
                  <div className="max-w-lg">
                    <h3 className="text-2xl font-semibold leading-[1.05] tracking-[-.03em] sm:text-4xl">{copy.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/76">{copy.body}</p>
                    <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/18 pt-4 text-xs font-semibold text-white/86 sm:text-sm">
                      {copy.items.map((item) => (
                          <li key={item} className="kh-system-item flex items-start gap-2">
                          <span className="mt-2 size-1.5 shrink-0 bg-[#e8c06c]" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-2 border-b border-[#e8c06c] pb-1.5 text-sm font-black text-[#e8c06c]">
                      {copy.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
