"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, MessageCircle, Send, Upload } from "lucide-react";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";

type GuidedQuoteFormProps = { locale: string; initialProducts?: Array<{ sku?: string; name?: string; url?: string }> };
const steps = ["Project", "Size & quantity", "Material & structure", "Printing & finish", "Delivery & contact"];

export default function GuidedQuoteForm({ locale, initialProducts = [] }: GuidedQuoteFormProps) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const initialProductText = useMemo(() => initialProducts.map((item) => [item.sku, item.name, item.url].filter(Boolean).join(" | ")).join("\n"), [initialProducts]);
  const text = locale === "zh" ? { title: "分步骤提交项目需求", intro: "按项目阶段填写信息，前后切换不会丢失当前内容。", next: "下一步", back: "上一步", submit: "提交询盘", sending: "提交中…", success: "询盘已接收，Kehong 团队会尽快跟进。", error: "提交失败，请检查必填项后重试。", required: "请完成必填项并同意隐私政策。", whatsapp: "改用 WhatsApp" } : { title: "Guided packaging quote", intro: "Move through the project brief step by step. Your entries stay on the form while you review each stage.", next: "Continue", back: "Back", submit: "Submit inquiry", sending: "Sending…", success: "Your inquiry was accepted. The Kehong team will follow up shortly.", error: "The inquiry could not be submitted. Check the required fields and try again.", required: "Complete the required fields and accept the privacy policy.", whatsapp: "Continue on WhatsApp" };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const productText = String(data.get("products") ?? "").trim();
    if (!String(data.get("name") ?? "").trim() || !String(data.get("email") ?? "").trim() || !productText || data.get("privacy") !== "on") {
      setError(text.required); setStatus("error"); setStep(4); return;
    }
    setStatus("sending"); setError("");
    try {
      data.set("products", productText);
      data.set("sourceUrl", window.location.href);
      const response = await fetch("/api/inquiry", { method: "POST", body: data });
      if (!response.ok) throw new Error("request failed");
      setStatus("success"); form.reset();
    } catch { setStatus("error"); setError(text.error); }
  }

  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  return <form onSubmit={submit} className="rounded-lg border border-[#d9d2be] bg-white/95 p-5 text-[#171713] shadow-xl sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#9a6b1f]">Request a quote</p><h2 className="mt-2 text-2xl font-black">{text.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#626156]">{text.intro}</p></div><span className="rounded-full bg-[#f1e7cf] px-3 py-1.5 text-xs font-black text-[#805716]">{step + 1} / {steps.length}</span></div>
    <ol className="mt-6 grid gap-2 sm:grid-cols-5" aria-label="Quote progress">{steps.map((label, index) => <li key={label} className={`rounded-md px-2 py-2 text-xs font-black ${index === step ? "bg-[#171713] text-white" : index < step ? "bg-[#e8c06c]/35 text-[#805716]" : "bg-[#f6f4ec] text-[#626156]"}`}><span className="mr-1">{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol>
    <div className="mt-7" aria-live="polite">
      <div hidden={step !== 0}><Fieldset title="Project"><div className="grid gap-3 sm:grid-cols-2"><Field label="Packaging type" name="packagingType" placeholder="Cake box, mailer, bag…" /><Field label="Product / industry" name="industry" placeholder="Bakery, retail, e-commerce…" /><Field label="Use" name="use" placeholder="Retail / takeaway / display / shipping" /><Field label="If unsure" name="unsure" placeholder="Tell us what you are trying to pack" /></div><Field label="Products or SKUs" name="products" placeholder="Product name, SKU or reference" defaultValue={initialProductText} required multiline /></Fieldset></div>
      <div hidden={step !== 1}><Fieldset title="Size & quantity"><div className="grid gap-3 sm:grid-cols-2"><Field label="Internal or external dimensions" name="dimensionType" placeholder="Internal / external" /><Field label="Length × width × height" name="dimensions" placeholder="Add dimensions and unit" /><Field label="Quantity" name="quantity" placeholder="Estimated quantity" /><Field label="Repeat frequency" name="repeatFrequency" placeholder="One-off / repeat / seasonal" /><Field label="Target order date" name="targetOrderDate" placeholder="Target date" /><Field label="Required delivery date" name="requiredDeliveryDate" placeholder="If known" /></div></Fieldset></div>
      <div hidden={step !== 2}><Fieldset title="Material & structure"><div className="grid gap-3 sm:grid-cols-2"><Field label="Preferred material" name="material" placeholder="Paper, board, corrugated…" /><Field label="Board / flute / paper type" name="boardType" placeholder="If known" /><Field label="Box style / structure" name="structure" placeholder="Mailer, folding carton, tray…" /><Field label="Window / handle / insert / divider" name="features" placeholder="Optional features" /><Field label="Recommend for me" name="recommendation" placeholder="Share your product and priorities" /></div></Fieldset></div>
      <div hidden={step !== 3}><Fieldset title="Printing & finish"><div className="grid gap-3 sm:grid-cols-2"><Field label="Printing colors" name="printing" placeholder="CMYK / Pantone / reference" /><Field label="Inside or outside printing" name="printSide" placeholder="Outside / inside / both" /><Field label="Lamination / foil / emboss / coating" name="finish" placeholder="Select the finish direction" /><Field label="Artwork readiness" name="artworkStatus" placeholder="Ready / in progress / need guidance" /></div><label className="mt-3 flex min-h-14 items-center gap-3 rounded-md border border-dashed border-[#9a6b1f]/50 bg-[#fbfaf5] px-3 text-sm font-semibold"><Upload className="size-4 text-[#9a6b1f]" /><span className="flex-1">Artwork or reference file</span><input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="max-w-[11rem] text-xs" /></label><p className="mt-2 text-xs leading-5 text-[#626156]">File upload status is shown by the browser. Large or unsupported files may need to be shared after the first inquiry.</p></Fieldset></div>
      <div hidden={step !== 4}><Fieldset title="Delivery & contact"><div className="grid gap-3 sm:grid-cols-2"><Field label="Destination country / postal code" name="country" placeholder="Destination" /><Field label="Shipping preference / Incoterm" name="shipping" placeholder="If known" /><Field label="Company" name="company" placeholder="Company name" /><Field label="Name" name="name" placeholder="Your name" required /><Field label="Email" name="email" type="email" placeholder="name@company.com" required /><Field label="Phone / WhatsApp" name="phone" placeholder="Optional" /></div><Field label="Notes" name="message" placeholder="Lead time, destination or other project notes" multiline /><label className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#626156]"><input name="privacy" required type="checkbox" className="mt-1 size-4 accent-[#171713]" /><span>I agree that Kehong may process this inquiry according to the <Link href="/privacy" className="font-bold text-[#9a6b1f] underline">Privacy Policy</Link>.</span></label></Fieldset></div>
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || status === "sending"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#171713]/18 px-4 text-sm font-black disabled:opacity-40"><ChevronLeft className="size-4" />{text.back}</button>{step < 4 ? <button type="button" onClick={() => setStep((value) => Math.min(4, value + 1))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white">{text.next}<ChevronRight className="size-4" /></button> : <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={status === "sending"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white disabled:opacity-60"><Send className="size-4" />{status === "sending" ? text.sending : text.submit}</button><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#171713]/18 px-4 text-sm font-black"><MessageCircle className="size-4 text-[#9a6b1f]" />{text.whatsapp}</a></div>}</div>
    {status === "success" ? <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-900"><CheckCircle2 className="size-4" />{text.success}</p> : null}{status === "error" ? <p className="mt-4 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm font-bold text-red-900">{error}</p> : null}
  </form>;
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) { return <fieldset><legend className="text-lg font-black">{title}</legend>{children}</fieldset>; }
function Field({ label, name, placeholder, type = "text", required = false, multiline = false, defaultValue }: { label: string; name: string; placeholder: string; type?: string; required?: boolean; multiline?: boolean; defaultValue?: string }) { const props = { name, required, placeholder, defaultValue, className: "kh-input mt-1 min-h-11 w-full rounded-md px-3 py-2 text-sm outline-none" }; return <label className="block text-sm font-semibold text-[#4e4b42]">{label}{multiline ? <textarea {...props} className={`${props.className} min-h-24`} /> : <input {...props} type={type} />}</label>; }
