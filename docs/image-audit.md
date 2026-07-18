# Kehong image usage audit

This checklist records the local image assets reviewed for the homepage and the lightweight 3D fallback. It is intentionally conservative: image files that contain promotional text, third-party marks, or an embedded Chinese interface are not treated as clean brand photography.

| Asset | Current condition | Approved use in the site | Follow-up |
| --- | --- | --- | --- |
| `public/images/kehong/showcase/automatic-feeder-line.webp` | Real factory equipment photo; visible FENGCHI / Chinese machine branding | Hero and manufacturing proof, cropped portrait (4:5 or 3:4) | Confirm the equipment-brand treatment is permitted, or reshoot with the mark out of frame |
| `public/images/kehong/showcase/precision-machine-closeup.webp` | Real machine close-up; no promotional poster layout | Manufacturing proof, 4:3 crop | Keep as supporting process evidence |
| `public/images/kehong/showcase/sample-room-boxes.webp` | Real sample-room / packaging view | Selected solutions or application proof, 3:2 crop | Confirm the scene is company-owned and current |
| `public/images/kehong/showcase/custom-box-display-wide.webp` | Real packaging display, neutral composition | Finished-packaging solution card, 3:2 crop | Confirm product ownership and current availability |
| `public/images/kehong/showcase/custom-box-display-open.webp` | Packaging image with an OrinsCare mark | Anonymous application only if permission is documented | Obtain written permission or replace with an unbranded sample |
| `public/images/kehong/showcase/orins-pizza-box-collage.webp` | Branded OrinsCare collage | Not used as a named customer case; anonymous application only if permission is documented | Obtain written permission or replace |
| `public/images/kehong/showcase/food-paper-box-open.webp` | Food-box collage; one crop includes a red embedded mark | Lightweight 3D/static fallback and packaging support | Replace with a clean, unbranded structural photo when available |
| `public/images/kehong/factory.webp` | Text-heavy promotional poster with logos and embedded copy | Do not use as hero or main visual | Replace with a clean factory exterior/interior photograph |
| `public/images/kehong/process.webp` | Text-heavy “OUR PROCESS” poster | Do not use as hero or main visual | Replace with clean process photography or diagrams |
| `public/images/kehong/products.webp` | Text-heavy “PRODUCT DISPLAY” poster | Do not use as hero or main visual | Replace with a clean product/application image |
| `public/images/web/studio-pizza-preview.webp` | Static preview contains Chinese UI labels | Deprecated for English fallback; no longer referenced by the 3D Studio fallback | Replace with a clean English or UI-free render |

## Reshoot / approval list

1. A clean factory exterior or production-floor image without poster text or third-party logos.
2. A machine-line photograph with permission to show visible equipment branding, or a crop that removes the branding.
3. A UI-free, English-neutral 3D product render for the mobile/static fallback.
4. Unbranded packaging samples for anonymous application examples, unless written permission exists for every visible third-party mark.

Until these assets are supplied or approved, the site avoids invented customer names, certifications, production figures, and performance claims.
