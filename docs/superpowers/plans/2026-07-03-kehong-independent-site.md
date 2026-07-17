# Kehong Independent Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a low-budget multilingual B2B website for Foshan Kehong Paper Products with a cinematic factory hero, product catalog, SKU-driven data, product filters, and inquiry actions.

**Architecture:** Start from the selected MIT Next.js i18n template, then replace the starter landing page with a Kehong-specific manufacturing site. Use static JSON generated from the Excel workbook for product data so SKU updates can happen without paid CMS or database services.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, next-intl, shadcn-style UI primitives, Excel-to-JSON import script, Vercel/Netlify-ready static-first deployment.

---

## File Structure

- `package.json`: project scripts and dependencies copied from the chosen Next.js i18n template.
- `src/app/[locale]/page.tsx`: localized homepage entry.
- `src/app/[locale]/products/page.tsx`: localized product catalog route.
- `src/app/[locale]/products/[slug]/page.tsx`: localized product detail route.
- `src/app/[locale]/contact/page.tsx`: localized inquiry/contact route.
- `src/components/site/*`: Kehong-specific page sections and shared UI.
- `src/data/catalog.json`: generated product family and SKU data.
- `src/data/company.ts`: company facts, capabilities, process steps, applications.
- `src/lib/catalog.ts`: catalog lookup and filtering helpers.
- `scripts/import-kehong-catalog.mjs`: convert the Excel product workbook into normalized JSON.
- `public/images/kehong/*`: brochure-derived factory, product, and process images.
- `dictionary/*.json`: localized site copy for launch languages.

## Task 1: Prepare The Next.js Base

**Files:**
- Create/modify root project files from `work/templates/i18n-nextjs-boilerplate`.
- Modify: `.gitignore`

- [ ] **Step 1: Copy template files**

Run:

```bash
rsync -a --exclude '.git' work/templates/i18n-nextjs-boilerplate/ ./
```

Expected: root contains `package.json`, `src/`, `dictionary/`, `next.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Preserve project-specific docs**

Run:

```bash
test -f docs/superpowers/specs/2026-07-03-kehong-independent-site-design.md
test -f docs/superpowers/plans/2026-07-03-kehong-independent-site.md
```

Expected: both commands exit successfully.

- [ ] **Step 3: Install dependencies**

Run:

```bash
PATH=/Users/a369/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/a369/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/a369/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm install
```

Expected: dependencies install and lockfile is present.

- [ ] **Step 4: Run baseline build**

Run:

```bash
PATH=/Users/a369/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/a369/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/a369/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm build
```

Expected: baseline template builds before Kehong changes.

## Task 2: Add Kehong Assets And Static Business Data

**Files:**
- Create: `public/images/kehong/factory.png`
- Create: `public/images/kehong/products.png`
- Create: `public/images/kehong/process.png`
- Create: `src/data/company.ts`

- [ ] **Step 1: Copy reference images**

Run:

```bash
mkdir -p public/images/kehong
cp work/kohon_intro/1/5fd4f6d8-72d5-4039-8982-dba0436e545c.png public/images/kehong/factory.png
cp work/kohon_intro/1/65416d3d-047f-42ee-a799-ab7e0f890e29.png public/images/kehong/products.png
cp work/kohon_intro/1/2fd44e42-2245-476c-91a9-07c64c83bfe8.png public/images/kehong/process.png
```

Expected: images load from `/images/kehong/...`.

- [ ] **Step 2: Create company data**

Create `src/data/company.ts` with facts, product families, process steps, applications, and contact details:

```ts
export const companyFacts = [
  { value: "20+", labelKey: "facts.years" },
  { value: "8000+", labelKey: "facts.factoryArea" },
  { value: "7", labelKey: "facts.launchLanguages" },
  { value: "MOQ", labelKey: "facts.flexibleOrders" },
];

export const processSteps = [
  { id: "die-cutting", titleKey: "process.dieCutting.title", textKey: "process.dieCutting.text" },
  { id: "corrugated", titleKey: "process.corrugated.title", textKey: "process.corrugated.text" },
  { id: "dyeing-slitting", titleKey: "process.dyeing.title", textKey: "process.dyeing.text" },
  { id: "laminating", titleKey: "process.laminating.title", textKey: "process.laminating.text" },
];

