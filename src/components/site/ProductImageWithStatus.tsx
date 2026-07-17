import Image from "next/image";
import type { ProductSku } from "@/lib/catalog";
import { getSkuImageMeta } from "@/lib/productImages";

type Props = {
  sku: ProductSku;
  locale: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  imageIndex?: number;
};

const visualPools: Record<string, string[]> = {
  "paper-cup-fan": [
    "/images/ai-generated/category/ai-category-paper-cup-fan-v2.webp",
    "/images/ai-generated/category/ai-category-paper-cup-fan.webp",
    "/images/web/paper-cup-stacks.jpg",
    "/images/web/paper-cups.jpg",
  ],
  "kraft-paper": [
    "/images/ai-generated/category/ai-category-kraft-paper-roll-sheet.webp",
    "/images/ai-generated/category/ai-category-kraft-corrugated-v2.webp",
    "/images/web/kraft-packaging-box.jpg",
    "/images/web/white-paper-box.jpg",
    "/images/web/corrugated-cardboard-sheet.jpg",
    "/images/web/bakery-kraft-window-box.jpg",
    "/images/web/donut-packaging-boxes.jpg",
    "/images/web/unsplash/paper-food-packaging.jpg",
  ],
  "white-cardboard": [
    "/images/ai-generated/category/ai-category-white-cardboard.webp",
    "/images/kehong/showcase/gold-board-stack.webp",
    "/images/web/white-paper-box.jpg",
    "/images/kehong/showcase/food-paper-box-detail.webp",
  ],
  "corrugated-fluted-paper": [
    "/images/ai-generated/category/ai-category-corrugated-fluted-paper.webp",
    "/images/web/corrugated-cardboard-sheet.jpg",
    "/images/kehong/showcase/optimized/structure-material-real.jpg",
    "/images/kehong/showcase/honeycomb-paper-roll.webp",
  ],
  "paper-insert": [
    "/images/ai-generated/category/ai-category-paper-insert.webp",
    "/images/ai-generated/category/ai-category-paper-insert-pad-v2.webp",
    "/images/kehong/showcase/custom-box-display-open.webp",
    "/images/kehong/showcase/pink-structural-box.webp",
  ],
  "paper-pad": [
    "/images/ai-generated/category/ai-category-paper-pad.webp",
    "/images/kehong/showcase/optimized/cake-board-real.jpg",
    "/images/kehong/showcase/optimized/cake-board-real-02.jpg",
    "/images/kehong/showcase/food-paper-box-open.webp",
  ],
  "food-packaging-box": [
    "/images/ai-generated/category/ai-category-food-packaging-box-v2.webp",
    "/images/ai-generated/category/ai-category-food-packaging-box.webp",
    "/images/web/bakery-kraft-window-box.jpg",
    "/images/web/donut-packaging-boxes.jpg",
  ],
  "paper-packaging-material": [
    "/images/ai-generated/category/ai-category-food-grade-packaging-material.webp",
    "/images/ai-generated/category/ai-category-pe-coated-paper-sheet.webp",
    "/images/kehong/showcase/color-material-swatch.webp",
    "/images/web/paper-cup-stacks.jpg",
  ],
  "specialty-paper": [
    "/images/ai-generated/category/ai-category-specialty-paper.webp",
    "/images/kehong/showcase/color-material-swatch.webp",
    "/images/kehong/showcase/gold-board-stack.webp",
    "/images/web/factory-paper-worktable.jpg",
  ],
};

function diverseVisual(sku: ProductSku, fallback: string, exact: boolean, imageIndex?: number) {
  if (exact) return fallback;
  const pool = visualPools[sku.productType];
  if (!pool?.length) return fallback;
  const checksum = Array.from(sku.sku).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = imageIndex === undefined ? checksum % pool.length : imageIndex % pool.length;
  return pool[index] ?? fallback;
}

export default function ProductImageWithStatus({
  sku,
  locale,
  priority = false,
  sizes,
  className = "object-cover",
  imageIndex,
}: Props) {
  const image = getSkuImageMeta(sku, locale);
  return (
    <>
      <Image
        src={diverseVisual(sku, image.src, image.status === "exact", imageIndex)}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
      {image.status !== "exact" ? (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/25 bg-[#171713]/65 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {locale === "zh" ? "参考渲染图" : "Reference rendering"}
        </span>
      ) : null}
    </>
  );
}
