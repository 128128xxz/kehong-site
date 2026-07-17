import { ArrowRight, CheckCircle2, ClipboardCheck, Factory, MessageCircle, ShieldCheck } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { contact } from "@/data/company";
import type { IndustrySeoPageData } from "@/data/industrySeoPages";
import { Link } from "@/i18n/navigation";

type Props = {
  locale: string;
  page: IndustrySeoPageData;
};

export default function IndustrySeoPage({ locale, page }: Props) {
  const isZh = locale === "zh";
  const title = isZh ? page.zhTitle : page.title;
  const description = isZh ? page.zhDescription : page.description;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    isZh
      ? `你好科宏，我想咨询${page.zhTitle}。`
      : `Hello Kehong, I would like to discuss ${page.title}.`,
  )}`;

  return (
    <div className="texture-paper min-h-screen bg-[#f6f4ec] text-[#171713]">
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-6 shadow-2xl shadow-[#171713]/10 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a6b1f]">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#626156]">
              {description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white"
              >
                {isZh ? "获取报价" : "Request a quote"}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#171713]/14 bg-[#f6f4ec] px-5 text-sm font-black text-[#171713]"
              >
                <MessageCircle className="size-4 text-[#9a6b1f]" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {page.buyerFocus.map((item) => (
              <div key={item} className="kh-panel rounded-lg border border-[#d9d2be] bg-white p-5 shadow-xl shadow-[#171713]/8">
                <CheckCircle2 className="size-5 text-[#9a6b1f]" />
                <p className="mt-4 text-lg font-black leading-tight">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#171713] px-4 py-12 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-white/12 bg-white/8 p-6">
              <div className="flex items-center gap-3">
                <Factory className="size-5 text-[#e8c06c]" />
                <h2 className="text-2xl font-black">{isZh ? "工厂与服务能力" : "Manufacturing and service capabilities"}</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {page.capabilities.map((item) => (
                  <p key={item} className="rounded-md border border-white/12 bg-white/8 px-4 py-3 text-sm font-bold text-[#f7f0df]/84">
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/8 p-6">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="size-5 text-[#e8c06c]" />
                <h2 className="text-2xl font-black">{isZh ? "应用场景" : "Applications"}</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {page.applications.map((item) => (
                  <p key={item} className="rounded-md border border-white/12 bg-white/8 px-4 py-3 text-sm font-bold text-[#f7f0df]/84">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-6 shadow-xl shadow-[#171713]/8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#9a6b1f]" />
              <h2 className="text-2xl font-black">{isZh ? "常见问题" : "Frequently asked questions"}</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {page.faq.map((item) => (
                <div key={item.question} className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] p-4">
                  <h3 className="text-sm font-black text-[#171713]">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#626156]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
