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
              {locale === "zh" ? "结构在实际应用中的表现" : "Structure in practice"}
            </p>
            <h2 className="kh-editorial-heading mt-4 max-w-2xl text-4xl leading-tight tracking-[-.03em]">
              {locale === "zh" ? "通过匿名应用、材料和结构细节，了解纸包装如何服务真实使用场景。" : "Review anonymous applications, material choices and structural details without invented customer claims."}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#f7f0df]/72">
            {locale === "zh"
              ? "从材料纹理到成品结构，选择适合您项目的包装方向。"
              : "From material texture to finished structure, choose a direction for your project."}
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
