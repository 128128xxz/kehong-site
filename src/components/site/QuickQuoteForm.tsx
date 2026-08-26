"use client";

import { CheckCircle2, Send, Upload } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { appendAttribution, captureAttribution, trackKehongEvent } from "@/lib/attribution";
import { formatProductSkuSummary } from "@/lib/productPresentation";
import InquiryConsent from "@/components/site/InquiryConsent";
import InquiryContext, { hasProductContext, type InquirySeed } from "@/components/site/InquiryContext";

type ProductSeed = InquirySeed;

export default function QuickQuoteForm({ locale, initialProducts = [] }: { locale: string; initialProducts?: ProductSeed[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [storedProducts, setStoredProducts] = useState<ProductSeed[]>([]);
  const zh = locale === "zh";
  const copy = inquiryCopy[locale as keyof typeof inquiryCopy] ?? inquiryCopy.en;
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
    () => [...initialProducts, ...storedProducts].filter(hasProductContext).map((item) => [item.productGroupTitle ?? item.name, item.sku ? formatProductSkuSummary(item.sku, locale) : "", item.url].filter(Boolean).join(" | ")).filter(Boolean).join("\n"),
    [initialProducts, locale, storedProducts],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const interest = initialProducts.find((item) => item.interestId);
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (!String(data.get("name") ?? "").trim() || (!email && !phone) || (!String(data.get("products") ?? "").trim() && !interest?.interestId) || data.get("privacy") !== "on") {
      setError(copy.validation);
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const product = initialProducts.find(hasProductContext);
    if (interest?.interestId) data.set("interestId", interest.interestId);
    if (interest?.interestLabel) data.set("interestLabel", interest.interestLabel);
    if (interest?.interestProductType) data.set("interestProductType", interest.interestProductType);
    data.set("sourceUrl", window.location.href);
    data.set("productGroupId", product?.productGroupId ?? "");
    data.set("productGroupTitle", product?.productGroupTitle ?? product?.name ?? "");
    data.set("sku", product?.sku ?? "");
    data.set("skuTitle", product?.skuTitle ?? "");
    appendAttribution(data, "quick_quote", locale);
    try {
      const response = await fetch("/api/inquiry", { method: "POST", body: data });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; requestId?: string; error?: string; code?: string; status?: string } | null;
      const accepted = result?.status === "PROVIDER_ACCEPTED" || result?.code === "ACCEPTED" || result?.ok === true;
      if (!response.ok || !accepted) {
        throw new Error(result?.code ?? "inquiry_failed");
      }
      setRequestId(result.requestId ?? "");
      setStatus("success");
      trackKehongEvent("inquiry_submit", { locale, ctaLocation: "quick_quote", productGroupId: product?.productGroupId });
      form.reset();
    } catch (submissionError) {
      const code = submissionError instanceof Error ? submissionError.message : "inquiry_failed";
      setError(code === "EMAIL_NOT_CONFIGURED" ? copy.deliveryUnavailable : copy.deliveryFailed);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="text-(--kh-ink)" noValidate>
      <p className="kh-eyebrow">{zh ? "快速询盘" : "Quick quote"}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{zh ? "先提交基础需求" : "Start with the essentials"}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-(--kh-muted)">
        {zh ? "上传参考图或填写产品、尺寸和数量。技术细节可以随后补充。" : "Share a product, reference image, size and quantity now. Technical details can follow when you have them."}
      </p>
      <InquiryContext locale={locale} seeds={initialProducts} />
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={zh ? "产品 / 包装需求" : "Product or packaging requirement"} name="products" placeholder={zh ? "例如：蛋糕盒、纸杯扇形片或产品链接" : "e.g. cake box, cup fan or product link"} defaultValue={initialProductText} required={!initialProducts.some((item) => item.interestId)} wide />
        <FileField locale={locale} />
        <Field label={zh ? "尺寸" : "Size"} name="size" placeholder={zh ? "长 × 宽 × 高（如已知）" : "L × W × H, if known"} />
        <Field label={zh ? "预估数量" : "Estimated quantity"} name="quantity" placeholder={zh ? "例如：10,000 件" : "e.g. 10,000 pcs"} />
        <Field label={zh ? "目的地" : "Destination"} name="country" placeholder={zh ? "国家 / 城市" : "Country / city"} />
        <Field label={zh ? "姓名" : "Name"} name="name" placeholder={zh ? "您的姓名" : "Your name"} required />
        <Field label="Email" name="email" type="email" placeholder="name@company.com" />
        <Field label={zh ? "电话 / 微信（Email 二选一）" : "WhatsApp / phone (or email)"} name="phone" placeholder={zh ? "至少填写一种联系渠道" : "Add at least one contact channel"} />
      </div>
      <div className="mt-6 border-t border-(--kh-line) pt-4">
        <p className="text-sm font-semibold text-(--kh-forest)">{zh ? "补充技术信息" : "Advanced details"}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={zh ? "公司" : "Company"} name="company" placeholder={zh ? "公司名称（可选）" : "Company name (optional)"} />
          <Field label={zh ? "材料" : "Material"} name="material" placeholder={zh ? "纸材或纸板" : "Paper or board"} />
          <Field label="GSM" name="gsm" placeholder={zh ? "如已知" : "If known"} />
          <Field label={zh ? "印刷 / 后道" : "Print / finishing"} name="printing" placeholder={zh ? "如已知" : "If known"} />
          <Field label={zh ? "结构 / 工艺" : "Structure / process"} name="process" placeholder={zh ? "如已知" : "If known"} />
          <Field label={zh ? "目标交期" : "Target timing"} name="targetDate" placeholder={zh ? "如已知" : "If known"} />
          <Field label={zh ? "运输 / 目的地" : "Shipping / destination"} name="shipping" placeholder={zh ? "国家、城市或港口" : "Country, city or port"} />
          <Field label={zh ? "补充说明" : "Additional notes"} name="message" placeholder={zh ? "项目背景、交期等" : "Project background or timing"} wide />
        </div>
      </div>
      <InquiryConsent locale={locale} id="quick-quote-privacy" />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="kh-button kh-button-primary disabled:opacity-60">
          <Send className="size-4" />{status === "sending" ? (zh ? "发送中…" : "Sending…") : (zh ? "提交快速询盘" : "Send quick quote")}
        </button>
        <span className="text-xs leading-5 text-(--kh-muted)">{zh ? "后续可补充材质、结构、印刷和交期" : "Material, structure, print and timing can be added next."}</span>
      </div>
      {status === "success" ? <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="size-4" />{copy.success}{requestId ? ` · ${requestId}` : ""}</p> : null}
      {status === "error" ? <p className="mt-4 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">{error}</p> : null}
    </form>
  );
}

const inquiryCopy = {
  en: { validation: "Please add your name, an email or phone/WhatsApp contact, a product or request type, and privacy consent.", deliveryUnavailable: "Email delivery is not configured yet. Please use the direct email or phone shown on this page.", deliveryFailed: "We could not send the inquiry just now. Please check the details, retry, or use the direct email shown on this page.", success: "The email service accepted your inquiry. The team will follow up shortly." },
  zh: { validation: "请填写姓名、Email 或电话/微信、产品或服务需求，并同意隐私政策。", deliveryUnavailable: "当前邮件服务尚未配置，请使用页面上的 Email 或电话直接联系。", deliveryFailed: "暂时无法发送询盘，请检查内容后重试或使用页面上的 Email 联系。", success: "邮件服务已接收询盘，团队会尽快回复。" },
  id: { validation: "Isi nama, email atau telepon/WhatsApp, produk atau jenis permintaan, dan persetujuan privasi.", deliveryUnavailable: "Pengiriman email belum dikonfigurasi. Gunakan email atau telepon langsung di halaman ini.", deliveryFailed: "Pertanyaan belum dapat dikirim. Periksa detail, coba lagi, atau gunakan email langsung.", success: "Layanan email telah menerima pertanyaan Anda. Tim akan segera menindaklanjuti." },
  vi: { validation: "Vui lòng nhập tên, email hoặc điện thoại/WhatsApp, sản phẩm hoặc loại yêu cầu và đồng ý với chính sách riêng tư.", deliveryUnavailable: "Dịch vụ email chưa được cấu hình. Vui lòng dùng email hoặc điện thoại trực tiếp trên trang.", deliveryFailed: "Không thể gửi yêu cầu lúc này. Hãy kiểm tra, thử lại hoặc dùng email trực tiếp.", success: "Dịch vụ email đã nhận yêu cầu của bạn. Đội ngũ sẽ sớm phản hồi." },
  th: { validation: "กรุณากรอกชื่อ อีเมลหรือโทรศัพท์/WhatsApp ผลิตภัณฑ์หรือประเภทคำขอ และยอมรับนโยบายความเป็นส่วนตัว", deliveryUnavailable: "ยังไม่ได้ตั้งค่าการส่งอีเมล โปรดใช้ช่องทางอีเมลหรือโทรศัพท์โดยตรงบนหน้านี้", deliveryFailed: "ไม่สามารถส่งคำขอได้ โปรดตรวจสอบข้อมูลแล้วลองใหม่หรือใช้อีเมลโดยตรง", success: "บริการอีเมลได้รับคำขอของคุณแล้ว ทีมงานจะติดต่อกลับโดยเร็ว" },
  ms: { validation: "Sila isi nama, e-mel atau telefon/WhatsApp, produk atau jenis pertanyaan dan persetujuan privasi.", deliveryUnavailable: "Penghantaran e-mel belum dikonfigurasi. Gunakan e-mel atau telefon terus di halaman ini.", deliveryFailed: "Pertanyaan tidak dapat dihantar sekarang. Semak butiran, cuba lagi atau gunakan e-mel terus.", success: "Perkhidmatan e-mel telah menerima pertanyaan anda. Pasukan kami akan membuat susulan." },
} as const;

function Field({ label, name, placeholder, type = "text", defaultValue, required = false, wide = false }: { label: string; name: string; placeholder: string; type?: string; defaultValue?: string; required?: boolean; wide?: boolean }) {
  return <label className={`block text-sm font-semibold text-(--kh-muted) ${wide ? "sm:col-span-2" : ""}`}>{label}<input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder} className="kh-input mt-1 min-h-11 w-full px-3 py-2 text-sm text-(--kh-ink) outline-none" /></label>;
}

function FileField({ locale }: { locale: string }) {
  const zh = locale === "zh";
  return <label className="flex min-h-[5.25rem] items-center gap-3 rounded-md border border-dashed border-(--kh-brass)/55 bg-(--kh-paper) px-3 text-sm font-semibold text-(--kh-muted) sm:col-span-2"><Upload className="size-5 shrink-0 text-(--kh-brass)" /><span className="flex-1">{zh ? "参考图片、刀线图或需求文件" : "Reference image, dieline or brief"} <span className="font-normal">{zh ? "（可选）" : "(optional)"}</span></span><input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="max-w-[10.5rem] text-xs font-normal" /></label>;
}
