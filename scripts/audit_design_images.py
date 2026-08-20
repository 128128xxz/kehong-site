from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "reports" / "design-final"
OUTPUT.mkdir(parents=True, exist_ok=True)


def dhash(image: Image.Image) -> str:
    gray = image.convert("L").resize((9, 8))
    pixels = list(gray.getdata())
    bits = []
    for row in range(8):
        offset = row * 9
        bits.extend(pixels[offset + col] > pixels[offset + col + 1] for col in range(8))
    value = 0
    for bit in bits:
        value = (value << 1) | int(bit)
    return f"{value:016x}"


def classify(relative: str, width: int, height: int) -> dict[str, object]:
    lowered = relative.lower()
    company_showcase = "media/" in lowered
    generated = "/ai-generated/" in lowered
    web_asset = "/media/applications/" in lowered
    poster = lowered.endswith(("/factory.png", "/factory.webp", "/process.png", "/process.webp", "/products.png", "/products.webp"))
    chinese_ui = "studio-pizza-preview" in lowered or poster
    third_party = any(term in lowered for term in ("orins", "custom-box-display-open", "food-paper-box"))
    equipment_brand = "automatic-feeder-line" in lowered
    text_likely = poster or chinese_ui or third_party or equipment_brand
    real_status = (
        "generated"
        if generated
        else "unverified external/reference asset"
        if web_asset
        else "company-provided; ownership still requires confirmation"
        if company_showcase or "/media/" in lowered
        else "technical/local asset; provenance requires confirmation"
    )
    clear = width >= 900 and height >= 700
    material = any(term in lowered for term in ("swatch", "board", "paper-roll", "corrugated", "material"))
    product = any(term in lowered for term in ("box", "cake", "insert", "pad", "packaging", "cup"))
    factory = any(term in lowered for term in ("machine", "feeder", "factory", "sample-room"))
    model = any(term in lowered for term in ("model", "structural", "studio"))
    should_retire = generated or poster or chinese_ui or web_asset
    return {
        "clearAtNormalDisplaySize": clear,
        "containsEmbeddedTextLikely": text_likely,
        "containsChineseLikely": chinese_ui,
        "containsThirdPartyBrandLikely": third_party or equipment_brand,
        "kehongAuthenticity": real_status,
        "suitableForHero": factory and clear and not poster and not chinese_ui and not third_party,
        "suitableForFactory": factory and clear and not poster and not chinese_ui,
        "suitableForProcess": factory and clear and not poster and not chinese_ui,
        "suitableForProductCard": product and clear and not poster and not chinese_ui,
        "suitableForSolution": (product or material) and clear and not poster and not chinese_ui,
        "suitableFor3D": model and clear and not chinese_ui,
        "shouldRetireFromPrimaryUse": should_retire,
    }


records: list[dict[str, object]] = []
for path in sorted((ROOT / "public").rglob("*")):
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"}:
        continue
    relative = path.relative_to(ROOT).as_posix()
    raw = path.read_bytes()
    width = height = 0
    perceptual = None
    if path.suffix.lower() != ".svg":
        try:
            with Image.open(path) as image:
                width, height = image.size
                perceptual = dhash(image)
        except Exception:
            pass
    aspect = round(width / height, 4) if width and height else None
    record = {
        "path": relative,
        "fileName": path.name,
        "width": width or None,
        "height": height or None,
        "bytes": len(raw),
        "format": path.suffix.lower().lstrip("."),
        "aspectRatio": aspect,
        "sha256": hashlib.sha256(raw).hexdigest(),
        "dHash64": perceptual,
        **classify(relative, width, height),
    }
    records.append(record)

near_duplicates: list[dict[str, object]] = []
for index, left in enumerate(records):
    if not left["dHash64"]:
        continue
    for right in records[index + 1 :]:
        if not right["dHash64"]:
            continue
        distance = (int(str(left["dHash64"]), 16) ^ int(str(right["dHash64"]), 16)).bit_count()
        if distance <= 5:
            near_duplicates.append({"left": left["path"], "right": right["path"], "hammingDistance": distance})

payload = {
    "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    "method": "File SHA-256 plus 64-bit difference hash. Subjective flags are conservative path/provenance classifications and require human confirmation.",
    "assetCount": len(records),
    "assets": records,
    "nearDuplicates": near_duplicates,
}
(OUTPUT / "image-audit.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

retired = [item for item in records if item["shouldRetireFromPrimaryUse"]]
approved = [item for item in records if item["kehongAuthenticity"].startswith("company-provided") and not item["shouldRetireFromPrimaryUse"]]
markdown = f"""# Final image asset audit

Generated from `{len(records)}` local public image assets. Exact duplicates use SHA-256; visually similar files use a 64-bit difference hash. Authenticity flags are intentionally conservative and are not ownership certificates.

## Approved working pool

- {len(approved)} company-provided assets remain eligible for contextual use, subject to final ownership confirmation.
- Hero: `automatic-feeder-line.webp` only, with the visible equipment mark treated as an approval item.
- Manufacturing: `precision-machine-closeup.webp` as the primary process detail and `structure-material-real.jpg` as a separate converting stage.
- Materials: `color-material-swatch.webp`, `honeycomb-paper-roll.webp`, and material-production imagery.
- Finished packaging and solutions: clean product structures without poster copy or embedded UI.

## Retired from primary use

- {len(retired)} assets are marked for retirement from primary brand surfaces because they are AI-generated, unverified web references, poster-based, or contain embedded UI.
- English pages must not use `studio-pizza-preview.*`, the text-heavy `factory.*`, `process.*`, or `products.*` posters.
- OrinsCare-branded assets require written permission and must not be presented as customer cases.

## Duplicate findings

- PNG/WebP export pairs and closely cropped food-box collages are recorded in `image-audit.json`.
- Alternate encodings are not separate visual assets and should not be used twice on the same page.

## Required reshoot list

1. **Converting line wide shot** — landscape, 3:2; clean aisle, even industrial light, equipment running, no staged people; Factory hero and manufacturing proof.
2. **Die-cutting or creasing detail** — landscape, 4:3; tight mechanical detail with paper in process, controlled highlights; Process and homepage proof.
3. **Material handling** — landscape, 4:3; paperboard stacks or rolls being prepared, neutral background, optional operator with PPE; Factory and materials system.
4. **Quality inspection** — landscape, 4:3; hands checking dimensions, crease, coating, or packing without invented readings; Factory and Process.
5. **Unbranded packaging set** — landscape, 3:2; food box, tray, insert, and folding carton on warm neutral sweep; Product Systems and Solutions.
6. **Corrugated and paperboard cross-sections** — macro, 3:2; neutral light, clean edge detail; materials, 3D layer explanation, and product cards.
7. **UI-free model render** — landscape, 16:9; warm white/kraft structure, open/closed states, no third-party identity; homepage 3D preview and mobile fallback.

## Machine-readable record

See `reports/design-final/image-audit.json` for dimensions, sizes, formats, ratios, hashes, suitability flags, and near-duplicate pairs for every asset.
"""
(OUTPUT / "image-audit.md").write_text(markdown)
print(json.dumps({"assets": len(records), "nearDuplicates": len(near_duplicates), "retired": len(retired)}))
