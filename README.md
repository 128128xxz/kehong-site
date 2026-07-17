# Kehong Paper Independent Site

Multilingual B2B showcase and inquiry site for Foshan Kehong Paper Products Co., Ltd.

The site is built for overseas lead generation, domestic credibility, and later SKU expansion. It presents Kehong's factory story, product families, searchable SKU catalog, product detail pages, and contact / WhatsApp inquiry flow.

## Languages

- English: `/en` (the root `/` redirects here)
- Chinese: `/zh`
- Spanish: `/es`
- Indonesian: `/id`
- Vietnamese: `/vi`
- Thai: `/th`
- Malay: `/ms`

## Product Data

The catalog is generated from an Excel file into `src/data/catalog.json`.

To update products later, add rows to the source spreadsheet and run:

```bash
KEHONG_CATALOG_XLSX="/absolute/path/to/Kehong_Paper_Products_SKU_Price_List_With_Shirong_Alibaba.xlsx" pnpm import:catalog
```

Each imported product gets:

- Product family
- SKU slug for detail pages
- Material / GSM / structure / process fields
- MOQ, unit, application, and custom support

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
pnpm validate:product-assets
pnpm validate:image-refs
pnpm validate:asset-refs
pnpm validate:ai-assets
pnpm validate:image-candidates
pnpm audit:product-data
pnpm lint
pnpm typecheck
pnpm validate:sitemap
pnpm build
pnpm site:health -- --base-url=https://www.kehong.tech
```

Current review notes and the next Codex prompt are in:

- `docs/WEBSITE_ISSUE_ANALYSIS_20260709.md`
- `docs/CODEX_OPTIMIZATION_PROMPT_20260709.md`
- `docs/CHANGELOG_20260709.md`

## Deployment Notes

Set the final domain in `.env.local` before deployment:

```bash
NEXT_PUBLIC_SITE_URL=https://www.kehong.tech
```

Then submit `/sitemap.xml` to Google Search Console after the domain is live.

The production monitor runs from `/api/site-monitor`. On the current Vercel Hobby plan, the bundled Cron runs once daily at 03:00 UTC; the endpoint is ready for an external 5-minute scheduler or for switching the Cron expression back to `*/5 * * * *` after upgrading to Vercel Pro. It checks the public pages, robots.txt, sitemap.xml and a fixed product page, and sends an alert to `SITE_MONITOR_ALERT_EMAIL` when a failure is detected. Protect the monitor with `CRON_SECRET` in production.

## Attribution

This project started from the MIT-licensed `S0vers/i18n-Nextjs-BoilerPlate` template and was rebuilt for Kehong's multilingual catalog and inquiry workflow. Product copy, catalog data, and Kehong visual materials belong to Foshan Kehong Paper Products Co., Ltd.
