"use client";

import { CheckCircle2, MessageCircle, Send } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";

type InquiryProduct = {
  sku?: string;
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
    title: "提交询盘",
    description: "留下采购需求，科宏团队会按产品、数量和目标市场跟进报价。",
    name: "姓名",
    company: "公司 / 品牌",
    email: "邮箱",
    phone: "电话",
    whatsappField: "WhatsApp",
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
    privacy: "我同意 Kehong 根据隐私政策处理本次询盘信息。",
    submit: "提交询盘",
    whatsapp: "WhatsApp",
    success: "询盘已被系统接收，科宏团队会尽快联系你。",
    error: "提交失败，请稍后重试，或直接使用 WhatsApp 联系。",
    required: "请填写姓名、邮箱、产品需求，并同意隐私政策。",
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
    privacy: "I agree that Kehong may process this inquiry according to the Privacy Policy.",
    submit: "Request a quote",
    whatsapp: "WhatsApp",
    success: "Your inquiry has been accepted by the Kehong website. Our team will follow up shortly.",
    error: "Submission failed. Please try again or contact us on WhatsApp.",
    required: "Please fill name, email and product interest, then accept the privacy policy.",
  },
} as const;

function productLine(product: InquiryProduct) {
  return [product.sku, product.name, product.url].filter(Boolean).join(" | ");
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
  const initialProductText = useMemo(
    () => initialProducts.map(productLine).filter(Boolean).join("\n"),
    [initialProducts],
  );
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
          const params = new URLSearchParams(window.location.search);
          formData.set("utmSource", params.get("utm_source") ?? "");
          formData.set("utmMedium", params.get("utm_medium") ?? "");
          formData.set("utmCampaign", params.get("utm_campaign") ?? "");
          return formData;
        })(),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(text.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`kh-panel rounded-lg border border-[#d9d2be] bg-white/94 text-[#171713] shadow-2xl shadow-[#171713]/12 backdrop-blur-xl ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
      }`}
    >
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a6b1f]">{text.eyebrow}</p>
        <h2 className="text-2xl font-black text-[#171713]">{title ?? text.title}</h2>
        <p className="text-sm leading-6 text-[#626156]">{description ?? text.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.name} />
        <input name="company" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.company} />
        <input name="email" required type="email" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.email} />
        <input name="phone" type="tel" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.phone} />
        <input name="whatsapp" type="tel" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.whatsappField} />
        <input name="country" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.country} />
      </div>

      <textarea
        name="products"
        required
        defaultValue={initialProductText}
        className="kh-input mt-3 min-h-24 w-full rounded-md px-3 py-3 text-sm font-semibold outline-none"
        placeholder={text.products}
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input name="quantity" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.quantity} />
        <input name="size" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.size} />
        <input name="material" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.material} />
        <input name="gsm" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.gsm} />
        <input name="printing" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.printing} />
        <input name="process" className="kh-input h-11 rounded-md px-3 text-sm outline-none" placeholder={text.process} />
        <input name="market" className="kh-input h-11 rounded-md px-3 text-sm outline-none sm:col-span-2" placeholder={text.market} />
      </div>
      <textarea
        name="message"
        className="kh-input mt-3 min-h-28 w-full rounded-md px-3 py-3 text-sm outline-none"
        placeholder={text.message}
      />
      <label className="mt-3 block text-sm font-semibold text-[#626156]">
        <span className="mb-2 block">{text.file}</span>
        <input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="kh-input block w-full rounded-md px-3 py-2 text-sm" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      <label className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#626156]">
        <input name="privacy" required type="checkbox" className="mt-1 size-4 accent-[#171713]" />
        <span>{text.privacy} <Link href="/privacy" className="font-bold text-[#9a6b1f] underline">{isZh ? "查看隐私政策" : "Privacy Policy"}</Link></span>
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white transition hover:bg-[#2b2b24] disabled:cursor-wait disabled:opacity-70"
        >
          <Send className="size-4" />
          {status === "sending" ? (isZh ? "提交中..." : "Sending...") : text.submit}
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#171713]/16 bg-[#f6f4ec] px-5 text-sm font-black text-[#171713] transition hover:bg-[#f1e7cf]"
        >
          <MessageCircle className="size-4 text-[#9a6b1f]" />
          {text.whatsapp}
        </a>
      </div>

      {status === "success" ? (
        <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-900">
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
