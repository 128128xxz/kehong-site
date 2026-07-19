"use client";

import { ClipboardCheck, Factory, ChevronDown, Menu, MessageCircle, PackageSearch, Rotate3D } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { contact } from "@/data/company";

const headerCopy = {
  zh: { home: "首页", studio: "3D 展厅", products: "产品", solutions: "解决方案", capabilities: "制造能力", buyerSupport: "买家支持", company: "公司", contact: "获取报价" },
  en: { home: "Home", studio: "3D Studio", products: "Products", solutions: "Solutions", capabilities: "Capabilities", buyerSupport: "Buyer Support", company: "Company", contact: "Get a Quote" },
  es: { home: "Inicio", studio: "Estudio 3D", products: "Productos", solutions: "Soluciones", capabilities: "Capacidades", buyerSupport: "Soporte al comprador", company: "Empresa", contact: "Solicitar cotización" },
  th: { home: "หน้าแรก", studio: "3D", products: "สินค้า", solutions: "โซลูชัน", capabilities: "ความสามารถ", buyerSupport: "การสนับสนุนผู้ซื้อ", company: "บริษัท", contact: "ขอใบเสนอราคา" },
  vi: { home: "Trang chủ", studio: "3D Studio", products: "Sản phẩm", solutions: "Giải pháp", capabilities: "Năng lực", buyerSupport: "Hỗ trợ người mua", company: "Công ty", contact: "Nhận báo giá" },
  id: { home: "Beranda", studio: "Studio 3D", products: "Produk", solutions: "Solusi", capabilities: "Kemampuan", buyerSupport: "Dukungan pembeli", company: "Perusahaan", contact: "Minta penawaran" },
  ms: { home: "Utama", studio: "Studio 3D", products: "Produk", solutions: "Penyelesaian", capabilities: "Keupayaan", buyerSupport: "Sokongan pembeli", company: "Syarikat", contact: "Dapatkan sebut harga" },
} as const;

function navLinkClass(active: boolean) {
  return `group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-[.3rem] px-3.5 transition ${active ? "text-[#805716] after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-[#805716]" : "text-[#4e4b42] hover:bg-[#171713]/5 hover:text-[#805716]"}`;
}

