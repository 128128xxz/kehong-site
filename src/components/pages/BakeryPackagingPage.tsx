import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { Link } from "@/i18n/navigation";
import { packagingCategories } from "@/data/packagingCategories";
import { showcaseImages } from "@/data/visuals";

const comparisonRows = [
  ["Cake Board", "Paperboard support", "Everyday single-layer cakes and display", "Shape, surface and edge confirmed by project"],
  ["Cake Drum", "Thicker support direction", "Heavier or multi-layer presentation", "Finish and edge options confirmed by project"],
  ["MDF / Masonite", "Rigid board direction when offered", "Rigid or repeat-use requirements", "Only recommend when included in the confirmed range"],
  ["Mini Board", "Small-format board", "Single portions and small desserts", "Shape and finish confirmed by project"],
];

export default function BakeryPackagingPage({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const cakeBoxes = packagingCategories.find((item) => item.slug === "cake-boxes");
  const cakeBoards = packagingCategories.find((item) => item.slug === "cake-boards-cake-drums");
  return (
    <div className="texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-14 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-20">
          <div>
            <p className="kh-eyebrow">Kehong · Bakery Packaging</p>
            <h1 className="kh-editorial-heading mt-4 text-4xl sm:text-6xl">
              {isZh ? "从蛋糕盒到承托底板，按烘焙场景选择" : "Bakery packaging built around presentation, support and transport."}
            </h1>
            <p className="kh-lede mt-6 max-w-2xl">
              {isZh
                ? "将蛋糕盒、纸板底托、蛋糕鼓和内托分开比较，围绕尺寸、开窗、携带、展示和运输需求提交项目。"
                : "Compare cake boxes, cake boards, cake drums and inserts by the job they need to do: presentation, support, carrying or transport."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products/cake-boxes" className="kh-button kh-button-primary">
                Explore cake boxes <ArrowRight className="size-4" />
              </Link>
              <Link href="/products/cake-boards-and-drums" className="kh-button kh-button-secondary">
                Compare cake boards
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-(--kh-line)">
            <Image
              src={showcaseImages.cakeBoardReal}
              alt="Cake board and bakery packaging reference"
              fill
              sizes="(min-width: 1024px) 40vw, 95vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-(--kh-ink)/55 to-transparent" />
            <p className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[.16em] text-white">
              Bakery packaging reference
            </p>
          </div>
        </section>

        <section className="border-y border-(--kh-line) bg-(--kh-surface)">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
            {[cakeBoxes, cakeBoards].filter(Boolean).map((item) => (
              <article key={item!.slug} className="rounded-lg border border-(--kh-line) bg-(--kh-paper) p-6">
                <p className="kh-eyebrow">{item!.slug === "cake-boxes" ? "01" : "02"}</p>
                <h2 className="mt-2 text-3xl font-semibold">{item!.title.en}</h2>
                <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{item!.description.en}</p>
                <ul className="mt-5 grid gap-2">
                  {item!.subcategories.slice(0, 7).map((sub) => (
                    <li key={sub} className="flex gap-2 text-sm font-medium text-(--kh-ink)">
                      <Check className="mt-1 size-4 shrink-0 text-(--kh-brass)" />
                      {sub}
                    </li>
                  ))}
                </ul>
                <Link
                  href={item!.slug === "cake-boxes" ? "/products/cake-boxes" : "/products/cake-boards-and-drums"}
                  className="kh-text-link mt-6"
                >
                  View range <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="overflow-x-auto rounded-lg border border-(--kh-line) bg-(--kh-surface)">
            <table className="min-w-[760px] w-full text-left text-sm">
              <caption className="border-b border-(--kh-line) px-5 py-4 text-left text-2xl font-semibold">
                Cake Board vs Cake Drum vs MDF / Masonite vs Mini Board
              </caption>
              <thead className="bg-(--kh-paper) text-xs uppercase tracking-[.12em] text-(--kh-brass)">
                <tr>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Construction</th>
                  <th className="px-5 py-3">Best use</th>
                  <th className="px-5 py-3">Surface / edge</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-t border-(--kh-line)">
                    <th className="px-5 py-4 font-bold">{row[0]}</th>
                    {row.slice(1).map((cell) => (
                      <td key={cell} className="px-5 py-4 leading-6 text-(--kh-muted)">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-lg border border-(--kh-line) bg-(--kh-brass-soft) p-6">
            <h2 className="text-2xl font-semibold text-(--kh-ink)">How to choose</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-(--kh-ink)">
              Everyday single-layer cake: start with a Cake Board. Heavier or multi-layer presentation: review a Cake Drum. Rigid or repeat-use directions: ask whether MDF/Masonite is part of the confirmed range. Small desserts: consider a Mini Board.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
