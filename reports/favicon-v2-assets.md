# Kehong favicon v2 asset record

Source: `public/brand/kehong-mark-transparent.png`  
Source SHA-256: `586be2c87ac70715a2f47a97c552a2eed0777f37c42bef09a2d355fa97daac19`

The source is the approved official mark-only asset (box and leaf; no text). Tab icons use a transparent square canvas with a 12% clear edge margin. Apple/PWA icons retain the official artwork on the neutral opaque paper background `#f6f3eb`, so platform icon surfaces do not add a black background. No logo geometry or colour was altered.

| File | Dimensions / format | Transparency | Purpose | SHA-256 |
| --- | --- | --- | --- | --- |
| `public/brand/kehong-favicon-v2.ico` | ICO: 16, 32, 48 px | Yes | Versioned browser favicon | `a6ae95be8a6781c712231b47e9452105093e43ec7429dd82278f11c78e602b5d` |
| `public/brand/kehong-tab-icon-v2-16.png` | 16×16 PNG | Yes | Small browser tab | `be733dab5255cea1247c769a65fa35531889ba1cfa32b673816bafea13f9c4fb` |
| `public/brand/kehong-tab-icon-v2-32.png` | 32×32 PNG | Yes | Browser tab | `19ba218dbcd240238f9799a2557479e09c7041175ee649369ff7bb1bb14d978b` |
| `public/brand/kehong-tab-icon-v2-48.png` | 48×48 PNG | Yes | Browser / bookmark | `fd622d0a76dc1b6b7043abae0e50fb0cfa150e2b823d7899cd1533af2b3dd0e6` |
| `public/brand/kehong-tab-icon-v2-64.png` | 64×64 PNG | Yes | High-density browser tab | `afd99ac9b3c5cb4b5ee81d673c595fd4f22cd22c1e8f1779ea80986534790835` |
| `public/brand/kehong-apple-touch-icon-v2.png` | 180×180 PNG | Opaque neutral background | iOS home screen | `ef4b8be810c5c00ee97b065efa32929a49f57ebe6e9762d6d597d6c7493c2a9c` |
| `public/brand/kehong-pwa-icon-v2-192.png` | 192×192 PNG | Opaque neutral background | Android/PWA | `d9937e182efefd353c8374f1d705ab8686ebbfead907a316f9f3af7f2b8badce` |
| `public/brand/kehong-pwa-icon-v2-512.png` | 512×512 PNG | Opaque neutral background | Android/PWA / App Router compatibility | `6089cb1b68409617aff95881cf93c15adbc4201215aba8f5c6c7fcca6608fa25` |
| `public/favicon.ico` | ICO: 16, 32, 48 px | Yes | Browser fallback | Same as versioned ICO |
| `src/app/favicon.ico` | ICO: 16, 32, 48 px | Yes | App Router `/favicon.ico` route | Same as versioned ICO |
| `src/app/icon.png` | 512×512 PNG | Opaque neutral background | App Router `/icon.png` route | Same as PWA 512 |

`public/apple-touch-icon.png` is also a compatibility copy of the versioned Apple asset.

Visual verification contact sheet: `reports/favicon-v2-visual-check.png` (transparent tab variants reviewed on light, dark, and paper surfaces; Apple/PWA variants reviewed on their opaque neutral background).