export default function Header() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const pathname = usePathname();
  const copy = headerCopy[locale as keyof typeof headerCopy] ?? headerCopy.en;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const isProducts = pathname === "/products" || pathname.startsWith("/products/");
  const isSolutionContext = pathname.startsWith("/solutions");
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const solutionLinks = [
    { href: "/products?system=materials", label: locale === "zh" ? "材料 Materials" : "Materials" },
    { href: "/products?system=packaging", label: locale === "zh" ? "成品包装 Finished packaging" : "Finished packaging" },
    { href: "/products?search=food", label: locale === "zh" ? "食品与烘焙 Food & bakery" : "Food & bakery" },
  ];
  const capabilityLinks = [
    { href: "/factory", label: locale === "zh" ? "工厂 Factory" : "Factory" },
    { href: "/process", label: locale === "zh" ? "生产流程 Production process" : "Production process" },
  ];

  return (
    <header className="kh-hairline sticky top-0 z-50 border-b border-[#d9d2be]/80 bg-[#f8f7f1]/94 text-[#171713] shadow-sm backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-5 px-4 sm:px-6 lg:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="premium-depth flex h-10 w-14 items-center justify-center rounded-lg border-2 border-[#171713]/80 bg-[#171713] text-sm font-black tracking-tight text-[#e8c06c] shadow-sm">KH</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase tracking-[0.18em] text-[#171713]">{t("brand")}</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6b1f] sm:block">{locale === "zh" ? "纸质包装" : "Paper Packaging"}</span>
          </span>
        </Link>

        <nav className="kh-desktop-nav hidden items-center rounded-full border border-[#d9d2be] bg-white/72 p-1.5 text-sm font-bold shadow-sm backdrop-blur-xl" aria-label="Primary navigation">
          <Link href="/products" aria-current={isProducts && !isSolutionContext ? "page" : undefined} className={navLinkClass(isProducts && !isSolutionContext)}><PackageSearch className="size-4" /><span>{copy.products}</span></Link>

          <details className="group relative">
            <summary className={`${navLinkClass(isSolutionContext)} list-none [&::-webkit-details-marker]:hidden`}><span>{copy.solutions}</span><ChevronDown className="size-3.5 transition group-open:rotate-180" /></summary>
            <div className="absolute left-0 top-12 grid w-64 gap-1 rounded-lg border border-[#d9d2be] bg-[#171713] p-2 text-sm font-black text-white shadow-2xl shadow-black/20">
              {solutionLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-md px-3 py-3 transition hover:bg-white/10 hover:text-[#e8c06c]">{item.label}<span className="float-right text-[#e8c06c]">→</span></Link>)}
            </div>
          </details>

          <details className="group relative">
            <summary className={`${navLinkClass(isActive("/factory") || isActive("/process"))} list-none [&::-webkit-details-marker]:hidden`}><Factory className="size-4" /><span>{copy.capabilities}</span><ChevronDown className="size-3.5 transition group-open:rotate-180" /></summary>
            <div className="absolute left-0 top-12 grid w-64 gap-1 rounded-lg border border-[#d9d2be] bg-[#171713] p-2 text-sm font-black text-white shadow-2xl shadow-black/20">
              {capabilityLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-md px-3 py-3 transition hover:bg-white/10 hover:text-[#e8c06c]">{item.label}<span className="float-right text-[#e8c06c]">→</span></Link>)}
            </div>
          </details>

          <Link href="/model-preview" aria-current={isActive("/model-preview") ? "page" : undefined} className={navLinkClass(isActive("/model-preview"))}><Rotate3D className="size-4" /><span>{copy.studio}</span></Link>
          <Link href="/procurement" aria-current={isActive("/procurement") ? "page" : undefined} className={navLinkClass(isActive("/procurement"))}><ClipboardCheck className="size-4" /><span>{copy.buyerSupport}</span></Link>
          <Link href="/factory" aria-current={isActive("/factory") ? "page" : undefined} className={navLinkClass(isActive("/factory"))}><span>{copy.company}</span></Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <details className="kh-compact-nav group relative">
            <summary aria-label={locale === "zh" ? "打开导航菜单" : "Open navigation menu"} className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-[#171713]/18 bg-white text-[#171713] shadow-sm [&::-webkit-details-marker]:hidden"><Menu className="size-5" /></summary>
            <div className="kh-panel absolute right-0 top-12 w-[min(86vw,22rem)] overflow-hidden rounded-lg border border-white/12 bg-[#171713] p-2 shadow-2xl shadow-black/30">
              <div className="grid gap-1">
                <Link href="/products" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-black text-white/88 transition hover:bg-white/10 hover:text-[#e8c06c]"><PackageSearch className="size-4 text-[#e8c06c]" />{copy.products}</Link>
                <p className="px-3 pt-3 text-[10px] font-black uppercase tracking-[.18em] text-[#e8c06c]">{copy.solutions}</p>
                {solutionLinks.map((item) => <Link key={item.href} href={item.href} className="flex min-h-10 items-center justify-between rounded-md px-3 pl-9 text-sm font-bold text-white/78 transition hover:bg-white/10 hover:text-[#e8c06c]">{item.label}<span>→</span></Link>)}
                <p className="px-3 pt-3 text-[10px] font-black uppercase tracking-[.18em] text-[#e8c06c]">{copy.capabilities}</p>
                {capabilityLinks.map((item) => <Link key={item.href} href={item.href} className="flex min-h-10 items-center justify-between rounded-md px-3 pl-9 text-sm font-bold text-white/78 transition hover:bg-white/10 hover:text-[#e8c06c]">{item.label}<span>→</span></Link>)}
                <Link href="/model-preview" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-black text-white/88 transition hover:bg-white/10 hover:text-[#e8c06c]"><Rotate3D className="size-4 text-[#e8c06c]" />{copy.studio}</Link>
                <Link href="/procurement" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-black text-white/88 transition hover:bg-white/10 hover:text-[#e8c06c]"><ClipboardCheck className="size-4 text-[#e8c06c]" />{copy.buyerSupport}</Link>
                <Link href="/factory" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-black text-white/88 transition hover:bg-white/10 hover:text-[#e8c06c]">{copy.company}</Link>
                <Link href="/contact" className="mt-1 flex min-h-11 items-center justify-center rounded-md bg-[#e8c06c] px-3 text-sm font-black text-[#171713]">{copy.contact}</Link>
              </div>
            </div>
          </details>
          <Button asChild size="sm" variant="outline" className="hidden rounded-full border-[#171713]/18 bg-white text-[#171713] shadow-sm hover:bg-[#171713] hover:text-white xl:inline-flex"><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />WhatsApp</a></Button>
          <Button asChild size="sm" className="hidden rounded-full bg-[#e8c06c] text-[#171713] shadow-lg shadow-[#e8c06c]/20 hover:bg-[#f3d182] sm:inline-flex"><Link href="/contact">{copy.contact}</Link></Button>
        </div>
      </div>
    </header>
  );
}
