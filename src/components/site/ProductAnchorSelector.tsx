"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

export type AnchorVariantOption = {
  sku: string;
  slug: string;
  title: string;
  material: string;
  form: string;
  gsm: string;
  coating: string;
  size: string;
  application: string;
};

type Props = {
  locale: string;
  variants: AnchorVariantOption[];
  labels: { material: string; form: string; gsm: string; coating: string; size: string; application: string; selected: string; viewFullRecord: string; requestQuote: string; realRecordNote: string };
};

const fields = ["material", "form", "gsm", "coating", "size", "application"] as const;
type SelectorField = (typeof fields)[number];

export default function ProductAnchorSelector({ locale, variants, labels }: Props) {
  const [selection, setSelection] = useState<Partial<Record<SelectorField, string>>>({});
  const selected = useMemo(() => variants.find((variant) => fields.every((field) => !selection[field] || variant[field] === selection[field])) ?? variants[0], [selection, variants]);
  const optionsFor = (field: SelectorField) => [...new Set(variants.map((variant) => variant[field]).filter(Boolean))];
  const detailHref = `/${locale}/products/${selected.slug}`;
  const quoteHref = `/${locale}/contact?interest=structure-review&product=${encodeURIComponent(selected.slug)}&sku=${encodeURIComponent(selected.sku)}&family=cup`;

  return (
    <section className="kh-panel mt-8 p-5 sm:p-7" aria-labelledby="anchor-selector-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kh-eyebrow">{labels.selected}</p>
          <h2 id="anchor-selector-title" className="mt-2 text-2xl font-semibold text-(--kh-ink)">{selected.title}</h2>
        </div>
        <span className="kh-mono text-xs text-(--kh-muted)">{selected.sku}</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => {
          const label = labels[field];
          return (
            <label key={field} className="grid gap-2 text-sm font-semibold text-(--kh-ink)">
              <span>{label}</span>
              <select value={selection[field] ?? ""} onChange={(event) => setSelection((current) => ({ ...current, [field]: event.target.value || undefined }))} className="min-h-11 rounded-md border border-(--kh-line) bg-(--kh-surface) px-3 text-sm text-(--kh-ink)">
                <option value="">{selected[field] || "—"}</option>
                {optionsFor(field).filter((value) => value !== selected[field]).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          );
        })}
      </div>
      <p className="mt-5 border-t border-(--kh-line) pt-4 text-sm leading-6 text-(--kh-muted)">{labels.realRecordNote}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={detailHref} className="kh-button kh-button-ghost">{labels.viewFullRecord}</Link>
        <Link href={quoteHref} className="kh-button kh-button-dark">{labels.requestQuote}</Link>
      </div>
    </section>
  );
}
