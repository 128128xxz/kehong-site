import Image from "next/image";
import { getLocale } from "next-intl/server";
import { gallerySlides, visualText } from "@/data/visuals";

export default async function CaseGallery() {
  const locale = await getLocale();

  return (
    <section className="texture-ink bg-[#171713] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
              {locale === "zh" ? "工厂与产品实景" : "Factory and product gallery"}
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight">
              {locale === "zh" ? "通过样品、材料和工厂实景，直观看到科宏的生产与包装能力。" : "See Kehong's production and packaging capabilities through samples, materials and factory views."}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#f7f0df]/72">
            {locale === "zh"
              ? "从材料纹理到成品结构，了解适合您项目的纸品包装方向。"
              : "From material textures to finished structures, explore packaging directions for your project."}
          </p>
        </div>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
        {gallerySlides.map((slide, index) => (
          <figure
            key={slide.image}
            className="premium-depth group relative h-[360px] min-w-[78vw] snap-center overflow-hidden rounded-lg border border-white/12 bg-white/8 shadow-xl shadow-black/20 sm:min-w-[420px]"
          >
            <Image
              src={slide.image}
              alt={visualText(slide.label, locale)}
              fill
              sizes="(min-width: 1024px) 420px, 78vw"
              className="object-cover transition duration-200 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(23,23,19,.68))]" />
            <figcaption className="absolute bottom-5 left-5 right-5">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#e8c06c]">
                0{index + 1}
              </span>
              <p className="mt-2 text-xl font-black">
                {visualText(slide.label, locale)}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
