import {
  CakeSlice,
  Mail,
  MessageCircle,
  PackageSearch,
  Rotate3D,
  ShieldCheck,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { contact, productFamilies } from "@/data/company";

const footerCopy = {
  zh: {
    studio: "3D 产品预览",
    bakery: "烘焙包装",
    products: "产品目录",
    contact: "提交询价",
    factory: "佛山工厂",
    note: "从材料选择到成品包装，科宏为您的项目提供清晰的产品与服务支持。",
  },
  en: {
    studio: "3D Product Preview",
    bakery: "Bakery Packaging",
    products: "Product Catalog",
    contact: "Request a quote",
    factory: "Foshan Factory",
    note: "From material selection to finished packaging, Kehong provides clear product information and project support.",
  },
  es: {
    studio: "Vista previa 3D",
    bakery: "Bakery Packaging",
    products: "Catalogo",
    contact: "Solicitar cotización",
    factory: "Fabrica Foshan",
    note: "Desde la selección de materiales hasta el embalaje terminado, Kehong ofrece apoyo claro para cada proyecto.",
  },
} as const;

export default async function SiteFooter() {
  const t = await getTranslations("Site");
  const locale = await getLocale();
  const copy = footerCopy[locale as keyof typeof footerCopy] ?? footerCopy.en;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const serviceChips = locale === "zh"
    ? ["OEM/ODM", "快速打样", "材料匹配", "出口包装", "质检文件", "灵活 MOQ"]
    : ["OEM/ODM", "Sampling", "Material match", "Export packing", "QC documents", "Flexible MOQ"];
  const localizedProductFamilies = locale === "zh"
    ? ["瓦楞纸 / 坑纸", "食品级纸", "牛皮纸", "白卡纸", "特种纸", "纸盒与纸托"]
    : productFamilies;
  const links = [
    { href: "/model-preview", label: copy.studio, icon: Rotate3D },
    { href: "/custom-paper-products", label: copy.bakery, icon: CakeSlice },
    { href: "/products", label: copy.products, icon: PackageSearch },
    { href: "/contact", label: copy.contact, icon: MessageCircle },
  ] as const;
  const categorySlugs = ["corrugated-paper", "food-grade-paper", "kraft-paper", "white-cardboard", "specialty-paper", "paper-boxes"];

  return (
    <footer className="texture-ink border-t border-[#d9d2be] bg-[#171713] px-4 pb-32 pt-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.35fr_.85fr]">
        <div>
          <div className="inline-flex h-11 w-16 items-center justify-center rounded-md border-2 border-[#e8c06c]/70 bg-white/8 text-base font-black">
            KH
          </div>
          <p className="mt-4 text-lg font-black">{t("brand")}</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-[#f7f0df]/70">
            {copy.note}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <nav className="grid gap-3">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg border border-white/12 bg-white/7 px-4 py-3 text-sm font-black text-[#f7f0df]/86 transition hover:-translate-y-0.5 hover:border-[#e8c06c]/60 hover:bg-white/10 hover:text-[#e8c06c]"
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <span className="text-[#e8c06c]">→</span>
                </Link>
              );
            })}
          </nav>
          <div className="rounded-lg border border-white/12 bg-white/7 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e8c06c]">
              {locale === "zh" ? "产品系列" : "Product families"}
            </p>
            <div className="grid gap-2">
              {localizedProductFamilies.map((item, index) => {
                return (
                  <Link
                    key={item}
                    href={`/products/${categorySlugs[index] ?? "paper-packaging-materials"}`}
                    className="text-sm font-semibold leading-6 text-[#f7f0df]/78 transition hover:text-[#e8c06c]"
                  >
                    {item}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/7 p-4 md:col-span-2">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#e8c06c]">
              <ShieldCheck className="size-4" />
              {locale === "zh" ? "项目支持" : "Project support"}
            </p>
            <div className="flex flex-wrap gap-2">
              {serviceChips.map((item) => (
                <span key={item} className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-bold text-[#f7f0df]/78">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/12 bg-white/7 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e8c06c]">
            {copy.factory}
          </p>
          <div className="mt-4 space-y-2 text-sm text-[#f7f0df]/78">
            <p>{locale === "zh" ? "海外销售 WhatsApp" : "Overseas Sales WhatsApp"}: {contact.whatsapp}</p>
            <p>Email: {contact.email}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#e8c06c] px-4 py-2 text-sm font-black text-[#171713] transition hover:bg-[#f3d182]"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-black text-white transition hover:bg-white/12"
            >
              <Mail className="size-4" />
              Email
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/12 pt-5 text-xs text-[#f7f0df]/60">
        <Link href="/privacy" className="hover:text-[#e8c06c]">{locale === "zh" ? "隐私政策" : "Privacy Policy"}</Link>
        <Link href="/terms" className="hover:text-[#e8c06c]">{locale === "zh" ? "使用条款" : "Terms of Use"}</Link>
        <span>© {new Date().getFullYear()} Kehong</span>
      </div>
    </footer>
  );
}
