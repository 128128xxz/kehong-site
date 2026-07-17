# Kehong Independent Site Design

## Goal

Build a low-budget, premium-feeling independent website for Foshan Kehong Paper Products Co., Ltd. The site should prioritize overseas inquiry generation, still work as a domestic brand/product showcase, and support ongoing SKU expansion without code changes for every new product.

## Business Positioning

Kehong is positioned as a professional paper packaging material manufacturer and corrugated paper expert. The site should emphasize:

- Founded in 2001, with 20+ years of production experience.
- 8000+ square meter factory area.
- Corrugated paper, specialty paper, kraft paper, white cardboard, food-grade paper, gold/silver cardboard, paper boxes, inner trays, paper pads, pizza boxes, and custom logo or multi-material finishing.
- Applications across food, cosmetics, electronics, daily necessities, gift packaging, retail display, cushioning, and brand packaging.
- Capabilities including material supply, structural design, die-cutting, creasing, laminating, embossing, coating, slitting, anti-counterfeit finishing, fast sampling, low MOQ/flexible orders, and custom processes.

## Budget Constraint

The first version must avoid paid infrastructure where practical:

- Use a free open-source GitHub template as the foundation.
- Use static or file-based product data instead of a paid CMS or database.
- Use free hosting first, such as Vercel or Netlify free tier.
- Use WhatsApp, email, and a simple inquiry form flow before adding paid CRM tools.
- Expect the main external cost to be the domain name.

## Language Strategy

The site architecture should support many languages, but content quality should be prioritized in phases.

Launch languages:

- English
- Simplified Chinese
- Spanish
- Indonesian
- Vietnamese
- Thai
- Malay

Reserved Southeast Asia languages:

- Tagalog / Filipino
- Burmese
- Khmer
- Lao

Each language should have localized routes, SEO metadata, hreflang tags, language switcher, and localized inquiry CTA text. English should be the canonical working language for product SEO and international buyers. Chinese remains available for domestic buyers and internal review.

## Recommended Technical Approach

Use a GitHub open-source template as a starting point, then adapt it into a data-driven B2B product site.

Recommended direction:

- Next.js + TypeScript + Tailwind CSS.
- next-intl or equivalent i18n routing.
- File-based product catalog using JSON or Markdown/MDX generated from Excel.
- Product and SKU pages generated from structured data.
- Inquiry cart / quote request drawer storing selected SKUs client-side.
- Static deployment first, with optional serverless form handler later.

Why not a paid CMS for version 1:

- The budget is low.
- The product source already exists in Excel.
- Adding a CMS now increases setup and maintenance cost.
- A clean import workflow from Excel to JSON gives enough flexibility for the first release.

## GitHub Template Direction

The selected template should be judged by:

- Active maintenance.
- Clear license.
- Good mobile layout.
- Strong SEO baseline.
- Easy i18n integration.
- Clean component structure.
- Visual quality suitable for B2B manufacturing.

Candidate templates already considered:

- arthelokyo/astrowind: strong open-source Astro template, fast and SEO-friendly, but heavier customization is needed for advanced SKU interactions.
- mearashadowfax/ScrewFast: polished Astro industrial/business template, visually close to B2B needs, but i18n/product-database support needs added.
- TencentEdgeOne/enterprise-website-template: enterprise Next.js direction, but low stars and less validation.
- ixartz/Next-JS-Landing-Page-Starter-Template: solid Next.js landing starter, but more landing-page oriented.
- weijunext/nextjs-starter: multilingual Next.js starter, useful for i18n structure but less visually specific to manufacturing.

Preferred route: choose a Next.js multilingual starter or enterprise template as the technical base, then build Kehong-specific manufacturing/product sections and interactions on top.

## Site Structure

Primary navigation:

- Home
- Products
- Materials
- Process
- Factory
- Applications
- About
- Contact

Core pages:

- Home: premium hero, factory credibility, product family entry, process preview, application sections, inquiry CTA.
- Products: searchable/filterable product catalog with family, material, GSM/thickness, structure/flute, process, application, MOQ, and custom support filters.
- Product Detail: product overview, SKU variants, material/process options, applications, inquiry CTA, related products.
- Materials: kraft paper, corrugated/fluted paper, white cardboard, food-grade paper, specialty paper, gold/silver cardboard, colored corrugated board.
- Process: interactive production flow from raw material to finished packaging.
- Factory: capacity, equipment, quality control, stable production, packaging and delivery.
- Applications: food packaging, cosmetics packaging, electronics packaging, daily necessities, gift packaging, display/retail, cushioning/inner support.
- About: company story, capabilities, values, factory facts.
- Contact: WhatsApp, phone, email, address, inquiry form, downloadable inquiry checklist.

## Product Data Model

The website should use a normalized catalog model derived from the existing Excel workbook.

Product family fields:

- id
- slug
- category
- title by locale
- description by locale
- materials
- processes
- applications
- hero image
- gallery images
- featured flag

SKU fields:

- sku
- productFamilyId
- category
- productName by locale
- englishName
- material
- gsmOrThickness
- color
- structureOrFlute
- surfaceProcess
- finishingProcess
- commonSize
- moq
- industries
- applications
- image
- unit
- customizable
- source
- sourceReferencePrice
- productLink
- notes by locale

