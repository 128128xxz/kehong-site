import { ArrowRight, Box, Layers3, Rotate3D } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { homeEnglish } from "@/content/en/home";

/** Homepage-only static preview. The full 3D model remains route-only. */
export default async function Product3DStudio() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <section id="studio" data-3d-loading="route-only" data-3d-mobile-fallback="static" className="kh-studio-preview bg-[#f7f4ec] px-4 text-[#171713] sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-[90rem] gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center lg:gap-16">
        <div>
          <p className="kh-section-kicker">{isZh ? "3D 结构预览" : "3D Studio preview"}</p>
          <h2 className="kh-editorial-heading mt-4 max-w-xl text-4xl leading-[.98] tracking-[-.045em] sm:text-6xl">
            {isZh ? "投产前确认包装结构。" : homeEnglish.studio.title}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#626156]">
            {isZh
              ? "先检查面板关系、折叠顺序和材料层次，再进入独立 3D 展厅查看完整模型。"
              : homeEnglish.studio.body}
          </p>
          <Link href="/model-preview" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[.4rem] bg-[#18372e] px-5 text-sm font-black text-white transition hover:bg-[#102820]">
            <Rotate3D className="size-4" />
            {isZh ? "探索 3D 结构" : "Explore 3D structures"}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <Link href="/model-preview" aria-label={isZh ? "打开 3D 包装结构展厅" : "Open the 3D packaging structure studio"} className="kh-3d-technical group relative grid overflow-hidden border border-[#c9bea9] bg-[#ebe6dc] lg:grid-cols-[7fr_3fr]">
          <div className="kh-3d-technical__model relative min-h-0 overflow-hidden">
            <div className="kh-3d-technical__grid absolute inset-0" aria-hidden="true" />
            <div
              className="kh-structure-scene"
              role="img"
              aria-label={isZh ? "展示纸盒开合状态、面板、折线、内托和尺寸关系的结构示意" : "Structural diagram showing open and closed carton states, panels, folds, insert fit, and dimension relationships"}
            >
              <div className="kh-structure-closed" aria-hidden="true"><span /></div>
              <div className="kh-structure-open" aria-hidden="true">
                <span className="kh-structure-open__lid" />
                <span className="kh-structure-open__base" />
                <span className="kh-structure-open__insert" />
              </div>
              <span className="kh-3d-hotspot kh-3d-hotspot--panel">Panel</span>
              <span className="kh-3d-hotspot kh-3d-hotspot--fold">Fold</span>
              <span className="kh-3d-hotspot kh-3d-hotspot--insert">Insert</span>
              <div className="kh-3d-dimension kh-3d-dimension--width" aria-hidden="true"><span>Width</span></div>
              <div className="kh-3d-dimension kh-3d-dimension--depth" aria-hidden="true"><span>Depth</span></div>
            </div>
          </div>

          <div className="kh-3d-technical__detail flex flex-col border-t border-[#c9bea9] bg-[#162d27] text-white lg:border-l lg:border-t-0">
            <div className="kh-material-layers flex min-h-36 flex-1 flex-col justify-end border-b border-white/12 p-4">
              <div className="kh-material-layers__diagram" aria-hidden="true">
                <span className="kh-material-layers__liner" />
                <span className="kh-material-layers__flute" />
                <span className="kh-material-layers__liner" />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#f2d080]">
                <Layers3 className="size-4" />
                {isZh ? "材料层次" : "Material layers"}
              </p>
            </div>
            <div className="kh-3d-checks p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#f2d080]"><Box className="size-4" />Structure review</p>
              <ul className="mt-3 grid gap-2 text-xs font-semibold text-white/74">
                <li><span>01</span> Open and closed state</li>
                <li><span>02</span> Fold sequence</li>
                <li><span>03</span> Panel and insert fit</li>
                <li><span>04</span> Material layers</li>
              </ul>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-white">Open studio <ArrowRight className="size-4 text-[#f2d080] transition-transform group-hover:translate-x-1" /></span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
