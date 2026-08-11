import { Link } from "@/i18n/navigation";
import { productFamilies } from "@/data/company";

const familyZh: Record<(typeof productFamilies)[number], string> = {
  "Corrugated / Fluted Paper": "瓦楞与坑纸",
  "Food Packaging Paper": "食品包装纸材",
  "Kraft Paper": "牛皮纸",
  "White Cardboard": "白卡纸",
  "Specialty Paper": "特种纸",
  "Paper Boxes & Trays": "纸盒与纸托",
};

function TrackItems({ zh, hidden }: { zh: boolean; hidden?: boolean }) {
  return (
    <>
      {productFamilies.map((family) => (
        <Link
          key={family}
          href={`/products?search=${encodeURIComponent(family)}`}
          tabIndex={hidden ? -1 : undefined}
        >
          {zh ? familyZh[family] : family}
        </Link>
      ))}
    </>
  );
}

export default function HomeMarquee({ locale }: { locale: string }) {
  const zh = locale === "zh";

  return (
    <section className="kh-marquee" aria-label={zh ? "产品材料系列" : "Product material families"}>
      <div className="kh-marquee-track">
        <TrackItems zh={zh} />
        <span aria-hidden="true" className="contents">
          <TrackItems zh={zh} hidden />
        </span>
      </div>
    </section>
  );
}
