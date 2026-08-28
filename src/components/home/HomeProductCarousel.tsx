"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export type HomeProductCarouselItem = {
  id: string;
  href: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  systemLabel: string;
};

export default function HomeProductCarousel({
  items,
  isZh,
  compact = false,
}: {
  items: HomeProductCarouselItem[];
  viewLabel: string;
  isZh: boolean;
  compact?: boolean;
}) {
  if (!items.length) return null;

  const itemGroup = (duplicate: boolean) => (
    <div className="kh-product-conveyor-group" aria-hidden={duplicate || undefined}>
      {items.map((item) => (
        <Link
          key={`${duplicate ? "duplicate-" : ""}${item.id}`}
          href={item.href}
          data-testid="homepage-product-entry"
          className="kh-product-conveyor-card"
          tabIndex={duplicate ? -1 : undefined}
        >
          <span className="kh-product-conveyor-media">
            <Image src={item.image} alt={duplicate ? "" : item.alt} fill sizes="9rem" className="object-cover" loading={duplicate ? "lazy" : "eager"} />
          </span>
          <span className="kh-product-conveyor-copy">
            <strong>{item.title}</strong>
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div
      className={`kh-product-carousel kh-product-conveyor${compact ? " is-compact" : ""}`}
      data-testid="homepage-product-systems"
      role="region"
      aria-roledescription="carousel"
      aria-label={isZh ? "主营产品" : "Main products"}
    >
      <div className="kh-product-conveyor-viewport">
        <div className="kh-product-conveyor-track">
          {itemGroup(false)}
          {itemGroup(true)}
        </div>
      </div>
    </div>
  );
}
