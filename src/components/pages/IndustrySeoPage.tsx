import { ArrowRight, CheckCircle2, ClipboardCheck, Factory, MessageCircle } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
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
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={page.eyebrow}
          title={title}
          lede={description}
          meta={["OEM / ODM", isZh ? "中国广东佛山" : "Foshan, Guangdong, China", contact.email]}
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "获取报价" : "Request a quote"}
            <ArrowRight className="size-4" />
          </Link>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="kh-button kh-button-ghost">
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </PageHero>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="02" text={isZh ? "采购要点" : "Buyer focus"} />
                  <h2>{isZh ? "买家优先确认的方向" : "What buyers confirm first"}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {page.buyerFocus.map((item, index) => (
                <Reveal key={item} className="h-full" delay={(index % 4) * 80}>
                  <div className="kh-panel h-full p-5">
                    <CheckCircle2 className="size-5 text-(--kh-brass)" />
                    <p className="mt-4 text-lg font-semibold leading-snug">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="kh-section kh-section-forest">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="03" text={isZh ? "工厂与服务" : "Factory & service"} light />
                  <h2>{isZh ? "能力与应用场景" : "Capabilities and applications"}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 lg:grid-cols-2">
              <Reveal className="h-full">
                <div className="h-full rounded-lg border border-white/12 bg-white/8 p-6">
                  <div className="flex items-center gap-3">
                    <Factory className="size-5 text-(--kh-brass-soft)" />
                    <h3 className="text-2xl font-semibold">{isZh ? "工厂与服务能力" : "Manufacturing and service capabilities"}</h3>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {page.capabilities.map((item) => (
                      <p key={item} className="rounded-md border border-white/12 bg-white/8 px-4 py-3 text-sm font-medium text-white/85">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal className="h-full" delay={120}>
                <div className="h-full rounded-lg border border-white/12 bg-white/8 p-6">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="size-5 text-(--kh-brass-soft)" />
                    <h3 className="text-2xl font-semibold">{isZh ? "应用场景" : "Applications"}</h3>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {page.applications.map((item) => (
                      <p key={item} className="rounded-md border border-white/12 bg-white/8 px-4 py-3 text-sm font-medium text-white/85">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="04" text={isZh ? "答疑" : "FAQ"} />
                  <h2>{isZh ? "常见问题" : "Frequently asked questions"}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {page.faq.map((item, index) => (
                <Reveal key={item.question} className="h-full" delay={(index % 2) * 80}>
                  <div className="kh-panel h-full p-5">
                    <h3 className="text-sm font-bold text-(--kh-ink)">{item.question}</h3>
                    <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{item.answer}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
