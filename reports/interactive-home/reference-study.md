# Kehong interactive-home reference study

Date: 2026-07-19  
Reference checkout: `/tmp/kehong-interaction-references`  
Scope: interaction patterns and implementation ideas only. No reference images, fonts, copy, logos, brand assets or page layouts were copied into Kehong.

## Repository studies

### codrops/MenuFullGrid

- Repository: https://github.com/codrops/MenuFullGrid (checkout `c2644d0`)
- License: MIT (`LICENSE`)
- Interaction pattern: a vertical menu selects a destination while a coordinated image gallery changes state; the selected item can then open an inner content page and return to the menu.
- Relevant source files: `src/js/menuController.js`, `src/js/menuItem.js`, `src/js/contentPage.js`, `src/js/utils.js`.
- Useful implementation idea: keep one selected route as the source of truth; separate preview selection from destination navigation, and make the back state explicit.
- Risk: the original relies on large, tightly timed GSAP timelines, viewport-relative transforms and document-level background changes. That can become disorienting or fragile on mobile.
- Whether it fits Kehong: yes, as a restrained route selector with a stable stage and explicit links.
- What must not be copied: the full-screen layout, Unsplash imagery, Codrops typography, cursor treatment and one-page content choreography.

### codrops/MenuToGrid

- Repository: https://github.com/codrops/MenuToGrid (checkout `f94d1da`)
- License: MIT (`LICENSE`)
- Interaction pattern: thumbnails in a menu row transition into positions in a content preview grid using GSAP Flip.
- Relevant source files: `src/js/index.js`, `src/js/row.js`, `src/js/previewItem.js`, `src/js/utils.js`.
- Useful implementation idea: map a thumbnail's identity to its destination card and preserve that identity while the layout changes.
- Risk: a literal FLIP expansion can imply an ecommerce gallery and adds layout complexity when image aspect ratios differ.
- Whether it fits Kehong: partially; the identity mapping fits, while the dramatic grid expansion is kept out of the production homepage and only abstracted in the lab.
- What must not be copied: the thumbnail grid, demo imagery, copy and full transition sequence.

### codrops/PreviewContentTransition

- Repository: https://github.com/codrops/PreviewContentTransition (checkout `04ac51c`)
- License: MIT (`LICENSE`)
- Interaction pattern: an editorial preview item expands into an independent content view, then closes back to the original context.
- Relevant source files: `src/js/item.js`, `src/js/index.js`, `src/js/magneticFx.js`, `src/js/utils.js`.
- Useful implementation idea: stage a clear preview first, then use a real destination link instead of trapping the buyer in an overlay.
- Risk: character splitting, magnetic cursors and large transform timelines are not necessary for a B2B buyer journey and can harm keyboard and reduced-motion behavior.
- Whether it fits Kehong: yes for the preview-to-route relationship; no for the decorative cursor layer.
- What must not be copied: the magazine layout, text-splitting effect, magnetic pointer, image set and copy.

### greensock/gsap

- Repository: https://github.com/greensock/GSAP (checkout `13e2b79`)
- License: GSAP Standard “no charge” license as declared in `package.json`; use the current terms at https://gsap.com/standard-license.
- Interaction pattern: framework-agnostic timelines, Flip layout transitions, easing, responsive `matchMedia` and optional gesture plugins.
- Relevant source files: `src/gsap-core.js`, `src/Flip.js`, `src/Observer.js`, `src/Draggable.js`, `src/index.js`.
- Useful implementation idea: use a single, interruptible transition model and keep responsive behavior declarative.
- Risk: adding GSAP only for hover/crossfade would increase bundle and maintenance cost; premium plugins also carry their own usage terms.
- Whether it fits Kehong: useful as a future option for a measured FLIP transition; not required by the current lab because the page uses Motion and existing React state.
- What must not be copied: the GSAP source, bonus-plugin examples, demos or any GreenSock branding.

### greensock/gsap-skills

- Repository: https://github.com/greensock/gsap-skills (checkout `aed9cfd`)
- License: MIT (`LICENSE`)
- Interaction pattern: agent guidance for choosing timelines, Flip, ScrollTrigger and cleanup patterns rather than a UI kit.
- Relevant source files: `skills/gsap-core/SKILL.md`, `skills/gsap-timeline/SKILL.md`, `skills/gsap-plugins/SKILL.md`, `skills/gsap-react/SKILL.md`, `examples/react/App.jsx`.
- Useful implementation idea: explicitly define animation ownership, cleanup and reduced-motion branches before adding a timeline.
- Risk: following the skill literally could over-animate a product route and introduce scroll-linked behavior the brief prohibits.
- Whether it fits Kehong: yes as an implementation review reference, not as runtime code.
- What must not be copied: skill files, prompts, example copy or example layouts.

### motiondivision/motion

