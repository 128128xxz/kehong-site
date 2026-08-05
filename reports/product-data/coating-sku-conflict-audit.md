# Coating / SKU code conflict audit

Generated: 2026-08-05T04:48:31.044Z

Source: `src/data/catalog.normalized.json`  
Source SHA-256: `c07d7b8e0cddcd61b631194a2efb5755b0b40e5623cb81d47c67173ce069b982`

## Scope and rule

Only explicit PE or PLA tokens in the SKU code are compared with the raw coating field. This audit never mutates source SKU facts.

- SKU records checked: 337
- Records with an explicit PE or PLA code token: 90
- Conflicts: 75
- Unverified coded records: 0

## Conflicts

| SKU | Product group | SKU code | Raw coating | Status |
| --- | --- | --- | --- | --- |
| KH-FD-CUPBOT-150350-PE-025 | paper-cup-fan-paper-cup-bottom-roll | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150350-PE-027 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150-PE-030 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-150350-PE-043 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-150350-PE-052 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150350-PE-071 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-180-PE-074 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-230-PE-077 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-300-PE-080 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150-PE-083 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-350-PE-086 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-180-PE-089 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-190-PE-092 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-240-PE-095 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150-PE-098 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-190-PE-101 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-280-PE-104 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-350-PE-107 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-160350-PE-110 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-160350-PE-113 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-190-PE-116 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-240-PE-119 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-250-PE-122 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-320-PE-125 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-320-PE-128 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-170-PE-131 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-230-PE-137 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-250-PE-146 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-320-PE-149 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-210-PE-152 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-250-PE-155 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-170-PE-167 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-320-PE-170 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-170-PE-173 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-230-PE-176 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-280-PE-179 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPROLL-230-PE-181 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-240-PE-182 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-280-PE-184 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150-PE-188 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPROLL-240-PE-193 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPFAN-210-PE-195 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-240-PE-197 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-300-PE-200 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-170-PE-201 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-190-PE-203 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-240-PE-206 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPROLL-350-PE-217 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-150-PE-218 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-180-PE-220 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-250-PE-221 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-280-PE-222 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-300-PE-223 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-320-PE-224 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-280-PE-229 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-300-PE-230 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-320-PE-231 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPSHEET-350-PE-232 | paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-210-PE-238 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150-PE-242 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPFAN-190-PE-245 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-KCUP-320-PE-247 | paper-cup-fan-kraft-cupstock-paper | PE | PLA coating | conflict |
| KH-FD-KCUP-350-PE-248 | paper-cup-fan-kraft-cupstock-paper | PE | PLA coating | conflict |
| KH-FD-CUPROLL-170-PE-250 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPFAN-230-PE-254 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |
| KH-FD-CUPROLL-150-PE-259 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-320-PE-261 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-350-PE-262 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-150-PE-263 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPROLL-170-PE-264 | paper-cup-fan-pe-coated-paper-roll-for-paper-cup | PE | PLA coating | conflict |
| KH-FD-CUPBOT-170-PE-265 | paper-cup-fan-paper-cup-bottom-roll | PE | PLA coating | conflict |
| KH-FD-CUPBOT-180-PE-266 | paper-cup-fan-paper-cup-bottom-roll | PE | PLA coating | conflict |
| KH-FD-CUPBOT-210-PE-268 | paper-cup-fan-paper-cup-bottom-roll | PE | PLA coating | conflict |
| KH-FD-CUPBOT-240-PE-271 | paper-cup-fan-paper-cup-bottom-roll | PE | PLA coating | conflict |
| KH-FD-CUPFAN-150350-PE-289 | paper-cup-fan-paper-cup-fan | PE | PLA coating | conflict |

## Unverified coded records

No records.

## Product-group coating summary

