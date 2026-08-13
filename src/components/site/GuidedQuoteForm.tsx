"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, MessageCircle, Phone, Send, Upload } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { companyDisplayName, contact } from "@/data/company";
import { appendAttribution, captureAttribution, trackKehongEvent } from "@/lib/attribution";
import { formatProductSkuSummary } from "@/lib/productPresentation";
import InquiryConsent from "@/components/site/InquiryConsent";
import InquiryContext, { hasProductContext, type InquirySeed } from "@/components/site/InquiryContext";
import WeChatContactButton from "@/components/site/WeChatContactButton";

type ProductSeed = InquirySeed;
type GuidedQuoteFormProps = { locale: string; initialProducts?: ProductSeed[] };

const copy = {
  en: {
    eyebrow: "Request a quote", title: "Guided packaging quote", intro: "Move through the project brief step by step. Your entries stay on the form while you review each stage.",
    steps: ["Project", "Size & quantity", "Material & structure", "Printing & finish", "Delivery & contact"],
    next: "Continue", back: "Back", submit: "Submit inquiry", sending: "Sending…", success: "Your inquiry was accepted. The Kehong team will follow up shortly.", error: "The inquiry could not be submitted. Check the required fields and try again.", required: "Complete the required fields and accept the privacy policy.", whatsapp: "Continue on WhatsApp", progress: "Quote progress",
    project: "Project", packagingType: "Packaging type", packagingPlaceholder: "Cake box, mailer, bag…", industry: "Product / industry", industryPlaceholder: "Bakery, retail, e-commerce…", use: "Use", usePlaceholder: "Retail / takeaway / shipping", unsure: "If unsure", unsurePlaceholder: "What are you packing?", products: "Products or SKUs", productsPlaceholder: "Product name, SKU or reference",
    size: "Size & quantity", dimensionType: "Internal or external dimensions", dimensionTypePlaceholder: "Internal / external", dimensions: "Length × width × height", dimensionsPlaceholder: "e.g. 20 × 15 × 8 cm", quantity: "Quantity", quantityPlaceholder: "Estimated quantity", repeat: "Repeat frequency", repeatPlaceholder: "One-off / repeat / seasonal", orderDate: "Target order date", deliveryDate: "Required delivery date", known: "If known",
    material: "Material & structure", preferredMaterial: "Preferred material", preferredMaterialPlaceholder: "Paper, board, corrugated…", board: "Board / flute / paper type", structure: "Box style / structure", structurePlaceholder: "Mailer, carton, tray…", features: "Window / handle / insert / divider", featuresPlaceholder: "Optional features", recommend: "Recommend for me", recommendPlaceholder: "Product and priorities",
    print: "Printing & finish", colors: "Printing colors", colorsPlaceholder: "CMYK / Pantone / reference", printSide: "Inside or outside printing", printSidePlaceholder: "Outside / inside / both", finish: "Lamination / foil / emboss / coating", finishPlaceholder: "Finish requirement", artwork: "Artwork readiness", artworkPlaceholder: "Ready / in progress / unsure", upload: "Artwork or reference file", uploadNote: "File upload status is shown by the browser. Large or unsupported files may need to be shared after the first inquiry.",
    delivery: "Delivery & contact", destination: "Destination country / postal code", shipping: "Shipping preference / Incoterm", company: "Company", companyPlaceholder: "Company name", name: "Name", namePlaceholder: "Your name", email: "Email", phone: "Phone / WhatsApp", optional: "Optional", notes: "Notes", notesPlaceholder: "Lead time, destination or other project notes", privacyPrefix: `I agree that ${companyDisplayName.en} may process this inquiry according to the`, privacy: "Privacy Policy", privacySuffix: ".",
  },
  zh: {
    eyebrow: "提交询价", title: "分步骤提交项目需求", intro: "按项目阶段填写信息，前后切换不会丢失当前内容。",
    steps: ["项目概况", "尺寸与数量", "材料与结构", "印刷与后处理", "交付与联系信息"],
    next: "下一步", back: "上一步", submit: "提交询价", sending: "提交中…", success: "询盘已接收，科宏团队会尽快跟进。", error: "提交失败，请检查必填项后重试。", required: "请完成必填项并同意隐私政策。", whatsapp: "微信咨询", progress: "询价进度",
    project: "项目概况", packagingType: "包装类型", packagingPlaceholder: "例如：蛋糕盒、邮寄盒、纸袋", industry: "产品 / 行业", industryPlaceholder: "例如：烘焙、零售、电商", use: "使用场景", usePlaceholder: "零售 / 外带 / 运输", unsure: "暂不确定", unsurePlaceholder: "您要包装什么产品？", products: "产品或 SKU", productsPlaceholder: "产品名称、SKU 或参考信息",
    size: "尺寸与数量", dimensionType: "内尺寸或外尺寸", dimensionTypePlaceholder: "内尺寸 / 外尺寸", dimensions: "长 × 宽 × 高", dimensionsPlaceholder: "例如：20 × 15 × 8 cm", quantity: "数量", quantityPlaceholder: "预计采购数量", repeat: "采购频率", repeatPlaceholder: "一次性 / 常规 / 季节性", orderDate: "计划下单日期", deliveryDate: "期望交付日期", known: "如已知",
    material: "材料与结构", preferredMaterial: "偏好材料", preferredMaterialPlaceholder: "纸张、纸板、瓦楞纸…", board: "纸板 / 坑型 / 纸张类型", structure: "盒型 / 结构", structurePlaceholder: "邮寄盒、折叠盒、托盘…", features: "开窗 / 提手 / 内托 / 隔板", featuresPlaceholder: "可选功能", recommend: "需要我们推荐", recommendPlaceholder: "您的产品与优先事项",
    print: "印刷与后处理", colors: "印刷颜色", colorsPlaceholder: "CMYK / Pantone / 参考图", printSide: "内侧或外侧印刷", printSidePlaceholder: "外侧 / 内侧 / 双面", finish: "覆膜 / 烫印 / 压纹 / 涂层", finishPlaceholder: "后处理要求", artwork: "设计文件状态", artworkPlaceholder: "已准备 / 制作中 / 暂不确定", upload: "设计文件或参考资料（可选）", uploadNote: "浏览器会显示文件选择状态。较大或不支持的文件可在首次询盘后补充。",
    delivery: "交付与联系信息", destination: "目的国家 / 邮编", shipping: "运输方式 / 贸易术语", company: "公司", companyPlaceholder: "公司名称", name: "姓名", namePlaceholder: "您的姓名", email: "Email", phone: "电话", optional: "可选", notes: "备注", notesPlaceholder: "交期、目的地或其他项目说明", privacyPrefix: `我同意${companyDisplayName.zh}根据`, privacy: "隐私政策", privacySuffix: "处理我提交的信息，以便回复本次询盘",
  },
} as const;

