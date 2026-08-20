"use client";

import { CheckCircle2, MessageCircle, Phone, Send } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { companyDisplayName, contact } from "@/data/company";
import { appendAttribution, captureAttribution, trackKehongEvent } from "@/lib/attribution";
import { formatProductSkuSummary } from "@/lib/productPresentation";
import WeChatContactButton from "@/components/site/WeChatContactButton";

type InquiryProduct = {
  productGroupId?: string;
  productGroupTitle?: string;
  sku?: string;
  skuTitle?: string;
  name?: string;
  url?: string;
};

type InquiryFormProps = {
  locale: string;
  initialProducts?: InquiryProduct[];
  title?: string;
  description?: string;
  compact?: boolean;
};

const copy = {
  zh: {
    eyebrow: "提交询盘",
    title: "立即询价",
    description: "留下采购需求，科宏团队会按产品、数量和目标市场跟进报价。",
    name: "姓名",
    company: "公司 / 品牌",
    email: "Email",
    phone: "电话",
    whatsappField: "微信或电话",
    country: "国家 / 地区",
    products: "感兴趣产品 / 产品编号",
    quantity: "预计数量",
    size: "尺寸 / 结构",
    material: "材质",
    gsm: "克重 / 厚度",
    printing: "印刷要求",
    process: "后工艺 / 表面处理",
    market: "目标市场",
    file: "附件（图纸、样品图或规格表）",
    message: "尺寸、材质、数量、印刷、交期或目标市场",
    privacy: `我同意${companyDisplayName.zh}根据隐私政策处理我提交的信息，以便回复本次询盘`,
    submit: "立即询价",
    whatsapp: "微信咨询",
    success: "询盘已被系统接收，科宏团队会尽快联系你。",
    error: "提交失败，请稍后重试，或直接通过电话联系。",
    required: "请填写姓名、Email、产品需求，并同意隐私政策。",
  },
  en: {
    eyebrow: "Request a quote",
    title: "Send Inquiry",
    description: "Share your product, quantity and destination market; Kehong will follow up with a tailored quotation.",
    name: "Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    whatsappField: "WhatsApp",
    country: "Country",
    products: "Product / product code",
    quantity: "Estimated quantity",
    size: "Size / structure",
    material: "Material",
    gsm: "GSM / thickness",
    printing: "Printing requirements",
    process: "Finishing / surface process",
    market: "Target market",
    file: "Attachment (drawing, sample photo or specification)",
    message: "Size, material, quantity, print, lead time or destination market",
    privacy: `I agree that ${companyDisplayName.en} may process this inquiry according to the Privacy Policy.`,
    submit: "Request a quote",
    whatsapp: "WhatsApp",
    success: "Your inquiry has been accepted by the Kehong website. Our team will follow up shortly.",
    error: "Submission failed. Please try again or contact us on WhatsApp.",
    required: "Please fill name, email and product interest, then accept the privacy policy.",
  },
} as const;

function productLine(product: InquiryProduct, locale: string) {
  return [product.productGroupTitle ?? product.name, product.sku ? formatProductSkuSummary(product.sku, locale) : "", product.url].filter(Boolean).join(" | ");
}

