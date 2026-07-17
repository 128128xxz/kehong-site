# Product-first home layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the Kehong homepage into a product-first B2B sourcing flow inspired by Ecopaperbox's clear category-led structure.

**Architecture:** Keep the existing homepage component system and local imagery, but change composition and navigation rather than adding a new page framework. The homepage becomes hero → two product cabinets (semi-finished materials / finished packaging) → procurement proof → solutions → featured products/spec entry → factory/process → inquiry.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS, lucide-react, next-intl.

## Global Constraints

- Preserve all existing routes and multilingual routing.
- Preserve internal image/source audit metadata even when source explanations are not shown in the UI.
- Do not mark representative or AI-generated visuals as exact product photography.
- Do not add dependencies.
- Keep mobile inquiry actions visible and prevent horizontal overflow.

### Task 1: Simplify the global navigation

**Files:**
- Modify: `src/components/site/Header.tsx`

- [ ] **Step 1: Write the failing test**

Use the existing production build as the regression test target: the header must compile with the reduced nav item list and preserve `/contact`, WhatsApp, and RFQ links.

- [ ] **Step 2: Implement the minimal navigation change**

Reduce `navItems` to Home, Products, Factory, Process, and Procurement. Keep Studio and Bakery available from homepage sections, but remove them from the primary desktop nav so the header reads as a sourcing path rather than a feature index. Keep the mobile menu links intact for the same five destinations plus the existing contact CTA.

- [ ] **Step 3: Verify**

Run `pnpm lint` and confirm no TypeScript or ESLint errors.

### Task 2: Recompose the homepage section order

**Files:**
- Modify: `src/components/pages/HomeIndex.tsx`

- [ ] **Step 1: Implement the product-first order**

Render the sections in this order: `CinematicHero`, `ProductShowcase`, `BuyerDecisionBrief`, `B2BProcurementSections`, `BakeryPackagingFocus`, `SolutionExplorer`, `ProcessPreview`, `CaseGallery`, `Product3DStudio`, `ProcurementAssurance`, and `InquiryBand`. `ProductShowcase` must begin with two equal cabinet cards: semi-finished materials and finished packaging.

- [ ] **Step 2: Verify**

Run `pnpm build` and confirm all locale home routes generate successfully.

### Task 3: Reduce hero density and clarify the primary action

**Files:**
- Modify: `src/components/site/CinematicHero.tsx`

- [ ] **Step 1: Implement the minimal hero change**

Keep the factory-backed headline, product chips, dominant factory image, and two primary actions (RFQ and product specs). Remove the third 3D CTA from the primary button row and remove the three small proof cards from the first viewport. Add a single compact trust line below the buttons that points to factory, sampling, and export capability. Keep the 3D destination available later in the page.

- [ ] **Step 2: Verify**

Run `pnpm lint` and inspect the desktop/mobile class combinations for no overflow.

### Task 4: Make the product showcase the first post-hero decision surface

**Files:**
- Modify: `src/components/site/ProductShowcase.tsx` only if required by the new position
- Modify: `src/components/pages/HomeIndex.tsx`

- [ ] **Step 1: Implement the two-cabinet choice**

Add two visually equal cards at the top of `ProductShowcase`: `Semi-finished materials` (`半成品材料`) with paper cup fan, cupstock rolls, kraft, white board, corrugated/fluted and specialty paper examples; and `Finished packaging` (`成品包装`) with food boxes, paper boxes, trays/inserts, bakery packaging and display packaging examples. Each card must include one clear CTA and link to `/products` with a query that the catalog already understands.

- [ ] **Step 2: Verify existing anchors**

Confirm the product showcase exposes `id="product-window"` and its CTA links to `/products` or the existing product section. Do not duplicate catalog data.

- [ ] **Step 3: Verify**

Run `pnpm build` and confirm the homepage anchor links remain valid.

### Task 5: Final regression verification

**Files:**
- No new files.

- [ ] **Step 1: Run checks**

Run:

```bash
pnpm lint
pnpm build
pnpm validate:product-assets
pnpm validate:image-refs
pnpm validate:asset-refs
```

- [ ] **Step 2: Confirm acceptance criteria**

Confirm the hero has one dominant visual and no more than two primary CTAs, the product showcase follows immediately after it, the nav is five primary destinations, and the mobile build has no overflow.
