# IMPLEMENTATION READINESS — Kenya Electronics Marketplace

**Task:** `TASK-001-B` Pre-implementation system validation (DOCUMENTATION ONLY — no code written).
**Date:** 2026-08-08
**AI Model:** oc/deepseek-v4-flash-free
**Documents audited:** 8 (listed in §1). **No application code exists yet** — confirmed.

This document is the consistency audit of the 8 authoritative documents, the catalogue integrity audit, and the final readiness verdict. It is the gate that must pass before `TASK-002` begins.

---

## 1. DOCUMENTS AUDITED

| # | Document | Read | Role |
|---|----------|------|------|
| 1 | `AI_START_HERE.md` | ✅ Full | Operating manual / AI rules |
| 2 | `.trae/documents/PRD.md` (Rev 2) | ✅ Full | Product requirements |
| 3 | `.trae/documents/Technical-Architecture.md` (Rev 2) | ✅ Full | Technical spec, DDL patterns, ERD |
| 4 | `DATABASE_SCHEMA.md` | ✅ Full | Migration plan placeholder |
| 5 | `CATALOGUE_MASTER.md` | ✅ Full (1095 lines) | Catalogue single source of truth |
| 6 | `DESIGN_SYSTEM.md` | ✅ Full | Design tokens / components (placeholder) |
| 7 | `CURRENT_TASK.md` | ✅ Full | Task state machine |
| 8 | `DEVELOPMENT_LOG.md` | ✅ Full | Permanent log |

**Confirmed:** The repo contains only `.md` docs, `.gitignore`, and `.trae/`. No `app/`, `src/`, `package.json`, or SQL exists. TASK-002 has not been started.

---

## 2. VERDICT (at the end of this document)

> **VERDICT: `GO WITH CONDITIONS`** — see §15.

---

## 3. CONTRADICTIONS FOUND (severity-classified)

Each issue is classified `BLOCKER` / `HIGH` / `MEDIUM` / `LOW` / `INFORMATIONAL`. Nothing was silently changed. Where a fix requires editing a source document, authorization is requested in §14.

