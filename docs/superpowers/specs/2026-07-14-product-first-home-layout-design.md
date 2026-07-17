# Product-first home layout design

## Goal

Reorder the Kehong homepage around B2B product discovery and RFQ conversion, using Ecopaperbox's product-led information architecture as a reference without copying its copy or visual identity.

## Design

- Simplify the global header to the highest-value destinations: Products, Solutions, Factory, Process, and Contact, with WhatsApp and RFQ actions retained.
- Keep the hero focused on one factory-backed value proposition, two primary actions, and one dominant factory/product image. Reduce floating proof cards and defer 3D to a secondary entry point.
- Move a two-cabinet product choice immediately after the hero: one cabinet for semi-finished materials and one cabinet for finished packaging. Each cabinet links to the existing product catalog with a prefilled query/category path.
- Within the two cabinets, use the existing product showcase and solution components instead of adding a new catalog system.
- Place a compact procurement proof strip after product families, followed by industry/use-case solutions, featured products with GSM/material entry points, process/factory proof, and the final inquiry band.
- Preserve existing multilingual routing, visual assets, inquiry links, and mobile sticky actions.

## Constraints

- Do not remove product data, image audit metadata, or internal source records.
- Do not promote representative or AI-generated visuals as exact product photography.
- Keep all existing routes working and keep the 3D studio available from its own section/route.
- Use the existing Tailwind classes, components, and local imagery; no new dependency.

## Success criteria

- The first viewport has one clear headline, no more than two primary CTAs, and one dominant visual.
- Product discovery appears before the long procurement/process sections.
- Semi-finished materials and finished packaging are visually separated as two equal primary choices.
- Desktop navigation has no more than five primary content destinations plus contact actions.
- Mobile remains readable with a visible inquiry action and no horizontal overflow.
- `pnpm lint` and `pnpm build` pass.
