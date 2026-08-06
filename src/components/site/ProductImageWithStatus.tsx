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

export default function ProductImageWithStatus({
  sku,
  locale,
  priority = false,
  sizes,
  className = "object-cover",
  imageIndex,
}: Props) {
  const image = getSkuImageMeta(sku, locale);
  // Kept for API compatibility with existing catalog callers. Images are intentionally no longer randomized.
  void imageIndex;
  return (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
      {image.status !== "exact" && image.status !== "ai-representative" ? (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/25 bg-(--kh-ink)/75 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          {image.statusLabel}
        </span>
      ) : null}
    </>
  );
}