### C-01 — PRIMARY COLOR / FONT / CTA CONTRADICTION between PRD and DESIGN_SYSTEM
- **Severity: `BLOCKER`**
- **PRD §4.1:** Primary = `brand-navy` #0B2545; CTA = navy→primary-600 gradient with copper accent; Accent copper #C4651A; Accent jade #0E7C7B; body font **Work Sans**; mono **JetBrains Mono**.
- **DESIGN_SYSTEM.md §1/§2:** Primary = **Copper** #EA6A0C (`bg-primary`); secondary = Navy #1E2C50; jade #12B76A; display **Sora**; body **Inter**; tabular-nums (no mono).
- **TASK-002** explicitly instructs: "Kenyan Copper/Jade palette from DESIGN_SYSTEM.md".
- **Impact:** Two of the most authoritative documents specify different primary CTA color, semantic palette values (#0B2545 vs #1E2C50/#0F172A), and different body fonts. A developer cannot build UI without choosing one; the choice is a business/branding decision.
- **Recommended resolution (needs authorization):** DESIGN_SYSTEM.md becomes the single token authority (it is the implementation-time doc, TASK-010); PRD §4.1 must be updated to reference DESIGN_SYSTEM.md and delete the divergent palette/font block. **Requested in §14.**

### C-02 — UPLOAD SIZE / FORMAT LIMITS CONTRADICTION
- **Severity: `BLOCKER`**
- **CATALOGUE_MASTER.md §08:** images ≤ 4 MB, video ≤ 120 MB, video ≤ 1080p, image ≥ 800×800, only `.webp` stored.
- **Technical-Architecture.md §8.1:** image ≤ 15 MB, mp4 ≤ 200 MB < 120 s, MIME `png/jpeg/webp/mp4`.
- **Impact:** Two different validation budgets. Storage signed-URL POST config, Edge Function WebP conversion, and frontend validation cannot be consistently implemented. One number set must win. **Requested in §14.**

### C-03 — CATEGORY TREE DISCREPANCY (13 vs 14, "Feature Phones", ordering)
- **Severity: `HIGH`**
- **CATALOGUE_MASTER.md §01:** exactly **13** top-level categories C01–C13. No "Feature Phones" anywhere.
- **Technical-Architecture.md §6.3 seed list:** "Categories (14): Smartphones, Feature Phones, Tablets, ..." (different order, and includes Feature Phones).
- **CATALOGUE_MASTER.md §01 states "Order is meaningful (landing page & navigation sequence)".**
- **Impact:** Seed migration and navigation/landing order ambiguous. CATALOGUE_MASTER is declared the single source of truth for categories, so the 14-list is stale. Resolution: delete Feature Phones and the Tech Arch order list, defer to CATALOGUE_MASTER §01. **Requested in §14.**

### C-04 — SPECIFICATION TABLE NAMING CONTRADICTION
- **Severity: `BLOCKER`** (blocks DDL)
- **Technical-Architecture ERD §6.1:** `specification_types` + `product_specifications` (1:N per-product spec rows).
- **DATABASE_SCHEMA.md** (0002) + **CURRENT_TASK TASK-004:** `spec_templates` + `spec_values jsonb`.
- **PRD §2.2.3:** "per-category spec templates that drive PDP spec matrix, filters, compare".
- **Impact:** The exact table names for the DDL are ambiguous. JSONB (`spec_values`) vs relational (`product_specifications`) is an architecture decision. Must be locked before TASK-004. **Requested in §14.**

### C-05 — ROLE COUNT / ROLE TABLE DISCREPANCY
- **Severity: `HIGH`**
- **PRD §2.1:** six roles including **Guest** (Supabase `anon`).
- **TASK-003 (CURRENT_TASK):** "Create `0001_init_roles_and_auth.sql` — 6 roles (no guest)".
- **DATABASE_SCHEMA.md (0001):** "roles (5)".
- **Technical-Architecture:** `Role` union includes `'guest'`; ERD `roles }o--o{ permissions` (role_permissions).
- **Impact:** Is the `roles` table 5 rows (buyer, seller, moderator, admin, super_admin) with guest = implicit anon, or 6? And is the junction table named `role_permissions` (ERD) or `role_permissions` unconfirmed in migrations? Must be pinned before migration 0001. **Requested in §14.**

### C-06 — MISSING ENTITIES IN THE MIGRATION PLAN (DATABASE_SCHEMA.md)
- **Severity: `BLOCKER`** (blocks complete DDL)
- Entities present in the ERD / TS interfaces / PRD but **absent** from the DATABASE_SCHEMA migration index:
  - `wishlists` (ERD, PRD account page, TASK-104/112)
  - `recently_viewed` (ERD)
  - `search_history` (ERD, PRD account)
  - `analytics_events` (ERD, §8.1 says RLS-off time-partitioned; no migration listed)
  - `failed_searches` (Tech Arch §6.1 list, PRD Admin Analytics)
  - `banners` (Tech Arch §6.1 list, PRD homepage/banners editor) — maybe part of homepage_section_items but PRD references "Banners CRUD"
  - `permissions` / `role_permissions` (ERD, TASK-003 roles+permissions seed)
  - `warranties` (ERD `products }o--o| warranties`, PRD warranty badge)
  - `product_models` (ERD, CATALOGUE_MASTER §04 seed interface) — see C-07
  - `login` events / auth trace — audit_logs covers login action.
- **Impact:** DATABASE_SCHEMA.md must either add these to a migration (e.g. 0001/0002/0006) or explicitly justify omission. Otherwise the generated migrations will be incomplete vs the ERD. **Requested in §14.**

### C-07 — `product_models` ENTITY AMBIGUITY
- **Severity: `MEDIUM`**
- ERD has `brands ||--o{ product_models` and `product_models ||--o{ products`.
- CATALOGUE_MASTER §04 `ProductModelSeed` maps to "DDL products + product_variants" and the SKU convention is model-based; no `product_models` table in DATABASE_SCHEMA migrations.
- **Impact:** Is `product_models` a real table or just a seeding concept? Decide and document. **Requested in §14.**

### C-08 — ORDER STATUS ENUM NOT FULLY ENUMERATED ("8-state FSM")
- **Severity: `HIGH`**
- PRD §3.4 lists transitions but the state set is not closed; TASK-006 says "8-state FSM"; the states implied are at least: `pending_whatsapp, customer_contacted, confirmed, processing, out_for_delivery, ready_for_pickup, delivered, cancelled, refunded` (≥9).
- `OrderStatus` type referenced by `OrderFulfillmentGroup.status` but never defined in §4.1.
- OrderFulfillment.status (assigned/picked_up/in_transit/out_for_delivery/delivered/failed_attempt/returned) is a *different* enum for deliveries and is well-defined — the confusion is only on order/group status.
- **Impact:** Need an explicit `order_status_enum` with all values + allowed transitions table before TASK-006. **Requested in §14.**

### C-09 — IMAGE COMPRESSION TARGET INCONSISTENCY (minor)
- **Severity: `LOW`**
- CATALOGUE §08: `_large` q=85, `_thumb` q=80, watermark 7% opacity.
- Tech Arch §2: "quality=70 mobile/75 desktop, AVIF first".
- Resolution: transforms vs next/image loader quality can differ by layer; document that Storage render quality applies at transform and next/image adds quality 70/75. Not a blocker; note for TASK-010/104.

### C-10 — AUTOLOOK SEO TOKEN MISMATCH (minor)
- **Severity: `INFORMATIONAL`**
- PRD examples use site brand "NairobiElectronics" (§09 SEO title template) but Tech Arch go-live domain is `electronics.co.ke` and env is `NEXT_PUBLIC_SITE_URL=https://electronics.co.ke`. Site brand token not centralized. Add `SITE_BRAND` to system_settings / env.

---

## 4. MISSING / UNDEFINED ITEMS (not contradictions, just gaps)

Classified as above. These are not fixed — they are flagged for the human to decide or for the implementing AI to fill with documented defaults.

### 4.1 Missing or ambiguous business rules
- **M-01 (HIGH)** — **Max quantity per reserve** is undefined. `reserve_variant(p_qty int)` allows any qty; no cap (e.g. 5) per session per variant. Needed to prevent stock-hoarding griefing (alert policy #4 hints at griefing). 
- **M-02 (HIGH)** — **Request idempotency / duplicate reserve protection**: no idempotency key defined for `reserveVariant` or `createOrderFromCart`; "repeated clicks / browser refresh / duplicate requests" are in §8 acceptance but no mechanism (e.g. Idempotency-Key, unique constraint on (session_id, variant_id, status='active')) is specified.
- **M-03 (HIGH)** — **Cart item quantity limits** (max per cart line, max distinct items) undefined.
- **M-04 (MEDIUM)** — **Coupon validation edge cases**: single-use flag on Coupon missing (has max_uses_total, uses_per_user — no `single_use`), stackable interplay with auto-bundles, coupon on used listings, coupon + commission interplay undefined.
- **M-05 (MEDIUM)** — **Refund/return window** "7 day window" in PRD FSM but return/refund policy duration, condition thresholds not formalized.
- **M-06 (MEDIUM)** — **Negotiable flag** semantics (PRD §2.2.5) — does it appear on PDP/cart; how is it confirmed? Undefined behaviour.
- **M-07 (MEDIUM)** — **"Verified listing badge"** criteria (admin inspected) vs "Verified seller" badge — both exist; who grants each, and does verified_listing require listing_verification field? Table field not in DATABASE_SCHEMA.
- **M-08 (MEDIUM)** — **Reservation extension** "+10 min once" — who can extend (buyer only?), is extension persisted in a field (`extension_count`)? Not in reservations schema.
- **M-09 (MEDIUM)** — **Currency/formatting**: KES formatting rules (thousands separator, "KSh" vs "KES" usage) defined in DESIGN_SYSTEM §5 Price but no locale helper spec (Intl.NumberFormat 'en-KE'?).
- **M-10 (MEDIUM)** — **Sort options**: relevance/price-asc/price-desc/newest/popular defined; "popular" metric not defined (views? sales? trend 30d — CATALOGUE mentions "trending 30d" for accessories; needs definition).
- **M-11 (MEDIUM)** — **Pickup vs delivery fee**: pickup = free? Undefined.
- **M-12 (MEDIUM)** — **Order minimum** (none defined) and **delivery fee structure** (per-zone fee defined in zones but formula for order total fee across split groups undefined — sum per group? per order?).
- **M-13 (MEDIUM)** — **Back-in-stock / price-drop alert trigger** — who triggers notifications (cron job?) — no cron job listed for alert firing (only reservation/order/search MV/category sweeps). `product_alerts` trigger point undefined.
- **M-14 (LOW)** — **Newsletter** — subscribed in landing; storage table for newsletter subscriptions not in schema (could be email collection → notifications/preferences). Undefined.
- **M-15 (LOW)** — **Wishlist sharing** link (PRD wishlist share) — public share endpoint undefined.
- **M-16 (LOW)** — **App-install banner** visit counting (3 visits) — where stored? Undefined.

### 4.2 Error / empty / loading / offline states
- **E-01 (HIGH)** — No central spec for **error states** per page (PDP product not found → custom 404 vs not-found; order not found / spoofed sig → friendly 404 mentioned only in go-live item 7). Needs consistent `not-found.tsx`, `error.tsx` boundaries.
- **E-02 (MEDIUM)** — **Empty states** only defined for cart ("Trending deals recommendations") and search zero-results implies "Did you mean" + failed_searches capture; category empty, seller profile empty, notifications empty, admin tables empty, wishlist empty, comparison empty, autocomplete no-results → unspecified.
- **E-03 (MEDIUM)** — **Loading states**: skeletons specified for product grid (Suspense skeleton grids 8–12); not specified for checkout submit, admin tables, charts, autocomplete debounce spinner.
- **E-04 (MEDIUM)** — **Offline**: PRD §4.4 offline fallback skeleton + banner; acceptance tests needed; `sessions_anon` cookie caching rules not defined.

### 4.3 Security gaps to formalize
- **S-01 (HIGH)** — **Guest phone verification for alerts** (ProductAlert.anonymous_phone "verified guest") — verification flow (OTP?) for guest phone not defined.
- **S-02 (HIGH)** — **Order confirmation page access**: "signed ref_sig query param OR user_id=owner" — leak risk if ref+sig in shared link; acceptable per design but must define lifetime and revoke.
- **S-03 (MEDIUM)** — **analytics_events RLS-off** requires static bearer token config — token distribution/rotation undefined.
- **S-04 (MEDIUM)** — **CSRF**: Next Server Actions are CSRF-safe by SameSite/Origin checking; confirm SameSite=Lax/Strict on session cookie.
- **S-05 (MEDIUM)** — **Impersonation audit** specified; concurrency guard (one active impersonation at a time) undefined.
- **S-06 (LOW)** — **Rate-limit keying** for anonymous (by IP) vs authenticated (by user) — defined per-bucket partially; search 60/min/IP noted.

### 4.4 WhatsApp / checkout gaps
- **W-01 (HIGH)** — **Seller WhatsApp number source**: `OrderFulfillmentGroup.whatsapp_target` — where does the seller's number come from (seller_profiles.whatsapp_number field not in DATABASE_SCHEMA seller_profiles)? Field must exist.
- **W-02 (HIGH)** — **"customer_contacted" marking**: which actor (agent? seller? admin) and how stock transitions at that moment (reservation → confirmed debit). PRD says "agent replies ≤ TTL → customer_contacted → confirmed → fulfillment". The exact action and its permission (moderator/admin? seller?) undefined.
- **W-03 (MEDIUM)** — **Partial multi-seller response** (only one seller replies): design says groups are per-seller with per-group status; a group can be cancelled independently? Parent order state vs group state interplay undefined.
- **W-04 (MEDIUM)** — **WhatsApp re-send** link TTL and HMAC regeneration defined in route table (`/api/whatsapp/[orderRef]`); needs stock re-lock semantics after TTL cancellation.
- **W-05 (LOW)** — wa.me URL message truncation limits (wa.me text ~ 2KB URL-safe) — long carts risk clipping; define message length guard.

### 4.5 Performance / SEO / media gaps
- **P-01 (MEDIUM)** — Autocomplete & search API both hit the MV; MV refresh 15 min means new products take up to 15 min to appear in search but appear in catalog immediately — acceptable, must be documented and tested.
- **P-02 (MEDIUM)** — Product sitemap 50k URLs/page via streaming Route Handler — acceptable; needs `rel` prev/next and noindex rules defined in §13 SEO tests.
- **P-03 (LOW)** — No caching headers spec for public listing pages beyond ISR; SWR windows for `/u/` undefined.

---

## 5. RESERVATION & STOCK INTEGRITY — definition (design confirmed + gaps)

The design is strong and internally consistent:
- Atomic `reserve_variant()` SP with `FOR UPDATE SKIP LOCKED`, inline expiry sweep, `CHECK stock >= qty`, immutable `inventory_transactions` ledger, per-minute cron sweeper + on-demand sweep, order sweeper 2 min, reservation TTL 20 min (+10 once), order TTL 15 min.
- Oversell is impossible at the DB level (SQL constraint) — this is the required proof target.

**Acceptance list (see DATABASE_ACCEPTANCE.md §RES for full test matrix):** normal, multi-qty, concurrent (parallel promise.allSettled), insufficient stock, expired → release, cancel, checkout conversion, guest, authenticated, multi-seller, multi-variant, repeated clicks (idempotency — see M-02), refresh, duplicate, race window, cron failure (recovery on next run + on-demand), stock restoration exactness (ledger sums to stock), TTL extension once.

**Remaining gaps before implementation:** M-01 (qty cap), M-02 (idempotency), M-08 (extension persistence field), and the cron "sweeper failure" alert/retry policy.

---

## 6. WHATSAPP CHECKOUT STATE MACHINE — definition

State machine (consolidated from PRD §3.4/§3.5, Tech Arch §5, TASK-107/108):

```
cart → checkout(form: name/phone/email/delivery-or-pickup/coupon/notes)
     → Server Action createOrderFromCart:
         BEGIN
           lock reservations FOR UPDATE → confirm not expired (else release + fail)
           INSERT orders (status=pending_whatsapp, HMAC ref ELEC-YYMM-XXXX, sig8, ttl=15min)
           INSERT order_items
           INSERT order_fulfillment_groups (1 per seller + 1 platform) + wa targets
           INSERT order_events (pending_whatsapp, actor='system')
           INSERT coupon_redemption (if any)
           attribution/session update
         COMMIT
     → N wa.me URLs returned (1 per group), prefilled text (items, totals, zone, ETA, buyer, Ref+SIG)
     → Browser opens WhatsApp (multi-tab on mobile)
TTL 15 min window:
     agent/seller marks customer_contacted (W-02: actor + permission undefined)  → stock permanently debited, → confirmed
     OR sweeper cancels → stock restore (inventory_transactions reason reserve_release) + reservation release
Post-contact: confirmed → processing → out_for_delivery | ready_for_pickup → delivered (POD photo + signature) → review unlocked (order_item FK).
Cancel paths: TTL timeout, guest abandon, fraud (super_admin) with audit.
WhatsApp not opening / user closes WhatsApp / never sends → order remains pending_whatsapp until TTL → auto-cancel.
Partial group response → per-group status; parent-order semantics TBD (W-03).
```

Gaps to close before implementation: W-01, W-02, W-03, W-05 + HMAC key setup in DB `current_setting('app.hmac_key')`.

---

## 7. CATALOGUE INTEGRITY (CATALOGUE_MASTER.md audit)

**Confirmed strengths:**
- 13 categories / ~165 subcategories fully enumerated with slugs.
- Brands per category enumerated (alphabetical).
- Spec templates per category with exact keys, types, units, filterable flags.
- Filter widget order per category defined.
- Product status enum + used listing status enum defined.
- Search synonym dictionary (English + Sheng/Swahili + brand nicknames + charging standards) with directionality.
- §04 rule: "NEVER add a Product Model row without an admin-supplied source... Leave TODO." — respected.

**Issues found in catalogue (flagged, not changed):**
- **CAT-01 (MEDIUM)** — `televizheni` typo at line 948 ("televizheni" — actual Sheng is "televisheni"). Documented; fix requires authorization.
- **CAT-02 (MEDIUM)** — C09 subcategory slugs `gaming-monitors-cross`, `gaming-laptops-cross`, `gaming-pcs-cross` — the `-cross` suffix is a UI filter-link concept, not a true subcategory. Need a decision on whether these are real subcategory rows or virtual filter links.
- **CAT-03 (MEDIUM)** — C13 "Memory Cards (also C12 cross-ref)" and "Microphones", "Webcams" duplicates — C13 lists subcategories that also exist in C08/C10/C12. The rule "Products live in one category; cross-links allowed" is not explicit for how a product in both Audio (C08) and Accessories (C13) is stored (single `category_id` vs multi).
- **CAT-04 (LOW)** — `jua_kali` and `mwitu` synonyms marked `TODO` — by design; must remain TODO.
- **CAT-05 (LOW)** — §04 SKU example `TEC-SP20P-BLU-256` uses "BLU" color while attributes use full names; convention documented, fine.
- **CAT-06 (LOW)** — Category §02 C13 row count (47 subcategories) vs "Accessories §07" rules — consistent.

**AI-rule verification:** CATALOGUE_MASTER is authoritative; implementation plan must read products/brands/specs/filters/synonyms exclusively from it; never invent. Confirmed the plan does this (TASK-004 seed + TASK-102 search synonyms). **No AI product imagery anywhere.** ✅

---

## 8. IMAGE / MEDIA ACCEPTANCE (consolidated — used by TASK-003/004/005/010/104)

| Aspect | Specified requirement | Source |
|--------|----------------------|--------|
| Admin product media slots | 10 (front/back/left/right/top/bottom/box/accessories/lifestyle/video.mp4) | CATALOGUE §08 |
| Seller listing photos | ≤ 8 images (+ optional 1 video ≤ 120 s) | PRD §2.2.5, CATALOGUE §08 |
| Formats | Store as `.webp`; uploads png/jpeg/webp auto-convert via Edge Function | CATALOGUE §08 / Tech Arch §8.1 (limit conflict — see C-02) |
| Max sizes | **CONFLICT** 4 MB img / 120 MB vid vs 15 MB img / 200 MB vid | C-02 |
| Min resolution | ≥ 800×800 images; video ≤ 1080p | CATALOGUE §08 |
| Transforms | `_thumb` 400×400 q80 cover; `_large` 1200×1200 q85 inside; `_zoom` 2000×2000 q90 + watermark 7%; `_og_social` 1200×630 + gradient + price badge | CATALOGUE §08 |
| Buckets | `product-images`, `used-images`, `kyc` (private, RLS seller_id=auth.uid(), admin read) | Tech Arch §8.1 |
| Upload | Signed POST URLs; MIME validation; virus scan (provider TODO) | CATALOGUE §08 (TODO: confirm provider) |
| Moderation state | `used_listing_photos` status pending_review/approved/rejected | CATALOGUE §08 |
| Missing image | Skeleton shimmer / "Image coming soon" placeholder — NO AI images | DESIGN_SYSTEM §8 |
| Alt text | Meaningful alt from SEO name; decorative alt="" | DESIGN_SYSTEM §7 |
| Deletion | Soft delete; storage objects lifecycle (orphan cleanup) undefined — flag | This audit |
| Ordering | `sort_order` implied; not formally on product_images — flag for DDL | This audit |

**Open items:** orphan object cleanup, product_images sort_order, virus-scan provider, size conflict (C-02).

---

## 9. PERFORMANCE ACCEPTANCE (targets, from Tech Arch §8.2 — distinguish target vs blocker)

| Metric | Target (Tech Arch §8.2) | Hard blocker (would fail go-live) |
|--------|------------------------|-----------------------------------|
| LCP mobile / desktop | < 2.0 s / < 1.2 s | > 2.5 s mobile (Lighthouse mobile ≤ 90 blocks) |
| INP | < 100 ms | — |
| CLS | < 0.08 | > 0.1 |
| Autocomplete p95 | < 200 ms | > 500 ms |
| Checkout create order p95 | < 800 ms | > 2 s (SLA alert #2) |
| First-load JS mobile | < 120 KB gzip | — |
| DB hot-path p95 | < 50 ms (EXPLAIN ANALYZE reviewed) | — |
| Search full p95 | 10 s revalidate; not explicitly timed | define in AUTOMATED_TEST_PLAN §PERF |
| Product list pagination | keyset after page 3 (no OFFSET O(N)) | — |

**Performance test plan** → `AUTOMATED_TEST_PLAN.md` §PERF + `GO_LIVE_GATES.md` (Lighthouse thresholds).

---

## 10. SEO ACCEPTANCE (summary — full tests in AUTOMATED_TEST_PLAN.md §SEO and GO_LIVE_GATES.md)

Covered: metadata via generateMetadata everywhere; canonical; paginated sitemap (50k/URL); robots disallow /admin /account /api /checkout; JSON-LD (Product/BreadcrumbList/ItemList/ProfilePage/Organization/WebSite/SearchAction/OrderAction/FAQPage); dynamic OG per product; used listings + seller pages; noindex on deep filter combos; discontinued/unavailable products handling (status enum) — tests enumerated in AUTOMATED_TEST_PLAN §SEO-*.

---

## 11. RESPONSIVE UI ACCEPTANCE (summary — full matrix in MANUAL_TEST_PLAN.md §MOBILE)

Viewports: 360 (Galaxy A), 390 (iPhone 15), 430 (iPhone 15 Pro Max), 768 (iPad mini), 1440 (desktop). Per page: no horizontal overflow, nav/search/filters usable, thumb zone ≤ 120 px, sticky elements don't cover content, 16px inputs (iOS zoom), 48×48 touch targets, keyboard + SR, prefers-reduced-motion. **See MANUAL_TEST_PLAN.md §MOBILE for the per-page grid.**

---

## 12. ADMIN ACCEPTANCE (summary — full in FEATURE_ACCEPTANCE_MATRIX.md ADMIN-*)

The admin panel is an operational control center. Every capability enumerated in FEATURE_ACCEPTANCE_MATRIX §ADMIN (KPIs, products CRUD+bulk, inventory alerts, category tree + spec templates, brands, sellers + KYC, moderation queue, orders + fulfillment, delivery zones, pickup locations, coupons, homepage sections + banners, search analytics + failed searches, reports, disputes, notifications, audit logs, system settings, permissions/RBAC). **Open gap:** no "banners" table in migration plan (C-06) and no explicit 2FA-enforcement policy test (Tech Arch says 2FA mandatory admin/moderator/super-admin + seller over 200k/month).

---

## 13. DEFENSE AGAINST SCOPE CREEP

Per `AI_START_HERE.md`: no redesign, no new UI libs, no schema changes without request, no invented catalogue data. This audit adds **no** new architecture; it only documents acceptance criteria and flags decisions requiring the human. **No application code was written in this task.**

---

## 14. AUTHORIZATION REQUIRED BEFORE TASK-002

The following source-document edits are required (or explicit human rulings that supersede this list). None were made.

1. **C-01** — Palette/font/CTA: confirm DESIGN_SYSTEM.md as token authority; approve PRD §4.1 palette/font removal or overwrite.
2. **C-02** — Upload limits: pick 4 MB/120 MB (CATALOGUE) or 15 MB/200 MB (Tech Arch). Recommend 15 MB/200 MB for file-size but note video length cap 120 s.
3. **C-03** — Categories: approve CATALOGUE_MASTER §01 as the authoritative 13-category list; delete "Feature Phones" from Tech Arch §6.3 seed text.
4. **C-04** — Spec tables: approve `spec_templates` + `spec_values jsonb` (matches DATABASE_SCHEMA + TASK-004) over ERD `specification_types`/`product_specifications`, or vice versa.
5. **C-05** — Roles: approve `roles` table = 5 rows (buyer/seller/moderator/admin/super_admin), guest = anon implicit, junction `role_permissions`.
6. **C-06** — Approve adding `wishlists, recently_viewed, search_history, analytics_events, failed_searches, banners, role_permissions, permissions, warranties` to DATABASE_SCHEMA migration plan (or explicit justification for omission).
7. **C-07** — Decide whether `product_models` is a physical table (recommend: not a table; products + variants suffice; catalogue seed is conceptual).
8. **C-08** — Approve the explicit `order_status_enum` value list + transition table.
9. **M-01 / M-02 / M-08** — Reserve qty cap (recommend 5), idempotency mechanism (recommend unique partial index on active reservations per session+variant), TTL-extension persistence field.
10. **W-01 / W-02 / W-03** — seller WhatsApp number field location; who marks `customer_contacted`; parent vs group status on partial multi-seller response.
11. **CAT-01 / CAT-02 / CAT-03** — typo fix, virtual cross-link subcategory model, single-category storage rule.
12. **M-11 / M-12** — pickup fee and split-group delivery fee formula.

---

## 15. VERDICT

> ### VERDICT: `GO WITH CONDITIONS`
>
> The architecture is genuinely comprehensive and internally coherent at the design level (RLS via JWT claims, atomic stock SP, HMAC refs, split fulfillment, KYC gating, catalogue single-source-of-truth, design tokens, observability). The document set is far above typical pre-build quality.
>
> **However, implementation of TASK-002 cannot begin without undocumented business/architecture decisions.** The two `BLOCKER` contradictions (C-01 palette/fonts, C-02 upload limits) plus C-04 (spec table naming) and C-06 (missing DB entities) mean a developer following the docs verbatim would make four irreversible architecture choices that are ambiguous today.
>
> **`MISSING INFORMATION` (must be supplied before TASK-002 / TASK-003 / TASK-004):**
> 1. Ruling on §14 items 1–2 (palette authority; upload limits).
> 2. Spec-table naming ruling (C-04).
> 3. Complete migration table inventory incl. the missing entities (C-06).
> 4. Reserve qty cap + idempotency + extension persistence (M-01/M-02/M-08).
> 5. `order_status_enum` full value list (C-08).
> 6. Seller WhatsApp number field + `customer_contacted` actor/permission (W-01/W-02).
> 7. Parent-vs-group order status semantics on partial multi-seller responses (W-03).
>
> **Recommended path:** Human reviews §14 and either (a) issues a single ruling doc (recommended: an ADR appended to Technical-Architecture.md), or (b) authorizes the AI to apply the recommended resolutions above. Then `TASK-002` can proceed with zero undocumented decisions.
>
> **`GO` is not granted yet.** The condition for `GO` is the §14/§15 ruling. The moment those 7 items are answered, TASK-002 is unblocked.

---

**End of IMPLEMENTATION_READINESS.md.** This document is the audit gate. It is documentation only; no code or SQL was produced.
