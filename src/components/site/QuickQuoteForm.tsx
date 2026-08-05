"use client";

import { CheckCircle2, Send, Upload } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { appendAttribution, captureAttribution, trackKehongEvent } from "@/lib/attribution";

type ProductSeed = { productGroupId?: string; productGroupTitle?: string; sku?: string; skuTitle?: string; name?: string; url?: string; interestId?: string; interestLabel?: string; interestProductType?: string };

export default function QuickQuoteForm({ locale, initialProducts = [] }: { locale: string; initialProducts?: ProductSeed[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [storedProducts, setStoredProducts] = useState<ProductSeed[]>([]);
  const zh = locale === "zh";
  useEffect(() => {
    captureAttribution();
    try {
      const raw = window.sessionStorage.getItem("kehong-selected-products");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate optional cross-route selection once.
      if (raw) setStoredProducts(JSON.parse(raw) as ProductSeed[]);
    } catch {
      // Product selection is an optional convenience, never a form dependency.
    }
  }, []);
  const initialProductText = useMemo(
    () => [...initialProducts, ...storedProducts].map((item) => [item.productGroupTitle ?? item.name, item.sku ? `Current SKU: ${item.sku}` : "", item.url].filter(Boolean).join(" | ")).filter(Boolean).join("\n"),
    [initialProducts, storedProducts],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!String(data.get("name") ?? "").trim() || !String(data.get("email") ?? "").trim() || !String(data.get("products") ?? "").trim() || data.get("privacy") !== "on") {
      setError(zh ? "请填写姓名、邮箱、产品需求并同意隐私政策。" : "Please add your name, email, packaging requirement and privacy consent.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const interest = initialProducts.find((item) => item.interestId) ?? initialProducts[0];
    if (interest?.interestId) data.set("interestId", interest.interestId);
    if (interest?.interestLabel) data.set("interestLabel", interest.interestLabel);
    if (interest?.interestProductType) data.set("interestProductType", interest.interestProductType);
    data.set("sourceUrl", window.location.href);
    data.set("productGroupId", interest?.productGroupId ?? "");
    data.set("productGroupTitle", interest?.productGroupTitle ?? interest?.name ?? "");
    data.set("sku", interest?.sku ?? "");
    data.set("skuTitle", interest?.skuTitle ?? "");
    appendAttribution(data, "quick_quote", locale);
    try {
      const response = await fetch("/api/inquiry", { method: "POST", body: data });
      if (!response.ok) throw new Error("inquiry_failed");
      setStatus("success");
      trackKehongEvent("inquiry_submit", { locale, ctaLocation: "quick_quote", productGroupId: interest?.productGroupId });
      form.reset();
    } catch {
      setError(zh ? "暂时无法发送询盘，请稍后重试或使用页面上的邮箱联系。" : "We could not send the inquiry just now. Please retry or use the email shown on this page.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="text-(--kh-ink)" noValidate>
      <p className="kh-eyebrow">{zh ? "快速询盘" : "Quick quote"}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{zh ? "先提交基础需求。" : "Start with the essentials."}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-(--kh-muted)">
        {zh ? "上传参考图或填写产品、尺寸和数量；技术细节可以随后补充。" : "Share a product, reference image, size and quantity now. Technical details can follow when you have them."}
      </p>
      {initialProducts.some((item) => item.interestLabel || item.productGroupTitle || item.name || item.sku) ? <p className="mt-3 rounded-md bg-(--kh-paper) px-3 py-2 text-sm font-semibold text-(--kh-forest)">{zh ? "已选产品方向：" : "Selected product direction: "}{initialProducts.find((item) => item.interestLabel || item.productGroupTitle || item.name)?.interestLabel ?? initialProducts.find((item) => item.productGroupTitle)?.productGroupTitle ?? initialProducts.find((item) => item.name)?.name ?? initialProducts.find((item) => item.sku)?.sku}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={zh ? "产品 / 包装需求" : "Product or packaging requirement"} name="products" placeholder={zh ? "例如：蛋糕盒、纸杯扇形片或产品链接" : "e.g. cake box, cup fan or product link"} defaultValue={initialProductText} required wide />
        <FileField locale={locale} />
        <Field label={zh ? "尺寸" : "Size"} name="size" placeholder={zh ? "长 × 宽 × 高（如已知）" : "L × W × H, if known"} />
        <Field label={zh ? "预估数量" : "Estimated quantity"} name="quantity" placeholder={zh ? "例如：10,000 件" : "e.g. 10,000 pcs"} />
        <Field label={zh ? "目的地" : "Destination"} name="country" placeholder={zh ? "国家 / 城市" : "Country / city"} />
        <Field label={zh ? "姓名" : "Name"} name="name" placeholder={zh ? "您的姓名" : "Your name"} required />
        <Field label="Email" name="email" type="email" placeholder="name@company.com" required />
        <Field label="WhatsApp" name="phone" placeholder={zh ? "可选" : "Optional"} />
      </div>
      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-(--kh-muted)">
        <input name="privacy" type="checkbox" className="mt-0.5 size-4 accent-(--kh-forest)" required />
        <span>{zh ? <>我同意科宏纸品根据<Link href="/privacy" className="kh-inline-link">隐私政策</Link>处理我提交的信息，以便回复本次询盘。</> : <>I agree that Kehong may process this inquiry under the <Link href="/privacy" className="kh-inline-link">Privacy Policy</Link>.</>}</span>
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="kh-button kh-button-primary disabled:opacity-60">
          <Send className="size-4" />{status === "sending" ? (zh ? "发送中…" : "Sending…") : (zh ? "提交快速询盘" : "Send quick quote")}
        </button>
        <span className="text-xs leading-5 text-(--kh-muted)">{zh ? "后续可补充材质、结构、印刷和交期。" : "Material, structure, print and timing can be added next."}</span>
      </div>
      {status === "success" ? <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="size-4" />{zh ? "询盘已接收，团队会尽快回复。" : "Your inquiry was received. The team will follow up shortly."}</p> : null}
      {status === "error" ? <p className="mt-4 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">{error}</p> : null}
    </form>
  );
}

function Field({ label, name, placeholder, type = "text", defaultValue, required = false, wide = false }: { label: string; name: string; placeholder: string; type?: string; defaultValue?: string; required?: boolean; wide?: boolean }) {
  return <label className={`block text-sm font-semibold text-(--kh-muted) ${wide ? "sm:col-span-2" : ""}`}>{label}<input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder} className="kh-input mt-1 min-h-11 w-full px-3 py-2 text-sm text-(--kh-ink) outline-none" /></label>;
}

function FileField({ locale }: { locale: string }) {
  const zh = locale === "zh";
  return <label className="flex min-h-[5.25rem] items-center gap-3 rounded-md border border-dashed border-(--kh-brass)/55 bg-(--kh-paper) px-3 text-sm font-semibold text-(--kh-muted) sm:col-span-2"><Upload className="size-5 shrink-0 text-(--kh-brass)" /><span className="flex-1">{zh ? "参考图片、刀线图或需求文件" : "Reference image, dieline or brief"} <span className="font-normal">{zh ? "（可选）" : "(optional)"}</span></span><input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="max-w-[10.5rem] text-xs font-normal" /></label>;
}