- Repository: https://github.com/motiondivision/motion (checkout `6183324`)
- License: MIT (`LICENSE.md`)
- Interaction pattern: React motion primitives for presence, layout, gestures and accessible reduced-motion configuration.
- Relevant source files: `packages/framer-motion/src/motion/index.ts`, `packages/framer-motion/src/components/AnimatePresence/index.tsx`, `packages/framer-motion/src/utils/use-reduced-motion.ts`, `packages/motion/src/gestures/hover.ts`.
- Useful implementation idea: use `AnimatePresence` for one active stage, `MotionConfig` for user reduced motion and focus/hover state as a shared preview signal.
- Risk: unbounded layout animation can cause cumulative movement or hydration differences; keep the stage finite and avoid scroll hijacking.
- Whether it fits Kehong: yes. The lab uses `motion/react` for stage crossfade, hover/focus preview and reduced-motion fallback.
- What must not be copied: Motion's source, demo styles, sample copy or animated background effects.

### shuding/next-view-transitions

- Repository: https://github.com/shuding/next-view-transitions (checkout `67326d6`)
- License: MIT (`LICENSE`)
- Interaction pattern: a navigation link/router wrapper starts the browser View Transition API while preserving Next router semantics.
- Relevant source files: `src/link.tsx`, `src/use-transition-router.ts`, `src/transition-context.tsx`, `example/app/layout.js`.
- Useful implementation idea: treat route transition as an enhancement around normal Next navigation; navigation remains usable when `document.startViewTransition` is absent.
- Risk: browser support and transition pseudo-element styling vary; a transition must never be required to understand or complete a quote flow.
- Whether it fits Kehong: yes as a later route-transition enhancement; the lab keeps normal links and does not replace the production router.
- What must not be copied: the example layout, global transition styles or experimental provider wiring.

### codrops/3DGridContentPreview

- Repository: https://github.com/codrops/3DGridContentPreview (checkout `f16ca5d`)
- License: MIT (`LICENSE`)
- Interaction pattern: a grid item opens a selected preview, pauses item transforms, and reveals title/content/back controls in a staged sequence.
- Relevant source files: `src/js/grid.js`, `src/js/gridItem.js`, `src/js/preview.js`, `src/js/utils.js`.
- Useful implementation idea: keep a single active preview and stop background motion while content is open.
- Risk: 3D transforms and randomized motion can obscure product information and make the page heavy.
- Whether it fits Kehong: yes for a solutions chooser state model; not for decorative random motion.
- What must not be copied: grid geometry, image assets, cursor effects, Splitting markup and layout.

### codrops/DraggableMenu

- Repository: https://github.com/codrops/DraggableMenu (checkout `c943b24`)
- License: custom Codrops permission in `README.md`; it allows personal/commercial integration but prohibits taking the resource as-is, redistributing it or selling pluginized versions. Included third-party libraries/assets have separate terms.
- Interaction pattern: a draggable inline menu controls a scattered image preview.
- Relevant source files: `js/demo.js`, `js/imagesloaded.pkgd.min.js`, `js/draggabilly.pkgd.min.js`, `js/TweenMax.min.js`.
- Useful implementation idea: a secondary preview can be spatially related to the selected menu item.
- Risk: drag-first navigation is poor for keyboard users, touch precision and direct B2B routing.
- Whether it fits Kehong: no for the primary route selector; only the idea of a secondary visual preview is useful.
- What must not be copied: the draggable menu, scattered layout, bundled libraries, Niveau Grotesk font and Unsplash assets.

### pmndrs/react-three-fiber

- Repository: https://github.com/pmndrs/react-three-fiber (checkout `7dfaeaa`)
- License: MIT (`LICENSE`)
- Interaction pattern: declarative React scene graph with pointer events and render-loop control.
- Relevant source files: `example/src/demos/ClickAndHover.tsx`, `example/src/demos/Gltf.tsx`, `packages/fiber/src/core/renderer.tsx`.
- Useful implementation idea: use a small, interactive scene with pointer state and `frameloop="demand"`, and load it only after the route is selected.
- Risk: WebGL can increase memory, CPU and mobile battery use; provide a static fallback and never make it the first paint.
- Whether it fits Kehong: yes for `/en/model-preview` and the lab's selected 3D Studio route. The lab scene is intentionally compact and isolated.
- What must not be copied: examples, models, textures, demo materials or scene layouts.

### pmndrs/drei

- Repository: https://github.com/pmndrs/drei (checkout `c9d3d0d`)
- License: MIT (`LICENSE`)
- Interaction pattern: focused helpers for camera controls, bounds, environments, shadows and model presentation.
- Relevant source files: `src/core/OrbitControls.tsx`, `src/core/Bounds.tsx`, `src/core/Environment.tsx`, `src/core/ContactShadows.tsx`.
- Useful implementation idea: use bounded orbit controls, neutral lighting and contact shadows for a readable structure review.
- Risk: helper defaults can still produce a heavy scene or uncontrolled camera movement if not bounded.
- Whether it fits Kehong: yes; the lab limits orbit distance/polar angle and uses a demand-driven render loop.
- What must not be copied: Drei demos, textures, sample scenes or branded presentation.

### ibelick/motion-primitives