export default function InquiryForm({
  locale,
  initialProducts = [],
  title,
  description,
  compact = false,
}: InquiryFormProps) {
  const isZh = locale === "zh";
  const text = isZh ? copy.zh : copy.en;
  const [storedProducts, setStoredProducts] = useState<InquiryProduct[]>([]);
  const productsRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    captureAttribution();
    try {
      const raw = window.sessionStorage.getItem("kehong-selected-products");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<InquiryProduct & { slug?: string; title?: { en?: string } }>;
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStoredProducts(parsed.map((product) => ({
          productGroupId: product.productGroupId,
          productGroupTitle: product.productGroupTitle,
          sku: product.sku,
          skuTitle: product.skuTitle,
          name: product.name ?? product.title?.en,
          url: product.url ?? (product.slug ? `https://www.kehong.tech/${locale}/products/${product.slug}` : undefined),
        })));
      }
    } catch {
      // Ignore unavailable storage in privacy-restricted browsers.
    }
  }, [locale]);
  const effectiveProducts = useMemo(() => {
    const seen = new Set<string>();
    return [...initialProducts, ...storedProducts].filter((product) => {
      const key = product.sku || product.url || product.name || "";
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [initialProducts, storedProducts]);
  const initialProductText = useMemo(
    () => effectiveProducts.map((product) => productLine(product, locale)).filter(Boolean).join("\n"),
    [effectiveProducts, locale],
  );
  useEffect(() => {
    if (productsRef.current && initialProductText) productsRef.current.value = initialProductText;
  }, [initialProductText]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const whatsappMessage = encodeURIComponent(
    `${isZh ? "你好科宏，我想咨询纸品包装报价。" : "Hello Kehong, I would like a paper packaging quote."}\n${initialProductText}`,
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const products = String(formData.get("products") ?? "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim(),
      products,
      quantity: String(formData.get("quantity") ?? "").trim(),
      size: String(formData.get("size") ?? "").trim(),
      material: String(formData.get("material") ?? "").trim(),
      gsm: String(formData.get("gsm") ?? "").trim(),
      printing: String(formData.get("printing") ?? "").trim(),
      process: String(formData.get("process") ?? "").trim(),
      market: String(formData.get("market") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || payload.products.length === 0 || formData.get("privacy") !== "on") {
      setStatus("error");
      setErrorMessage(text.required);
      return;
    }

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        body: (() => {
          formData.set("products", products.join("\n"));
          formData.set("sourceUrl", window.location.href);
          const selected = effectiveProducts[0];
          formData.set("productGroupId", selected?.productGroupId ?? "");
          formData.set("productGroupTitle", selected?.productGroupTitle ?? selected?.name ?? "");
          formData.set("sku", selected?.sku ?? "");
          formData.set("skuTitle", selected?.skuTitle ?? "");
          appendAttribution(formData, compact ? "compact_inquiry" : "inquiry_form", locale);
          return formData;
        })(),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      trackKehongEvent("inquiry_submit", { locale, ctaLocation: compact ? "compact_inquiry" : "inquiry_form", productGroupId: effectiveProducts[0]?.productGroupId });
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(text.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`kh-panel text-(--kh-ink) ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
      }`}
    >
      <div className="mb-5 flex flex-col gap-2">
        <p className="kh-eyebrow">{text.eyebrow}</p>
        <h2 className="kh-editorial-heading text-2xl text-(--kh-ink)">{title ?? text.title}</h2>
        <p className="text-sm leading-6 text-(--kh-muted)">{description ?? text.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required className="kh-input h-11 px-3 text-sm" placeholder={text.name} />
        <input name="company" className="kh-input h-11 px-3 text-sm" placeholder={text.company} />
        <input name="email" required type="email" className="kh-input h-11 px-3 text-sm" placeholder={text.email} />
        <input name="phone" type="tel" className="kh-input h-11 px-3 text-sm" placeholder={text.phone} />
        <input name="whatsapp" type="tel" className="kh-input h-11 px-3 text-sm" placeholder={text.whatsappField} />
        <input name="country" className="kh-input h-11 px-3 text-sm" placeholder={text.country} />
      </div>

      <textarea
        ref={productsRef}
        name="products"
        required
        defaultValue={initialProductText}
        className="kh-input mt-3 min-h-24 w-full px-3 py-3 text-sm font-semibold"
        placeholder={text.products}
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input name="quantity" className="kh-input h-11 px-3 text-sm" placeholder={text.quantity} />
        <input name="size" className="kh-input h-11 px-3 text-sm" placeholder={text.size} />
        <input name="material" className="kh-input h-11 px-3 text-sm" placeholder={text.material} />
        <input name="gsm" className="kh-input h-11 px-3 text-sm" placeholder={text.gsm} />
        <input name="printing" className="kh-input h-11 px-3 text-sm" placeholder={text.printing} />
        <input name="process" className="kh-input h-11 px-3 text-sm" placeholder={text.process} />
        <input name="market" className="kh-input h-11 px-3 text-sm sm:col-span-2" placeholder={text.market} />
      </div>
      <textarea
        name="message"
        className="kh-input mt-3 min-h-28 w-full px-3 py-3 text-sm"
        placeholder={text.message}
      />
      <label className="mt-3 block text-sm font-semibold text-(--kh-muted)">
        <span className="mb-2 block">{text.file}</span>
        <input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="kh-input block w-full px-3 py-2 text-sm" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      <label className="mt-4 flex items-start gap-2 text-sm leading-6 text-(--kh-muted)">
        <input name="privacy" required type="checkbox" className="mt-1 size-4 accent-(--kh-forest)" />
        <span>{text.privacy} <Link href="/privacy" className="kh-inline-link">{isZh ? "查看隐私政策" : "Privacy Policy"}</Link></span>
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={status === "sending"}
          className="kh-button kh-button-primary flex-1 disabled:cursor-wait disabled:opacity-70"
        >
          <Send className="size-4" />
          {status === "sending" ? (isZh ? "提交中..." : "Sending...") : text.submit}
        </button>
        {isZh ? <><WeChatContactButton phone={contact.phone.zh} label="微信咨询" copiedLabel="手机号已复制" className="kh-button kh-button-secondary" /><a href="tel:+8615888233221" className="kh-button kh-button-secondary"><Phone className="size-4 text-(--kh-brass)" />电话</a></> : <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="kh-button kh-button-secondary"><MessageCircle className="size-4 text-(--kh-brass)" />{text.whatsapp}</a>}
      </div>

      {status === "success" ? (
        <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          <CheckCircle2 className="size-4" />
          {text.success}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-4 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm font-bold text-red-900">
          {errorMessage || text.error}
        </p>
      ) : null}
    </form>
  );
}
