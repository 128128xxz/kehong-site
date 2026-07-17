"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { contact } from "@/data/company";
import { solutionScenes, visualText } from "@/data/visuals";

type SolutionSceneId = (typeof solutionScenes)[number]["id"];

export default function SolutionExplorer() {
  const locale = useLocale();
  const [activeId, setActiveId] = useState<SolutionSceneId>(solutionScenes[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    contact: "",
    quantity: "",
    note: "",
  });
  const active = solutionScenes.find((scene) => scene.id === activeId) ?? solutionScenes[0];
  const isZh = locale === "zh";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = encodeURIComponent(
      `${isZh ? "你好科宏，我想咨询这个包装方案：" : "Hello Kehong, I would like to discuss this packaging solution:"}
- ${visualText(active.title, locale)}
- ${visualText(active.body, locale)}
- Name: ${form.name || "-"}
- Company: ${form.company || "-"}
- Contact: ${form.contact || "-"}
- Quantity: ${form.quantity || "-"}
- Notes: ${form.note || "-"}`,
    );
    window.open(
      `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSubmitted(true);
  };

  return (
    <section
      id="solutions"
      className="texture-paper scroll-mt-20 overflow-hidden bg-[#f6f4ec] px-4 py-16 sm:px-6 lg:px-8 lg:py-18"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#b47b18]">
              {isZh ? "包装解决方案" : "Packaging solutions"}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#171713] sm:text-5xl">
              {locale === "zh"
                ? "像逛展厅一样，先选场景，再进入产品。"
                : "Choose a packaging application, then explore the right products."}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-[#626156]">
            {locale === "zh"
              ? "从食品、零售到纸材应用，按用途、材质、工艺和交付要求选择合适的方向。"
              : "Start with the application, then compare material, finishing and delivery requirements."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <div className="grid content-start gap-3">
            {solutionScenes.map((scene) => {
              const isActive = scene.id === active.id;

              return (
                <button
                  key={scene.id}
                  type="button"
                  onMouseEnter={() => setActiveId(scene.id)}
                  onPointerEnter={() => setActiveId(scene.id)}
                  onFocus={() => setActiveId(scene.id)}
                  onClick={() => {
                    setActiveId(scene.id);
                    setSubmitted(false);
                  }}
                  aria-pressed={isActive}
                  className={`group kh-panel rounded-lg border p-4 text-left transition ${
                    isActive
                      ? "border-[#171713] bg-[#171713] text-white shadow-xl shadow-[#171713]/20"
                      : "border-[#d9d2be] bg-white/88 text-[#171713] hover:-translate-y-0.5 hover:border-[#171713]/50"
                  }`}
                >
                  <span
                    className="mb-4 block h-1.5 w-12 rounded-full"
                    style={{ backgroundColor: scene.accent }}
                  />
                  <span className="text-lg font-black">
                    {visualText(scene.title, locale)}
                  </span>
                  <span className={`mt-2 block line-clamp-2 text-sm leading-6 ${isActive ? "text-[#f7f0df]/76" : "text-[#626156]"}`}>
                    {visualText(scene.body, locale)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="premium-depth grid overflow-hidden rounded-lg border border-[#d9d2be] bg-white shadow-2xl shadow-[#171713]/12 lg:grid-cols-[.98fr_1.02fr]">
            <div className="relative min-h-[430px] overflow-hidden">
              <Image
                key={active.image}
                src={active.image}
                alt={visualText(active.title, locale)}
                fill
                sizes="(min-width: 1024px) 48vw, 90vw"
                className="object-cover transition duration-300 md:animate-kenburns-subtle"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(23,23,19,.45))]" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {active.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/18 bg-white/16 px-3 py-1.5 text-[11px] font-black text-white shadow-lg shadow-black/12 backdrop-blur-xl"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#b47b18]">
                {isZh ? "当前方案" : "Selected solution"}
              </p>
              <h3 className="mt-4 text-3xl font-black leading-tight text-[#171713]">
                {visualText(active.title, locale)}
              </h3>
              <p className="mt-4 line-clamp-3 text-base leading-8 text-[#626156]">
                {visualText(active.body, locale)}
              </p>
              <div className="mt-6 grid gap-3">
                {active.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-3 rounded-md border border-[#d9d2be] bg-[#fbfaf5] px-3 py-2 text-sm font-semibold text-[#171713]">
                    <CheckCircle2 className="size-4 text-[#b47b18]" />
                    {tag}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="kh-panel mt-7 rounded-lg border border-[#d9d2be] bg-[#f6f4ec] p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-black text-[#171713]">
                    {isZh ? "咨询这个方案" : "Discuss this solution"}
                  </p>
                  <span className="kh-status-dot inline-flex items-center gap-2 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a6b1f]">
                    {isZh ? "可立即咨询" : "Ready to discuss"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                    placeholder={isZh ? "姓名" : "Name"}
                    className="kh-input h-11 rounded-md px-3 text-sm font-semibold text-[#171713] outline-none"
                  />
                  <input
                    value={form.company}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, company: event.target.value }))
                    }
                    placeholder={isZh ? "公司 / 品牌" : "Company / brand"}
                    className="kh-input h-11 rounded-md px-3 text-sm font-semibold text-[#171713] outline-none"
                  />
                  <input
                    value={form.contact}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contact: event.target.value }))
                    }
                    required
                    placeholder={isZh ? "微信 / WhatsApp / 邮箱" : "WeChat / WhatsApp / Email"}
                    className="kh-input h-11 rounded-md px-3 text-sm font-semibold text-[#171713] outline-none sm:col-span-2"
                  />
                  <input
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, quantity: event.target.value }))
                    }
                    placeholder={isZh ? "预计数量，例如 3000" : "Estimated qty, e.g. 3000"}
                    className="kh-input h-11 rounded-md px-3 text-sm font-semibold text-[#171713] outline-none sm:col-span-2"
                  />
                  <textarea
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, note: event.target.value }))
                    }
                    placeholder={
                      isZh
                        ? "尺寸、材质、印刷颜色、交期或目标市场"
                        : "Size, material, print colors, lead time or target market"
                    }
                    className="kh-input min-h-24 rounded-md px-3 py-3 text-sm font-semibold text-[#171713] outline-none sm:col-span-2"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171713] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2b2b24]"
                  >
                    <Send className="size-4" />
                    {isZh ? "提交并联系" : "Send inquiry"}
                  </button>
                </div>

                {submitted ? (
                  <p className="mt-3 text-sm font-semibold text-[#171713]">
                    {isZh
                      ? "已打开 WhatsApp。如未自动打开，请点击页面右侧的联系入口。"
                      : "WhatsApp has opened. If it does not open automatically, use the contact button on the right."}
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