- Repository: https://github.com/ibelick/motion-primitives (checkout `92586e6`)
- License: README states MIT (`/LICENSE.md`), but no license file is present in this shallow checkout; verify the upstream file before copying any component.
- Interaction pattern: small composable motion patterns such as disclosure, animated tabs, spotlight and text effects.
- Relevant source files: `app/docs/animated-background/animated-tabs-hover.tsx`, `app/docs/disclosure/disclosure-basic.tsx`, `app/docs/spotlight/spotlight-basic.tsx`.
- Useful implementation idea: keep animation behavior as a local primitive with an explicit reduced-motion path.
- Risk: copy-paste components can import assumptions about Tailwind, class names and dependencies that do not belong in Kehong.
- Whether it fits Kehong: limited; the lab uses the pattern, not the component source.
- What must not be copied: component source, demo backgrounds, text effects or dependency assumptions.

### magicuidesign/magicui

- Repository: https://github.com/magicuidesign/magicui (checkout `7f1aea7`)
- License: MIT (`LICENSE.md`)
- Interaction pattern: a broad component catalog using composable React/Tailwind pieces, often with decorative motion.
- Relevant source files: `apps/www/content/docs/components/animated-list.mdx`, `apps/www/content/docs/components/animated-circular-progress-bar.mdx`, `apps/www/content/docs/components/interactive-grid-pattern.mdx`.
- Useful implementation idea: expose an interaction as a small, named component with clear props and no hidden route behavior.
- Risk: many effects are decorative, gradient-heavy or dashboard-like and would dilute a manufacturing brand.
- Whether it fits Kehong: only as a small-component review reference; no Magic UI component is needed for this lab.
- What must not be copied: gradient/beam effects, demo layouts, icons, copy or component source.

### DavidHDev/react-bits

- Repository: https://github.com/DavidHDev/react-bits (checkout `f88bb89`)
- License: MIT + Commons Clause (`LICENSE.md`); commercial application use is allowed, but selling/sublicensing/redistributing the components themselves is restricted.
- Interaction pattern: copy-ready animated React components across text, UI and backgrounds.
- Relevant source files: `src/demo/Animations/AnimatedContentDemo.jsx`, `src/demo/Animations/FadeContentDemo.jsx`, `src/demo/Components/SpotlightCardDemo.jsx`.
- Useful implementation idea: judge each effect by information value and keep only the smallest interaction that clarifies state.
- Risk: creative effects can shift attention from route labels and product accuracy; the Commons Clause also requires careful distribution review.
- Whether it fits Kehong: not needed for the current portal; useful only as a visual restraint benchmark.
- What must not be copied: component source, assets, branding, demo content or decorative backgrounds.

## Kehong interaction mapping

| Kehong surface | Reference | Applied in lab |
|---|---|---|
| Homepage Route Selector | `codrops/MenuFullGrid` | One selected route drives the stage; each option has a real destination and keyboard focus preview. |
| Menu thumbnail → destination | `codrops/MenuToGrid` + GSAP Flip | The route identity is kept from preview to CTA; no full FLIP dependency is added. |
| Preview → independent page | `codrops/PreviewContentTransition` | Stage CTA is a normal locale-aware Next link to products, factory, model preview or contact. |
| Route transition | `shuding/next-view-transitions` | Kept as a later enhancement; normal links remain the fallback and production router is untouched. |
| Hover / focus / crossfade | Motion | `motion/react` drives the stage crossfade and `MotionConfig` provides user reduced motion. |
| 3D packaging viewer | `react-three-fiber` + `drei` | The selected 3D Studio route dynamically loads a compact R3F scene with bounded OrbitControls, neutral lighting and shadows. |
| Solutions chooser | `codrops/3DGridContentPreview` | One active preview and paused background state are represented without random transforms. |
| Mobile Route Panel | semantic `Dialog` + Motion principles | A full-screen native `<dialog>` opens from a labelled route-panel button, supports Escape and restores focus. |

## Experiment page

- Route: `/en/lab/interactive-portal`
- Version A: restrained, green/paper/gold stage, clear route list, minimal crossfade. This is the default and the better fit for an international B2B manufacturing buyer.
- Version B: same information architecture with a slightly more editorial stage offset and a quiet corner treatment; it does not use scroll hijacking, neon, orbs or a long-scroll effect sequence.
- Both versions include: desktop route selector, dynamic visual stage, hover/focus preview, real route CTA, mobile full-screen dialog, reduced-motion fallback, browser-back query-state restoration and selected-route dynamic 3D loading.
- Existing homepage route `/en` is not replaced and was not edited by this experiment.

## QA screenshots

Generated from the production preview at `http://127.0.0.1:3130` after waiting for fonts, images and two stable animation frames:

- Version A: [390x844](/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/390x844-version-a.png), [768x1024](/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/768x1024-version-a.png), [1440x900](/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/1440x900-version-a.png)
- Version B: [390x844](/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/390x844-version-b.png), [768x1024](/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/768x1024-version-b.png), [1440x900](/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/1440x900-version-b.png)
- Manifest: `/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site/reports/screenshots/interactive-portal-current/manifest.json`

The screenshot set was generated by `scripts/capture-interactive-portal.mjs`; no reference repository assets are used.