export const contact = {
  whatsapp: "+447599669700",
  phone: "+447599669700",
  email: "info@kehong.tech",
};
```

Expected: shared content can be imported without duplicating facts across pages.

## Task 3: Import Product Catalog From Excel

**Files:**
- Create: `scripts/import-kehong-catalog.mjs`
- Create: `src/data/catalog.json`
- Create: `src/lib/catalog.ts`

- [ ] **Step 1: Write import script**

Create `scripts/import-kehong-catalog.mjs` that reads the Excel workbook path from `KEHONG_CATALOG_XLSX`, extracts the three public sheets, normalizes rows, and writes `src/data/catalog.json`.

Required workbook path:

```text
/Users/a369/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_urp4lpan5xyg22_8cac/temp/RWTemp/2026-06/450469ba30f3d9876cf22ff20c59eab7/Kehong_Paper_Products_SKU_Price_List_With_Shirong_Alibaba.xlsx
```

Required output shape:

```json
{
  "families": [],
  "skus": []
}
```

- [ ] **Step 2: Add catalog helpers**

Create `src/lib/catalog.ts` with:

```ts
import catalog from "@/data/catalog.json";

export type ProductSku = (typeof catalog.skus)[number];
export type ProductFamily = (typeof catalog.families)[number];

export function getFamilies(): ProductFamily[] {
  return catalog.families;
}

export function getFeaturedSkus(limit = 12): ProductSku[] {
  return catalog.skus.slice(0, limit);
}

export function getSkuBySlug(slug: string): ProductSku | undefined {
  return catalog.skus.find((sku) => sku.slug === slug);
}
```

Expected: pages can render product data without touching import details.

- [ ] **Step 3: Run import**

Run:

```bash
KEHONG_CATALOG_XLSX="/Users/a369/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_urp4lpan5xyg22_8cac/temp/RWTemp/2026-06/450469ba30f3d9876cf22ff20c59eab7/Kehong_Paper_Products_SKU_Price_List_With_Shirong_Alibaba.xlsx" node scripts/import-kehong-catalog.mjs
```

Expected: `src/data/catalog.json` contains product families and SKU rows.

## Task 4: Build Cinematic Homepage

**Files:**
- Replace: `src/components/pages/HomeIndex.tsx`
- Create: `src/components/site/Header.tsx`
- Create: `src/components/site/CinematicHero.tsx`
- Create: `src/components/site/ProductShowcase.tsx`
- Create: `src/components/site/ProcessPreview.tsx`
- Create: `src/components/site/InquiryBand.tsx`
- Modify: `dictionary/*.json`

- [ ] **Step 1: Replace starter UI**

Remove template demo content and build sections:

```tsx
<Header />
<main>
  <CinematicHero />
  <ProductShowcase />
  <ProcessPreview />
  <InquiryBand />
</main>
```

Expected: homepage no longer mentions the starter template.

- [ ] **Step 2: Implement cinematic hero**

Hero requirements:

- Full-width dark green factory image background.
- KH brand lockup.
- Primary copy for paper packaging material manufacturing.
- Proof rows: 20+ years, 8000+ m2 factory, stable supply, fast sampling.
- Buttons: Request Quote and Explore Products.

- [ ] **Step 3: Add responsive checks**

Run:

```bash
pnpm lint
pnpm build
```

Expected: no lint or build failures.

## Task 5: Build Product Catalog And Inquiry Flow

**Files:**
- Create: `src/app/[locale]/products/page.tsx`
- Create: `src/app/[locale]/products/[slug]/page.tsx`
- Create: `src/components/site/ProductFilters.tsx`
- Create: `src/components/site/ProductGrid.tsx`
- Create: `src/components/site/InquiryDrawer.tsx`
- Create: `src/app/[locale]/contact/page.tsx`

- [ ] **Step 1: Product listing page**

Build filters for:

- category
- material
- process
- application
- customizable

Expected: product cards update without page navigation.

- [ ] **Step 2: Product detail page**

Each detail page shows:

- SKU
- English name
- localized product name
- material
- GSM/thickness
- structure/flute
- process
- MOQ
- application
- Request Quote CTA

- [ ] **Step 3: Inquiry flow**

Implement a lightweight client-side inquiry drawer:

- Add SKU to inquiry.
- Show selected SKU list.
- Generate WhatsApp message.
- Generate email subject/body fallback.

Expected: no backend required for version 1.

## Task 6: Local Verification And Handoff

**Files:**
- Modify as needed based on verification.

- [ ] **Step 1: Start local dev server**

Run:

```bash
pnpm dev
```

Expected: site opens locally.

- [ ] **Step 2: Browser verification**

Verify:

- Homepage loads.
- English, Chinese, Spanish, Indonesian, Vietnamese, Thai, and Malay routes load.
- Product catalog renders imported SKU data.
- Product detail page opens.
- Inquiry drawer creates WhatsApp/email message.
- Desktop and mobile layouts have no obvious overlap or clipped text.

- [ ] **Step 3: Final build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both pass before handoff.
