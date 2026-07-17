import {
  ClipboardCheck,
  Factory,
  Home,
  Menu,
  MessageCircle,
  PackageSearch,
  Rotate3D,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { contact } from "@/data/company";

const headerCopy = {
  zh: {
    home: "首页",
    studio: "3D 展厅",
    bakery: "烘焙包装",
    products: "产品",
    factory: "工厂",
    process: "流程",
    procurement: "采购",
    contact: "联系",
  },
  en: {
    home: "Home",
    studio: "3D Studio",
    bakery: "Bakery",
    products: "Products",
    factory: "Factory",
    process: "Process",
    procurement: "Procurement",
    contact: "Contact",
  },
  es: {
    home: "Inicio",
    studio: "Estudio 3D",
    bakery: "Panadería",
    products: "Productos",
    factory: "Fábrica",
    process: "Proceso",
    procurement: "Compras",
    contact: "Contacto",
  },
  th: {
    home: "หน้าแรก",
    studio: "3D",
    bakery: "เบเกอรี่",
    products: "สินค้า",
    factory: "โรงงาน",
    process: "กระบวนการ",
    procurement: "จัดซื้อ",
    contact: "ติดต่อ",
  },
  vi: {
    home: "Trang chủ",
    studio: "3D Studio",
    bakery: "Bánh ngọt",
    products: "Sản phẩm",
    factory: "Nhà máy",
    process: "Quy trình",
    procurement: "Mua hàng",
    contact: "Liên hệ",
  },
  id: {
    home: "Beranda",
    studio: "Studio 3D",
    bakery: "Bakery",
    products: "Produk",
    factory: "Pabrik",
    process: "Proses",
    procurement: "Pengadaan",
    contact: "Kontak",
  },
  ms: {
    home: "Utama",
    studio: "Studio 3D",
    bakery: "Bakeri",
    products: "Produk",
    factory: "Kilang",
    process: "Proses",
    procurement: "Perolehan",
    contact: "Hubungi",
  },
} as const;

export default async function Header() {
  const t = await getTranslations("Site");
  const locale = await getLocale();
  const copy = headerCopy[locale as keyof typeof headerCopy] ?? headerCopy.en;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const navItems = [
    { href: "/", label: copy.home, icon: Home },
    { href: "/products", label: copy.products, icon: PackageSearch },
    { href: "/#studio", label: copy.studio, icon: Rotate3D },
    { href: "/factory", label: copy.factory, icon: Factory },
    { href: "/process", label: copy.process, icon: ClipboardCheck },
    { href: "/procurement", label: copy.procurement, icon: ClipboardCheck },
  ] as const;

  return (
    <header className="kh-hairline sticky top-0 z-50 border-b border-[#d9d2be]/80 bg-[#f8f7f1]/94 text-[#171713] shadow-sm backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-5 px-4 sm:px-6 lg:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="premium-depth flex h-10 w-14 items-center justify-center rounded-lg border-2 border-[#171713]/80 bg-[#171713] text-sm font-black tracking-tight text-[#e8c06c] shadow-sm">
            KH
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase tracking-[0.18em] text-[#171713]">
              {t("brand")}
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6b1f] sm:block">
              {locale === "zh" ? "纸质包装" : "Paper Packaging"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-[#d9d2be] bg-white/72 p-1.5 text-sm font-bold text-[#4e4b42] shadow-sm backdrop-blur-xl lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full px-3.5 transition hover:bg-[#171713] hover:text-[#e8c06c]"
              >
                <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-[#e8c06c]/70 transition group-hover:scale-x-100" />
                <Icon className="size-4 transition group-hover:scale-110" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <details className="group relative lg:hidden">
            <summary aria-label={locale === "zh" ? "打开导航菜单" : "Open navigation menu"} className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-[#171713]/18 bg-white text-[#171713] shadow-sm [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" />
            </summary>
            <div className="kh-panel absolute right-0 top-12 w-[min(82vw,20rem)] overflow-hidden rounded-lg border border-white/12 bg-[#171713] p-2 shadow-2xl shadow-black/30">
              <div className="grid gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-black text-[#f7f0df]/88 transition hover:bg-white/10 hover:text-[#e8c06c]"
                    >
                      <Icon className="size-4 text-[#e8c06c]" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/contact"
                  className="mt-1 flex min-h-11 items-center justify-center rounded-md bg-[#e8c06c] px-3 text-sm font-black text-[#171713]"
                >
                  {copy.contact} / {t("cta.quote")}
                </Link>
              </div>
            </div>
          </details>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden rounded-full border-[#171713]/18 bg-white text-[#171713] shadow-sm hover:bg-[#171713] hover:text-white md:inline-flex"
          >
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="hidden rounded-full bg-[#e8c06c] text-[#171713] shadow-lg shadow-[#e8c06c]/20 hover:bg-[#f3d182] sm:inline-flex"
          >
            <Link href="/contact">{t("cta.quote")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