export default function GuidedQuoteForm({ locale, initialProducts = [] }: GuidedQuoteFormProps) {
  const zh = locale === "zh";
  const text = zh ? copy.zh : copy.en;
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [storedProducts, setStoredProducts] = useState<ProductSeed[]>([]);
  useEffect(() => {
    captureAttribution();
    try {
      const raw = window.sessionStorage.getItem("kehong-selected-products");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate optional cross-route selection once.
      if (raw) setStoredProducts(JSON.parse(raw) as ProductSeed[]);
    } catch { /* storage is optional */ }
  }, []);
  const initialProductText = useMemo(() => [...initialProducts, ...storedProducts].filter(hasProductContext).map((item) => [item.productGroupTitle ?? item.name, item.sku ? formatProductSkuSummary(item.sku, locale) : "", item.url].filter(Boolean).join(" | ")).filter(Boolean).join("\n"), [initialProducts, locale, storedProducts]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const productText = String(data.get("products") ?? "").trim();
    const interest = initialProducts.find((item) => item.interestId);
    if (!String(data.get("name") ?? "").trim() || !String(data.get("email") ?? "").trim() || (!productText && !interest?.interestId) || data.get("privacy") !== "on") { setError(text.required); setStatus("error"); setStep(4); return; }
    setStatus("sending"); setError("");
    try { const product = initialProducts.find(hasProductContext); if (interest?.interestId) data.set("interestId", interest.interestId); if (interest?.interestLabel) data.set("interestLabel", interest.interestLabel); if (interest?.interestProductType) data.set("interestProductType", interest.interestProductType); data.set("productGroupId", product?.productGroupId ?? ""); data.set("productGroupTitle", product?.productGroupTitle ?? product?.name ?? ""); data.set("sku", product?.sku ?? ""); data.set("skuTitle", product?.skuTitle ?? ""); data.set("products", productText); data.set("sourceUrl", window.location.href); appendAttribution(data, "guided_quote", locale); const response = await fetch("/api/inquiry", { method: "POST", body: data }); if (!response.ok) throw new Error("request failed"); setStatus("success"); trackKehongEvent("inquiry_submit", { locale, ctaLocation: "guided_quote", productGroupId: product?.productGroupId }); form.reset(); } catch { setStatus("error"); setError(text.error); }
  }

  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  return <form onSubmit={submit} className="text-(--kh-ink)">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="kh-eyebrow">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-semibold">{text.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-(--kh-muted)">{text.intro}</p></div><span className="rounded-full bg-(--kh-paper-deep) px-3 py-1.5 text-xs font-semibold text-(--kh-brass)">{step + 1} / {text.steps.length}</span></div>
    <ol className="mt-6 grid gap-2 sm:grid-cols-5" aria-label={text.progress}>{text.steps.map((label, index) => <li key={label} className={`rounded-md px-2 py-2 text-xs font-semibold ${index === step ? "bg-(--kh-forest) text-(--kh-surface)" : index < step ? "bg-(--kh-brass-soft) text-(--kh-ink)" : "bg-(--kh-paper) text-(--kh-muted)"}`}><span className="mr-1">{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol>
    <InquiryContext locale={locale} seeds={initialProducts} /><div className="mt-7" aria-live="polite">
      <div hidden={step !== 0}><Fieldset title={text.project}><div className="grid gap-3 sm:grid-cols-2"><Field label={text.packagingType} name="packagingType" placeholder={text.packagingPlaceholder} /><Field label={text.industry} name="industry" placeholder={text.industryPlaceholder} /><Field label={text.use} name="use" placeholder={text.usePlaceholder} /><Field label={text.unsure} name="unsure" placeholder={text.unsurePlaceholder} /></div><Field label={text.products} name="products" placeholder={text.productsPlaceholder} defaultValue={initialProductText} required={!initialProducts.some((item) => item.interestId)} multiline /></Fieldset></div>
      <div hidden={step !== 1}><Fieldset title={text.size}><div className="grid gap-3 sm:grid-cols-2"><Field label={text.dimensionType} name="dimensionType" placeholder={text.dimensionTypePlaceholder} /><Field label={text.dimensions} name="dimensions" placeholder={text.dimensionsPlaceholder} /><Field label={text.quantity} name="quantity" placeholder={text.quantityPlaceholder} /><Field label={text.repeat} name="repeatFrequency" placeholder={text.repeatPlaceholder} /><Field label={text.orderDate} name="targetOrderDate" placeholder={text.known} /><Field label={text.deliveryDate} name="requiredDeliveryDate" placeholder={text.known} /></div></Fieldset></div>
      <div hidden={step !== 2}><Fieldset title={text.material}><div className="grid gap-3 sm:grid-cols-2"><Field label={text.preferredMaterial} name="material" placeholder={text.preferredMaterialPlaceholder} /><Field label={text.board} name="boardType" placeholder={text.known} /><Field label={text.structure} name="structure" placeholder={text.structurePlaceholder} /><Field label={text.features} name="features" placeholder={text.featuresPlaceholder} /><Field label={text.recommend} name="recommendation" placeholder={text.recommendPlaceholder} /></div></Fieldset></div>
      <div hidden={step !== 3}><Fieldset title={text.print}><div className="grid gap-3 sm:grid-cols-2"><Field label={text.colors} name="printing" placeholder={text.colorsPlaceholder} /><Field label={text.printSide} name="printSide" placeholder={text.printSidePlaceholder} /><Field label={text.finish} name="finish" placeholder={text.finishPlaceholder} /><Field label={text.artwork} name="artworkStatus" placeholder={text.artworkPlaceholder} /></div><label className="mt-3 flex min-h-14 items-center gap-3 rounded-md border border-dashed border-(--kh-brass)/50 bg-(--kh-surface) px-3 text-sm font-semibold"><Upload className="size-4 text-(--kh-brass)" /><span className="flex-1">{text.upload}</span><input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="max-w-[11rem] text-xs" /></label><p className="mt-2 text-xs leading-5 text-(--kh-muted)">{text.uploadNote}</p></Fieldset></div>
      <div hidden={step !== 4}><Fieldset title={text.delivery}><div className="grid gap-3 sm:grid-cols-2"><Field label={text.destination} name="country" placeholder={text.destination} /><Field label={text.shipping} name="shipping" placeholder={text.known} /><Field label={text.company} name="company" placeholder={text.companyPlaceholder} /><Field label={text.name} name="name" placeholder={text.namePlaceholder} required /><Field label={text.email} name="email" type="email" placeholder="name@company.com" required /><Field label={text.phone} name="phone" placeholder={text.optional} /></div><Field label={text.notes} name="message" placeholder={text.notesPlaceholder} multiline /><InquiryConsent locale={locale} id="guided-quote-privacy" /></Fieldset></div>
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || status === "sending"} className="kh-button kh-button-secondary disabled:opacity-40"><ChevronLeft className="size-4" />{text.back}</button>{step < 4 ? <button type="button" onClick={() => setStep((value) => Math.min(4, value + 1))} className="kh-button kh-button-primary">{text.next}<ChevronRight className="size-4" /></button> : <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={status === "sending"} className="kh-button kh-button-primary disabled:opacity-60"><Send className="size-4" />{status === "sending" ? text.sending : text.submit}</button>{zh ? <><WeChatContactButton phone={contact.phone.zh} label="微信咨询" copiedLabel="手机号已复制" className="kh-button kh-button-secondary" /><a href="tel:+8615888233221" className="kh-button kh-button-secondary"><Phone className="size-4 text-(--kh-brass)" />电话</a></> : <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="kh-button kh-button-secondary"><MessageCircle className="size-4 text-(--kh-brass)" />{text.whatsapp}</a>}</div>}</div>
    {status === "success" ? <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="size-4" />{text.success}</p> : null}{status === "error" ? <p className="mt-4 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">{error}</p> : null}
  </form>;
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) { return <fieldset><legend className="text-lg font-semibold">{title}</legend>{children}</fieldset>; }
function Field({ label, name, placeholder, type = "text", required = false, multiline = false, defaultValue }: { label: string; name: string; placeholder: string; type?: string; required?: boolean; multiline?: boolean; defaultValue?: string }) { const props = { name, required, placeholder, defaultValue, className: "kh-input mt-1 min-h-11 w-full px-3 py-2 text-sm outline-none" }; return <label className="block text-sm font-semibold text-(--kh-muted)">{label}{multiline ? <textarea {...props} className={`${props.className} min-h-24`} /> : <input {...props} type={type} />}</label>; }
