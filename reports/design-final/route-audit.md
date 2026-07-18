# Final route and conversion audit

## Homepage routes retained

- Products: `/en/products`
- Materials: `/en/products?system=materials`
- Finished packaging: `/en/products?system=packaging`
- Solutions: existing product search/query routes
- Factory: `/en/factory`
- Process: `/en/process`
- 3D Studio: `/en/model-preview`
- Buyer Support: `/en/procurement`
- Quote: `/en/contact`

## Findings

- No homepage primary navigation anchor or `href="#"` is required.
- Header desktop mode remains above approximately 1160px; 1024px remains compact.
- Selected Products and Contact prefill are existing tested flows and must not be refactored.
- Product-system query parameters and search parameters are public behavior and must remain stable.
- Product cards, details, factory, process, procurement, model preview, and contact require continuity checks rather than route changes.

## Acceptance

Automated regression must cover direct route load, browser back, query persistence, Selected Products persistence, Contact prefill, active navigation, and real success/failure form states with mocked provider responses.
