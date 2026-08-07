export type InquirySeed = {
  productGroupId?: string;
  productGroupTitle?: string;
  sku?: string;
  skuTitle?: string;
  name?: string;
  url?: string;
  interestId?: string;
  interestLabel?: string;
  interestProductType?: string;
};

export function hasProductContext(seed: InquirySeed) {
  return Boolean(seed.productGroupTitle || seed.name || seed.sku || seed.url);
}

export function getProductContextLabel(seed: InquirySeed) {
  return seed.productGroupTitle ?? seed.name ?? seed.sku ?? seed.url ?? "";
}

/** A product and an inquiry intent are separate facts; never merge their text. */
export default function InquiryContext({ locale, seeds }: { locale: string; seeds: InquirySeed[] }) {
  const zh = locale === "zh";
  const product = seeds.find(hasProductContext);
  const interest = seeds.find((seed) => seed.interestLabel);
  if (!product && !interest) return null;
  return (
    <div className="mt-3 grid gap-2">
      {product ? <p className="rounded-md bg-(--kh-paper) px-3 py-2 text-sm font-semibold text-(--kh-forest)">{zh ? "已选产品：" : "Selected product: "}{getProductContextLabel(product)}</p> : null}
      {interest?.interestLabel ? <p className="rounded-md bg-(--kh-paper) px-3 py-2 text-sm font-semibold text-(--kh-forest)">{zh ? "已选服务需求：" : "Selected request: "}{interest.interestLabel}</p> : null}
    </div>
  );
}
