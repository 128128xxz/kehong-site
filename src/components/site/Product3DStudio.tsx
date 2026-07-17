"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Box,
  CakeSlice,
  Coffee,
  Donut,
  Layers3,
  MessageCircle,
  PackageOpen,
  Rotate3D,
  Sparkles,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { contact } from "@/data/company";
import { showcaseImages } from "@/data/visuals";

type ProductId = (typeof studioProducts)[number]["id"];

type StudioCopy = {
  en: string;
  zh: string;
};

const DesktopProduct3DStudio = dynamic(() => import("./Product3DStudioHeavy"), {
  ssr: false,
  loading: () => (
    <StaticProduct3DStudio
      activeId="pizza-box"
      mode="desktop-loading"
      onActiveChange={() => undefined}
    />
  ),
});

const studioPreviewImage = "/images/web/studio-pizza-preview.webp";

const studioProducts = [
  {
    id: "pizza-box",
    icon: PackageOpen,
    bg: showcaseImages.orinsFoodBoxReal,
    title: { en: "Pizza Box", zh: "披萨盒" },
    subtitle: {
      en: "Food-safe pizza box structure with liner, lid, vents and print face.",
      zh: "食品级披萨盒结构，包含内衬、盒盖、通风孔和印刷面。",
    },
  },
  {
    id: "cake-board",
    icon: CakeSlice,
    bg: showcaseImages.cakeBoardReal,
    title: { en: "Cake Board", zh: "蛋糕垫片" },
    subtitle: {
      en: "Metallic cake boards with paper core, raised rim and grease-proof surface.",
      zh: "金银蛋糕垫片，展示纸芯、边缘工艺和防油表面。",
    },
  },
  {
    id: "donut-box",
    icon: Donut,
    bg: showcaseImages.webDonutBoxes,
    title: { en: "Donut Box", zh: "甜甜圈盒" },
    subtitle: {
      en: "Bakery box with window film, tray walls and insert positions.",
      zh: "甜甜圈烘焙盒，展示透明开窗、托盘墙和内托定位。",
    },
  },
  {
    id: "paper-cup",
    icon: Coffee,
    bg: showcaseImages.webPaperCupStacks,
    title: { en: "Paper Cup", zh: "纸杯" },
    subtitle: {
      en: "Paper cup preview for sleeve, rim, coating and cup fan blank requirements.",
      zh: "纸杯预览，用于确认杯套、卷边、淋膜和扇形片需求。",
    },
  },
  {
    id: "honeycomb",
    icon: Layers3,
    bg: showcaseImages.webCorrugatedSheet,
    title: { en: "Honeycomb Paper", zh: "蜂窝纸卷" },
    subtitle: {
      en: "Cushioning roll and protective wrap material for export packaging.",
      zh: "蜂窝纸卷和缓冲包裹材料，适合出口包装防护。",
    },
  },
  {
    id: "display-box",
    icon: Box,
    bg: showcaseImages.webKraftGiftBox,
    title: { en: "Display Box", zh: "展示盒" },
    subtitle: {
      en: "Brand display boxes with finish options and retail presentation.",
      zh: "品牌展示盒，支持后道工艺和零售陈列效果。",
    },
  },
] as const;

function localized(copy: StudioCopy, locale: string) {
  return locale === "zh" ? copy.zh : copy.en;
}

function useDesktop3dPreference() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine)");

    const sync = () => setEnabled(query.matches);
    sync();

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }

    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  return enabled;
}