Pricing fields should be hidden or inquiry-only by default because the spreadsheet notes say final pricing depends on customer requirements, material, GSM/thickness, size, process, print colors, quantity, packaging, trade terms, exchange rate, and raw material cost.

## SKU Maintenance Workflow

Version 1 should support a simple maintenance loop:

1. User updates the Excel product workbook with new rows.
2. A local import script converts selected sheets into normalized JSON.
3. The website reads the generated JSON to create product cards, filter options, and detail pages.
4. Missing translations fall back to English or Chinese until refined.

The import should initially handle:

- Semi-finished Paper Materials
- Paper Boxes & Packaging
- Cup Fan SKU

It should ignore source-reference-only rows unless explicitly marked for publication.

## Interaction Design

The site should feel more premium and interactive than a basic brochure while staying lightweight.

Planned interactions:

- Language switcher with localized URL paths.
- Product finder with filters for material, application, process, structure/flute, and customization.
- Inquiry cart / quote drawer where buyers add SKUs and send a structured request.
- Process timeline with scroll or tab-based steps: die-cutting, corrugated board production/converting, dyeing/slitting, laminating/film sealing.
- Material comparison cards showing rigidity, finish, moisture resistance, food suitability, and recommended uses.
- Factory capability counters for years, factory area, material supply, sampling support, and low MOQ/flexible order.
- Sticky WhatsApp/email inquiry action on product and mobile pages.

Avoid heavy, paid, or fragile interaction frameworks in version 1.

## Visual Direction

The selected direction is **Cinematic Factory Hero**. The homepage should feel like a premium international manufacturing website: dark deep-green hero, real factory imagery, restrained gold accents, strong manufacturing proof points, and a direct inquiry path.

The current brochure uses green, white, and gold. The website should keep the recognizability but make it more premium:

- Deep green as brand anchor.
- White/off-white for clean manufacturing credibility.
- Controlled gold accent for quality/premium cues.
- Real factory/product photos should be preferred over generic stock imagery.
- Product cards should be clean and dense enough for B2B buyers.
- Avoid over-marketing SaaS-style hero sections; this is a manufacturing/product inquiry site.

Homepage visual requirements:

- First screen uses the real factory photo as the dominant asset.
- Hero copy must establish Kehong as a factory-backed paper packaging manufacturer, not a generic trading brochure.
- Above-the-fold proof points include 20+ years, 8000+ m2 factory, stable material supply, fast sampling, and low MOQ/flexible orders.
- Primary CTA is Request Quote. Secondary CTA is Explore Products.
- The design can be visually rich, but all decoration must support trust, sourcing, product discovery, or inquiry conversion.

## Inquiry Flow

Primary CTAs:

- Request Quote
- Send Inquiry
- WhatsApp
- Ask for Sample

Inquiry form fields:

- Name
- Company
- Country / Region
- Email
- WhatsApp / phone
- Interested product or SKU
- Material / GSM / size / process notes
- Estimated quantity
- Target application
- Message

For low budget, the first implementation can use mailto/WhatsApp prefilled messages or a simple form handler. A paid CRM is out of scope for version 1.

## SEO Strategy

Each product family and application page should have localized metadata:

- Title
- Description
- Open Graph title/description
- hreflang links
- canonical URL

Important English keyword themes:

- custom corrugated paper board
- fluted paper packaging material
- food grade paper packaging
- paper cup fan raw material
- custom paper box manufacturer
- kraft paper packaging material
- gold silver cardboard packaging
- cosmetic inner tray paper packaging

Spanish and Southeast Asian keywords should initially be translated and later refined based on search data.

## Error Handling

- If a product row is missing localized content, fall back to English, then Chinese.
- If an image is missing, show a clean placeholder and keep the inquiry action available.
- If no products match filters, show a helpful reset state and an inquiry CTA.
- If the inquiry form cannot submit, provide WhatsApp and email fallback.
- If a locale is not fully translated, keep route available but use graceful fallback content.

## Testing And Verification

Before delivery:

- Verify all launch language routes load.
- Verify language switcher keeps equivalent page paths where possible.
- Verify product filters work on desktop and mobile.
- Verify SKU data imports from the workbook into valid JSON.
- Verify product detail pages render from imported SKU data.
- Verify inquiry cart/drawer collects selected products.
- Verify WhatsApp/email fallback message includes selected SKU data.
- Check mobile layout for no text overflow or overlapping UI.
- Run build/lint checks for the chosen framework.
- Use browser screenshot checks for home, products, product detail, and contact pages.

## Version 1 Scope

Included:

- Multilingual website shell.
- Home, products, product detail, process, factory/about, contact pages.
- Excel-to-JSON product import.
- Product filtering.
- Inquiry cart or quote drawer.
- WhatsApp/email inquiry fallback.
- Free deployment preparation.

Deferred:

- Paid CMS.
- User accounts.
- Online payment.
- Live pricing calculator.
- CRM integration.
- Advanced analytics dashboard.
- Full human translation polishing for every Southeast Asian language.
