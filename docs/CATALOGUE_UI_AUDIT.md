# CATALOGUE & STOREFRONT UI AUDIT REPORT

**Date:** 2026-08-14  
**Project:** Kenya Electronics Marketplace  
**Maintainer:** AI Assistant (Gemini 3.6 Flash)

---

## 1. Current Data Architecture

The application operates on a 4-tier data model:

```
ImageKit Media Library (6,430 Project Assets)
       ↓
data/imagekit-products.json / csv (Asset References & CDN URLs)
       ↓
data/normalized-products.json (1,219 Grouped Product Candidates)
       ↓
data/product-market-research.json / csv (Kenyan Market Price Research)
       ↓
Storefront UI Data Layer (src/lib/product-data.ts)
```

The business data integrity rule (`AI_START_HERE.md §4.4`) strictly prohibits modifying raw ImageKit exports or overwriting normalized product candidates. All research data is stored in `data/product-market-research.json` and joined at runtime via stable `candidateId` (`productId`).

---

## 2. Product Candidate Structure & Quality

- **Total Normalized Product Candidates:** 1,219
- **High Confidence Candidates:** 885 (72.6%) — clear brand/model identity extracted from filenames and folder structures.
- **Medium Confidence Candidates:** 178 (14.6%) — identifiable brand/product family with minor ambiguous model text.
- **Low Confidence Candidates:** 156 (12.8%) — generic assets or filenames requiring manual review.

---

## 3. Category & Subcategory Asset Coverage

| Category Code | Category Name | ImageKit Assets | Normalized Products | Status |
|---|---|---|---|---|
| **C01** | Smartphones | 1,661 | 390 | **Covered** (Oppo, itel) |
| **C02** | Tablets | 12 | 1 | **Covered** (Minimal) |
| **C03** | Laptops | 394 | 394 | **Covered** (laptops1) |
| **C04** | Desktop Computers | 0 | 0 | **Empty State** (Coming soon) |
| **C05** | Monitors | 0 | 0 | **Empty State** (Coming soon) |
| **C06** | TVs | 525 | 140 | **Covered** (tvs) |
| **C07** | Smart Watches | 2 | 1 | **Covered** (Minimal) |
| **C08** | Audio | 847 | 157 | **Covered** (airbuds, Sound Bars, Bts) |
| **C09** | Gaming | 0 | 0 | **Empty State** (Coming soon) |
| **C10** | Cameras | 0 | 0 | **Empty State** (Coming soon) |
| **C11** | Networking | 0 | 0 | **Empty State** (Coming soon) |
| **C12** | Storage | 0 | 0 | **Empty State** (Coming soon) |
| **C13** | Accessories | 0 | 0 | **Empty State** (Coming soon) |

*7 of 13 master categories currently have zero ImageKit assets. Per project rules, master categories are preserved without inventing fake products.*

---

## 4. Brand Coverage

- **Brands Detected in Assets:** 25
- **Matched to Master Catalogue:** 22 brands (Apple, Beats, Bose, Harman Kardon, Hisense, Huawei, Infinix, JBL, LG, Microsoft, Nokia, Nothing, Oraimo, POCO, Realme, Samsung, Skullcandy, Sony, Tecno, Xiaomi, itel, plus OPPO / Anker Soundcore / Google).
- **Catalogue Brands Missing Assets:** 162 brands.

---

## 5. Duplicate & Uncertain Candidates Situation

- `data/duplicate-product-groups.csv` identifies **318 candidate groups** with similar filenames.
- `data/uncertain-items.csv` flags **2,673 individual asset files** requiring review.
- Candidates are preserved as separate records in `normalized-products.json` until verified.

---

## 6. Price Research Integration & UI Labeling

To ensure strict commercial compliance:
1. **Market Reference Labeling:** All verified Kenyan retail research prices are explicitly labeled on UI as **"Market Ref: KSh XX,XXX"** or **"Est. Market Ref: KSh XX,XXX"**.
2. **Neutral Fallback State:** Products without verified pricing display **"Kenyan price not verified"** or **"Price TBC"**.
3. **No False Commercial Claims:** Prices are never displayed as marketplace selling prices or stock availability.

---

## 7. Recommended Next Steps

1. Connect `product-market-research.json` directly into `src/lib/product-data.ts` getters.
2. Update `ProductCard`, `ProductGallery`, and `ProductDetailPage` to render the market reference price tag with source attribution and date.
3. Update Search & Filter UI to filter numeric prices only on verified market reference records.
4. Execute `npx tsc`, `npm run lint`, and `npm run build` to verify production readiness.