| Product group | SKUs | Coating values found |
| --- | ---: | --- |
| kraft-paper-single-sided-kraft-paper | 1 | PE |
| kraft-paper-double-sided-kraft-paper | 1 | PE |
| kraft-paper-white-kraft-paper | 1 | PE |
| kraft-paper-yellow-kraft-paper | 1 | PE |
| kraft-paper-food-grade-kraft-paper | 2 | PE |
| kraft-paper-pe-coated-kraft-paper | 1 | PE |
| kraft-paper-greaseproof-kraft-paper | 1 | PE |
| kraft-paper-printed-kraft-paper | 1 | PE |
| paper-pad-kraft-cardstock | 1 | — |
| paper-insert-kraft-laminated-corrugated-paper | 1 | PE |
| paper-pad-white-cardboard | 1 | — |
| paper-pad-food-grade-white-cardboard | 1 | — |
| white-cardboard-single-side-coated-white-board | 1 | — |
| white-cardboard-double-side-coated-white-board | 1 | — |
| white-cardboard-white-cardboard-box-material | 1 | — |
| paper-pad-white-cardboard-pad | 1 | — |
| paper-insert-white-cardboard-insert | 2 | PE |
| corrugated-fluted-paper-white-cardboard-laminated-corrugated-paper | 1 | PE |
| white-cardboard-printed-white-cardboard | 1 | — |
| white-cardboard-pe-coated-white-cardboard | 1 | PE |
| white-cardboard-food-grade-white-cardboard | 1 | — |
| paper-packaging-material-greaseproof-paper | 1 | PE |
| paper-packaging-material-burger-wrapping-paper | 1 | PE |
| paper-packaging-material-sandwich-wrapping-paper | 1 | PE |
| paper-packaging-material-baking-paper | 1 | PE |
| paper-pad-cake-pad-paper | 1 | PE |
| corrugated-fluted-paper-pizza-liner-paper | 1 | PE |
| paper-insert-food-tray-paper | 1 | PE |
| white-cardboard-food-box-paper-material | 1 | PE |
| paper-pad-single-face-corrugated-paper | 1 | PE |
| paper-insert-double-wall-corrugated-paper | 1 | PE |
| paper-insert-triple-layer-corrugated-paper | 1 | PE |
| paper-insert-e-flute-corrugated-paper | 1 | PE |
| paper-insert-f-flute-corrugated-paper | 1 | PE |
| paper-insert-g-flute-corrugated-paper | 1 | PE |
| corrugated-fluted-paper-colored-corrugated-paper | 1 | PE |
| paper-insert-black-corrugated-paper | 1 | PE |
| corrugated-fluted-paper-white-corrugated-paper | 1 | PE |
| corrugated-fluted-paper-kraft-corrugated-paper | 1 | PE |
| paper-insert-black-card-laminated-corrugated-paper | 1 | PE |
| corrugated-fluted-paper-white-card-laminated-corrugated-paper | 1 | PE |
| paper-insert-specialty-paper-laminated-corrugated-paper | 2 | PE |
| corrugated-fluted-paper-logo-embossed-corrugated-paper | 1 | PE |
| corrugated-fluted-paper-anti-counterfeit-corrugated-paper | 1 | PE |
| corrugated-fluted-paper-corrugated-box-semi-finished-sheet | 1 | — |
| paper-pad-gold-card-paper | 1 | PE |
| paper-insert-silver-card-paper | 1 | PE |
| specialty-paper-holographic-paper | 1 | PE |
| specialty-paper-pearlescent-paper | 1 | PE |
| paper-pad-black-card-paper | 1 | PE |
| specialty-paper-colored-specialty-paper | 1 | PE |
| specialty-paper-anti-counterfeit-paper | 1 | PE |
| specialty-paper-anti-scratch-paper | 1 | PE |
| specialty-paper-scented-paper | 1 | PE |
| food-packaging-box-burger-box | 1 | — |
| corrugated-fluted-paper-pizza-box | 1 | — |
| food-packaging-box-cake-box | 1 | — |
| food-packaging-box-sandwich-box | 1 | — |
| food-packaging-box-takeaway-food-box | 1 | PE |
| food-packaging-box-fried-chicken-box | 1 | — |
| paper-insert-food-paper-tray | 1 | PE |
| food-packaging-box-food-paper-sleeve | 1 | PE |
| food-packaging-box-food-liner-paper | 1 | PE |
| food-packaging-box-bakery-packaging-box | 1 | — |
| paper-pad-cake-pad | 1 | PE |
| paper-pad-pizza-paper-pad | 1 | PE |
| paper-pad-food-paper-pad | 1 | PE |
| paper-pad-cosmetic-paper-pad | 1 | PE |
| paper-pad-electronics-paper-pad | 1 | PE |
| paper-pad-gift-box-inner-pad | 1 | PE |
| paper-pad-shock-absorbing-paper-pad | 1 | PE |
| paper-pad-round-paper-pad | 1 | PE |
| paper-pad-square-paper-pad | 1 | PE |
| paper-pad-custom-die-cut-paper-pad | 1 | PE |
| paper-insert-cosmetic-paper-insert | 1 | PE |
| paper-insert-perfume-paper-insert | 1 | PE |
| paper-insert-electronics-paper-insert | 1 | PE |
| paper-insert-gift-box-paper-insert | 1 | PE |
| paper-insert-wine-box-paper-insert | 1 | PE |
| paper-insert-tea-box-paper-insert | 1 | PE |
| paper-insert-food-paper-insert | 1 | PE |
| paper-insert-corrugated-paper-insert | 1 | PE |
| paper-insert-specialty-paper-insert | 1 | PE |
| corrugated-fluted-paper-die-cut-semi-finished-sheet | 1 | — |
| white-cardboard-creased-semi-finished-sheet | 1 | — |
| corrugated-fluted-paper-laminated-semi-finished-sheet | 1 | — |
| corrugated-fluted-paper-corrugated-box-blank | 1 | — |
| white-cardboard-folding-box-blank | 1 | — |
| corrugated-fluted-paper-printed-color-box-blank | 1 | — |
| white-cardboard-food-box-blank | 1 | — |
| paper-insert-gift-box-semi-finished-sheet | 1 | — |
| paper-pad-cosmetic-box-semi-finished-sheet | 1 | — |
| corrugated-fluted-paper-custom-shape-box-blank | 1 | PE |
| white-cardboard-white-cardboard-packaging-box | 1 | — |
| kraft-paper-kraft-paper-box | 1 | PE |
| corrugated-fluted-paper-corrugated-paper-box | 1 | PE |
| corrugated-fluted-paper-colored-corrugated-box | 1 | — |
| white-cardboard-cosmetic-packaging-box | 1 | — |
| corrugated-fluted-paper-electronics-packaging-box | 1 | — |
| food-packaging-box-food-packaging-box | 1 | PE |
| corrugated-fluted-paper-gift-packaging-box | 1 | — |
| white-cardboard-folding-carton | 1 | — |
| corrugated-fluted-paper-one-piece-paper-box | 1 | PE |
| paper-cup-fan-paper-cup-fan | 141 | PE / PLA |
| paper-cup-fan-paper-cup-bottom-roll | 18 | PE / PLA |
| paper-cup-fan-pe-coated-paper-roll-for-paper-cup | 44 | PE / PLA |
| paper-cup-fan-pe-coated-paper-sheet-for-paper-cup | 19 | PE / PLA |
| paper-cup-fan-kraft-cupstock-paper | 8 | PE / PLA |
| paper-cup-fan-food-tray-paper-material | 1 | PE |

## Required business follow-up

Any listed conflict requires a supplier or production-data owner to confirm the commercial coating before the raw SKU source is corrected. This audit report intentionally leaves the underlying SKU and coating data unchanged.
