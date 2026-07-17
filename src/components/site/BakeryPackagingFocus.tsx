import Image from "next/image";
import { CheckCircle2, Leaf, PackageCheck, Ruler, ShieldCheck } from "lucide-react";
import { getLocale } from "next-intl/server";
import { contact } from "@/data/company";
import { showcaseImages, visualText } from "@/data/visuals";

const bakeryProducts = [
  {
    title: { en: "Kraft cake boxes", zh: "牛皮蛋糕盒" },
    body: {
      en: "Natural kraft look for bakeries, delivery brands and wholesale pastry packaging.",
      zh: "适合烘焙门店、外卖品牌和批发糕点包装的自然牛皮质感。",
    },
    image: showcaseImages.webBakeryWindowBox,
    tags: ["Kraft", "Window option", "Low MOQ"],
  },
  {
    title: { en: "Paper cake boxes", zh: "白卡蛋糕盒" },
    body: {
      en: "Clean white-card structure for cakes, pastries, bakery sets and custom print.",
      zh: "白卡结构适合蛋糕、点心套装、烘焙礼盒和定制印刷。",
    },
    image: showcaseImages.webBakeryBlueBox,
    tags: ["White card", "Food liner", "Custom print"],
  },
  {
    title: { en: "Biodegradable bakery boxes", zh: "可降解烘焙盒" },
    body: {
      en: "Eco-positioned paper packaging for food brands that need sustainable sourcing.",
      zh: "面向强调环保采购的食品品牌，可突出可持续纸质包装方案。",
    },
    image: showcaseImages.webBakeryDisplayBox,
    tags: ["Eco paper", "FSC-ready", "Oil-proof"],
  },
  {
    title: { en: "Cupcake trays & inserts", zh: "杯子蛋糕内托" },
    body: {
      en: "Die-cut inserts and pads that keep desserts stable through pickup and delivery.",
      zh: "模切内托与纸垫，帮助甜品在自提和配送中保持稳定。",
    },
    image: showcaseImages.webBakeryCakeBox,
    tags: ["Die-cut", "Paper pad", "Stable delivery"],
  },
] as const;

const buyerChecks = [
  {
    icon: ShieldCheck,
    title: { en: "Food contact", zh: "食品接触" },
    body: { en: "Liner, grease resistance and clean packing are confirmed before sampling.", zh: "打样前确认内层、防油和清洁包装要求。" },
  },
  {
    icon: Ruler,
    title: { en: "Size system", zh: "尺寸体系" },
    body: { en: "Match cake height, window area, insert depth and delivery stack needs.", zh: "匹配蛋糕高度、窗口面积、内托深度和配送堆叠。" },
  },
  {
    icon: Leaf,
    title: { en: "Eco story", zh: "环保表达" },
    body: { en: "Kraft, recyclable board and biodegradable options can be quoted by project.", zh: "牛皮纸、可回收纸板和可降解方案可按项目报价。" },
  },
] as const;

export default async function BakeryPackagingFocus() {
  const locale = await getLocale();
  const message = encodeURIComponent(
    locale === "zh"
      ? "你好科宏，我想咨询烘焙/蛋糕纸质包装：蛋糕盒、开窗盒、牛皮盒或杯子蛋糕内托。"
      : "Hello Kehong, I would like a quotation for bakery paper packaging: cake boxes, window boxes, kraft boxes or cupcake inserts.",
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`;

  return (
    <section
      id="bakery"
      className="texture-ink relative scroll-mt-20 overflow-hidden bg-[#171713] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-18"
    >
      <div className="absolute inset-0">
        <Image
          src={showcaseImages.webBakeryWindowBox}
          alt="Bakery paper packaging samples"
          fill
          sizes="100vw"
          className="object-cover opacity-24"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,19,.96),rgba(23,23,19,.76)_46%,rgba(23,23,19,.94))]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:38px_38px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
              {locale === "zh" ? "烘焙包装方案" : "Bakery packaging solutions"}
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              {locale === "zh"
                ? "为蛋糕、点心和外卖配送选择合适的纸质包装。"
                : "Choose the right paper packaging for cakes, pastries and takeaway delivery."}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#f7f0df]/78">
              {locale === "zh"
                ? "重点关注食品接触、开窗展示、运输稳定和环保材料，帮助您更快确定包装方向。"
                : "Compare food contact, window display, delivery stability and sustainable paper options before choosing your packaging."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8c06c] px-5 py-3 text-sm font-black text-[#171713] transition hover:bg-[#f3d182]"
              >
                <PackageCheck className="size-4" />
                {locale === "zh" ? "咨询烘焙包装" : "Quote bakery packaging"}
              </a>
            </div>

            <div className="mt-8 grid gap-3">
              {buyerChecks.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title.en}
                    className="kh-panel grid grid-cols-[44px_1fr] gap-4 rounded-lg border border-white/12 bg-white/8 p-4 backdrop-blur-xl"
                  >
                    <span className="grid size-11 place-items-center rounded-md bg-[#e8c06c] text-[#171713]">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <strong className="block text-base font-black">
                        {visualText(item.title, locale)}
                      </strong>
                      <span className="mt-1 block text-sm leading-6 text-[#f7f0df]/68">
                        {visualText(item.body, locale)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {bakeryProducts.map((product, index) => (
              <article
                key={product.title.en}
                className={`premium-depth group overflow-hidden rounded-lg border border-white/12 bg-white/9 shadow-2xl shadow-black/18 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#e8c06c]/60 ${
                  index === 1 ? "sm:translate-y-8" : ""
                }`}
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={visualText(product.title, locale)}
                    fill
                    sizes="(min-width: 1024px) 340px, 90vw"
                    className="object-cover transition duration-200 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(23,23,19,.68))]" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black">
                      {visualText(product.title, locale)}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="line-clamp-2 text-sm leading-6 text-[#f7f0df]/72">
                    {visualText(product.body, locale)}
                  </p>
                  <div className="mt-5 grid gap-2">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="flex items-center gap-2 text-xs font-bold text-[#f7f0df]/80">
                        <CheckCircle2 className="size-3.5 text-[#e8c06c]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