export default function Product3DStudio() {
  const desktop3dEnabled = useDesktop3dPreference();
  const [requested3d, setRequested3d] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<ProductId>("pizza-box");

  const enterStudio = useCallback(() => {
    setRequested3d(true);

    window.requestAnimationFrame(() => {
      const studio = document.getElementById("studio");
      if (!studio) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const y = studio.getBoundingClientRect().top + window.scrollY + Math.min(window.innerHeight * 0.32, 300);
      window.scrollTo({
        top: Math.max(0, y),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, []);

  useEffect(() => {
    const handleRequest = () => {
      if (desktop3dEnabled) enterStudio();
    };

    window.addEventListener("kehong:request-3d", handleRequest);
    return () => window.removeEventListener("kehong:request-3d", handleRequest);
  }, [desktop3dEnabled, enterStudio]);

  if (desktop3dEnabled && requested3d) {
    return <DesktopProduct3DStudio key={selectedProductId} autoStart initialProductId={selectedProductId} />;
  }

  return (
    <StaticProduct3DStudio
      activeId={selectedProductId}
      mode={desktop3dEnabled ? "desktop-idle" : "mobile"}
      onActiveChange={setSelectedProductId}
      onLoad3d={desktop3dEnabled ? enterStudio : undefined}
    />
  );
}

function StaticProduct3DStudio({
  activeId,
  mode,
  onActiveChange,
  onLoad3d,
}: {
  activeId: ProductId;
  mode: "mobile" | "desktop-idle" | "desktop-loading";
  onActiveChange: (id: ProductId) => void;
  onLoad3d?: () => void;
}) {
  const locale = useLocale();
  const isZh = locale === "zh";
  const isMobileMode = mode === "mobile";
  const active = useMemo(
    () => studioProducts.find((product) => product.id === activeId) ?? studioProducts[0],
    [activeId],
  );
  const quoteMessage = encodeURIComponent(
    `${isZh ? "你好科宏，我想咨询这个包装产品：" : "Hello Kehong, I would like to discuss this packaging product:"}
- ${localized(active.title, locale)}
- ${localized(active.subtitle, locale)}`,
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${quoteMessage}`;

  return (
    <section
      id="studio"
      data-3d-loading="on-demand"
      data-3d-mobile-fallback="static"
      className="texture-ink relative isolate -mt-10 overflow-hidden bg-[#171713] px-4 pb-16 pt-14 text-white sm:-mt-12 sm:px-6 sm:pt-20 lg:mt-0 lg:px-8 lg:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-18"
          style={{ backgroundImage: `url(${active.bg})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,19,.97),rgba(37,36,30,.82)_46%,rgba(23,23,19,.96)),linear-gradient(180deg,rgba(23,23,19,.68),rgba(23,23,19,.94))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#e8c06c]">
              <Sparkles className="size-4" />
              {isZh ? "产品结构预览" : "Product structure preview"}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              {isZh
                ? "通过产品预览确认结构、材质与应用方向。"
                : "Review structure, material and application options before requesting a quotation."}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/64">
            {mode === "desktop-loading"
              ? isZh
                ? "正在加载 3D 预览，请稍候。"
                : "Loading the 3D preview."
              : mode === "desktop-idle"
                ? isZh
                  ? "点击产品卡片，即可查看更详细的 3D 结构。"
                  : "Select a product to open the detailed 3D view."
                : isZh
                  ? "通过静态预览了解产品结构；桌面端可进一步查看 3D 细节。"
                  : "Use the static preview to review the structure, then open the detailed 3D view on desktop."}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:items-stretch">
          <div className={`${isMobileMode ? "order-2 flex snap-x gap-2 overflow-x-auto pb-1" : "grid content-start gap-2 rounded-lg border border-white/12 bg-white/8 p-3"}`}>
            {studioProducts.map((product) => {
              const Icon = product.icon;
              const isActive = product.id === active.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  aria-pressed={isActive}
                  onPointerEnter={() => onActiveChange(product.id)}
                  onFocus={() => onActiveChange(product.id)}
                  onClick={() => onActiveChange(product.id)}
                  className={`${isMobileMode ? "min-h-11 shrink-0 rounded-full px-4 py-2 text-xs" : "min-h-12 rounded-md px-3 py-2 text-left text-sm"} border font-black transition-colors ${
                    isActive
                      ? "border-[#e8c06c]/70 bg-[#e8c06c] text-[#171713]"
                      : "border-white/12 bg-white/6 text-[#f7f0df]/78 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0" />
                    {localized(product.title, locale)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="studioCanvasWrap premium-depth relative order-1 min-h-[460px] overflow-hidden rounded-lg border border-[#d9d2be]/78 bg-[#f6f4ec] shadow-xl sm:min-h-[600px] lg:min-h-[660px]">
            <Image
              src={studioPreviewImage}
              alt={isZh ? "纸品包装结构静态预览" : "Paper packaging structure static preview"}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 68vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,23,19,0),rgba(23,23,19,.34))]" />
            <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-start justify-between gap-3">
              <div className="rounded-full border border-black/8 bg-white/78 px-3 py-2 text-[#171713] shadow-lg shadow-black/8">
                <span className="text-xs font-black text-[#9a6b1f]">
                  {mode === "desktop-loading"
                    ? isZh
                      ? "正在加载 3D"
                      : "Loading 3D"
                    : mode === "desktop-idle"
                      ? isZh
                        ? "点击查看 3D"
                        : "Click for 3D"
                      : isZh
                        ? "产品预览"
                        : "Product preview"}
                </span>
                <span className="ml-2 text-xs font-black">{localized(active.title, locale)}</span>
              </div>
              {onLoad3d ? (
                <button
                  type="button"
                  onClick={onLoad3d}
                  className="hidden min-h-10 items-center gap-2 rounded-full border border-black/8 bg-[#171713] px-4 text-xs font-black text-white shadow-xl shadow-black/14 transition hover:-translate-y-0.5 hover:bg-[#2b2b24] lg:inline-flex"
                >
                  <Rotate3D className="size-4 text-[#e8c06c]" />
                  {isZh ? "查看 3D 细节" : "View 3D details"}
                </button>
              ) : null}
            </div>
            <div className="pointer-events-none absolute left-5 top-20 z-10 hidden max-w-[260px] rounded-lg border border-white/45 bg-white/76 p-3 text-[#171713] shadow-xl shadow-black/12 backdrop-blur-xl lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a6b1f]">
                {isZh ? "3D 查看方式" : "3D viewing"}
              </p>
              <div className="mt-2 grid gap-1 text-xs font-bold leading-5 text-[#4c4b43]/76">
                <span>{isZh ? "点击查看 3D 细节" : "Click to view 3D details"}</span>
                <span>{isZh ? "拖拽旋转 · 滚轮缩放" : "Drag rotate · wheel zoom"}</span>
                <span>{isZh ? "切换产品、结构和展示效果" : "Switch products, layers and presentation"}</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 rounded-lg border border-white/55 bg-white/90 p-4 text-[#171713] shadow-xl shadow-black/18">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a6b1f]">
                {isZh ? "产品详情" : "Product details"}
              </p>
              <h3 className="mt-1 text-lg font-black">{localized(active.title, locale)}</h3>
              <p className="mt-2 text-sm leading-6 text-[#4c4b43]/76">
                {localized(active.subtitle, locale)}
              </p>
              {onLoad3d ? (
                <button
                  type="button"
                  onClick={onLoad3d}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#e8c06c] px-5 text-sm font-black text-[#171713]"
                >
                  <Sparkles className="size-4" />
                  {isZh ? "在 3D 中查看" : "View in 3D"}
                </button>
              ) : null}
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white"
              >
                <MessageCircle className="size-4 text-[#e8c06c]" />
                {isZh ? "咨询此产品" : "Discuss this product"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
