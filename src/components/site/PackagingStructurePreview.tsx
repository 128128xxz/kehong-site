"use client";

import { Eye, PackageOpen } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { buildInquiryContactHref } from "@/lib/inquiryContext";
import { r2Models, r2PackagingRoutes } from "@/data/r2Models";
import R2ModelViewer from "@/components/site/R2ModelViewer";

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="kh-panel p-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--kh-brass)">{label}</p><p className="mt-1 text-sm font-semibold text-(--kh-ink)">{value}</p></div>;
}

export default function PackagingStructurePreview({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const [selectedId, setSelectedId] = useState(r2Models[1].id);
  const model = r2Models.find((item) => item.id === selectedId) ?? r2Models[1];

  return <main className="texture-paper min-h-screen px-4 py-8 text-(--kh-ink) sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="kh-mono mb-5 flex flex-wrap items-center gap-2 text-xs text-(--kh-muted)"><Link href="/">{zh ? "首页" : "Home"}</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-(--kh-ink)">{zh ? "3D结构展厅" : "3D Packaging Studio"}</span></nav>
    <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
      <aside className="kh-panel premium-depth p-4 sm:p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-(--kh-ink) text-(--kh-brass-soft)"><PackageOpen className="size-5" /></span><div><p className="kh-eyebrow">{zh ? "3D包装工具" : "3D Packaging Tool"}</p><h1 className="text-2xl font-semibold sm:text-3xl">{zh ? "3D结构展厅" : "3D Packaging Studio"}</h1></div></div>
        <p className="mt-4 text-sm leading-7 text-(--kh-muted)">{zh ? "按需加载包装结构模型，在打样前查看开启方式、装配关系与比例。" : "Load one packaging structure at a time to review opening, assembly and proportions before sampling."}</p>
        <label htmlFor="r2-model-select" className="mt-6 block text-xs font-semibold uppercase tracking-[0.14em] text-(--kh-brass)">{zh ? "选择结构" : "Select a structure"}</label>
        <select id="r2-model-select" value={model.id} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-(--kh-line) bg-(--kh-paper) px-3 text-sm font-semibold text-(--kh-ink) lg:hidden">{r2Models.map((item) => <option key={item.id} value={item.id}>{zh ? item.title.zh : item.title.en}</option>)}</select>
        <div className="mt-2 hidden max-h-[380px] gap-2 overflow-y-auto pr-1 lg:grid" aria-label={zh ? "结构列表" : "Structure list"}>{r2Models.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={item.id === model.id} className={`rounded-md border px-3 py-2 text-left text-sm transition ${item.id === model.id ? "border-(--kh-brass) bg-(--kh-brass-soft)/30" : "border-(--kh-line) bg-(--kh-paper) hover:border-(--kh-brass)/70"}`}><span className="block font-semibold">{zh ? item.title.zh : item.title.en}</span><span className="mt-1 block text-xs leading-5 text-(--kh-muted)">{zh ? item.description.zh : item.description.en}</span></button>)}</div>
        <dl className="mt-6 space-y-4 border-t border-(--kh-line) pt-5 text-sm leading-6 text-(--kh-muted)"><div><dt className="font-semibold text-(--kh-ink)">{zh ? "当前模型" : "Current model"}</dt><dd>{zh ? model.title.zh : model.title.en}</dd></div><div><dt className="font-semibold text-(--kh-ink)">{zh ? "查看重点" : "Review focus"}</dt><dd>{zh ? model.description.zh : model.description.en}</dd></div></dl>
        <Link href={buildInquiryContactHref({ interest: "structure-review" })} className="kh-button kh-button-primary mt-6 w-full">{zh ? "申请结构/刀线评审" : "Request a structure / dieline review"}</Link>
      </aside>
      <section className="premium-depth overflow-hidden rounded-lg texture-ink"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 px-4 py-3 text-white"><div className="flex items-center gap-2"><Eye className="size-4 text-(--kh-brass-soft)" /><span className="text-sm font-semibold">{zh ? "R2 包装结构查看" : "R2 packaging structure viewer"}</span></div><span className="text-xs text-white/65">{zh ? "一次加载一个模型" : "One model loaded at a time"}</span></div><R2ModelViewer key={model.id} model={model} zh={zh} /></section>
    </section>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><InfoCard label={zh ? "结构范围" : "Structure range"} value={zh ? "蛋糕、化妆品、邮寄盒、食品包装" : "Cake, cosmetic, mailer and food packaging"} /><InfoCard label={zh ? "交互" : "Interaction"} value={zh ? "旋转、缩放、查看比例" : "Rotate, zoom and inspect proportions"} /><InfoCard label={zh ? "下一步" : "Next step"} value={zh ? "提交尺寸、图纸或参考样品" : "Share dimensions, drawings or a reference sample"} /></section>
    <section className="mt-12 border-t border-(--kh-line) pt-8" aria-labelledby="r2-route-links-title"><p className="kh-eyebrow">{zh ? "关联成品包装" : "Finished packaging routes"}</p><h2 id="r2-route-links-title" className="mt-2 text-2xl font-semibold">{zh ? "从结构参考进入对应包装页面" : "Continue to the matching packaging route"}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{r2PackagingRoutes.map((route) => <Link key={route.href} href={route.href} className="kh-panel group p-4 transition hover:-translate-y-0.5 hover:border-(--kh-brass)"><span className="text-sm font-semibold">{zh ? route.zh : route.en}</span><span className="mt-2 block text-xs text-(--kh-muted)">{zh ? "查看成品包装范围" : "View finished packaging scope"}<span aria-hidden="true" className="ml-2">→</span></span></Link>)}</div></section>
  </div></main>;
}
