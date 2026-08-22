# AUTOMATED TEST PLAN — Kenya Electronics Marketplace

**Purpose:** Enumerate every feature the AI (headless agent) can verify automatically, with exact assertions. Complements MANUAL_TEST_PLAN.md (no overlap). DB-specific checks live in DATABASE_ACCEPTANCE.md; security probes in SECURITY_ACCEPTANCE.md (referenced here).

**Stack intent (from TA §2):** Vitest (unit) + Playwright (e2e). DB tests executed against a disposable Supabase local instance (`supabase db reset`) or CI Postgres. Coverage gates: unit+integration ≥ 80% on `src/lib` and `src/schemas`; e2e covers the 13 core journeys below.

---

## §1 UNIT TESTS (Vitest, no network)

### 1.1 Formatting & helpers (`src/lib/utils`)
- **UT-FORMAT-01 formatKES**: `formatKES(24999)` === `"KES 24,999"`; zero/negative; fractional → error; tabular-nums unaffected.
- **UT-FORMAT-02 slugify**: brand/model → kebab-case per CM §09; unicode & apostrophe; trailing dashes.
- **UT-FORMAT-03 truncate**: ≤N; at word boundary?; emoji-safe.

### 1.2 Validation (Zod, `src/schemas`)
- **UT-VAL-01 CheckoutSchema**: valid Kenyan phones `07xxxxxxxx/011xxxxxxxx/2547…/+2547…` PASS; `999`, `012`, empty → FAIL; cross-field superRefine (delivery requires zone, pickup requires loc) both sides.
- **UT-VAL-02 ListingReportSchema**: reason enum whitelist; invalid reason rejected.
- **UT-VAL-03 reviews schema** rating 1..5; FK enforced at DB (see below).

### 1.3 Pricing / delivery / commission
- **UT-PRICE-01** variant price = base + delta.
- **UT-PRICE-02** compare-at discount % computation.
- **UT-DELIV-01** zone lookup & fee: Nairobi zone map → fee+ETA correct; outskirts; nationwide range 2–5d.
- **UT-DELIV-02** split-group delivery fee: sum per group vs per order (per M-12 resolution).
- **UT-FIN-01** commission rule selection (category default vs tier), min/max cap; verified tier discount.
- **UT-FIN-02** seller_ledger running balance double-entry: sale credit, commission debit, refund, payout → `balance_after` matches hand-reconciled figures (table-driven cases).

### 1.4 Reservation math
- **UT-RES-01** TTL = now+20min; extension +10 once; second extension denied; expired boundary (now >= expires_at) per sweep rounding.
- **UT-RES-02** timer display label changes (jade>5 / amber1-5 / rose<1) — pure function.

### 1.5 Search normalization
- **UT-SRC-01** search normalization: loLet’s casing, whitespace collapse, punctuation.
- **UT-SRC-02** synonym expansion: "simu" → canonical smartphone (CM §10); "oraimo freepods" → earbuds + brand; evolution pairs exact.
- **UT-SRC-03** "Did you mean" trigger threshold (>=0.35) and non-trigger (<0.35).
- **UT-SRC-04** failed-search detection: zero-result query → marks `failed_searches`.

### 1.6 SKU & slug
- **UT-SKU-01** SKU generator: brand-model-color-storage uppercase pattern; uniqueness on collision.
- **UT-SKI-02** SKU format validation (regex).

### 1.7 Order ref signing
- **UT-HMIN-01** sign/verify HMAC round-trip with known key.
- **UT-HMIN-02** tampered sig fails verify.
- **UT-HMIN-03** 8-char truncation stability.

### 1.8 Permissions / utils
- **UT-PERM-01** role→permission matrix mapping.
- **UT-IMG-01** placeholder fallback path parser (front.webp).

## §2 DATABASE / SQL TESTS (Supabase local — moves section of DATABASE_ACCEPTANCE)

Reference: `DATABASE_ACCEPTANCE.md`. Assertion-level:
- RLS: `anon` sees only published/not-deleted; `authenticated` only own rows; admin on editor scope; cross-user attempt → 0 rows / error.
- **DB-001 Primary/unique**: SKU unique; product slug unique; (session,variant) active reservation uniqueness (per M-02 fix); order ref unique.
- **DB-002 Foreign keys**: FK integrity + `ON DELETE RESTRICT` — deleting a product with variants/orders must fail; cascade restricted join tables only.
- **DB-003 Check**: stock ≥ 0; qty > 0; price ≥ 0; reason enum values.
- **DB-004 Triggers**: `sync_auth_user_role_claim` updates JWT claim; `sync_category_product_count` on publish/delete; listing rating avg trigger; `deleted_at` guard.
- **DB-005 String** stored-procs: `reserve_variant` end-state machine; `release_expired…`; `sign_order_ref`.
- **DB-006 Reserved statement-proof (REQUIRED proof of no oversell):** run N concurrent (`BEGIN; SELECT…FOR UPDATE SKIP LOCKED`) reserve of same final unit → exactly ONE success, rest `OUT_OF_STOCK`; after all, `SUM(inventory_transactions.qty_delta) == current stock` (full ledger reconciliation assertion).
- **DB-007 order FSM** transitions mapping each state → allowed next; illegal transitions rejected by trigger.
- **DB-008 Audit**: every special write creates `audit_logs` row with actor, after JSON, notes.
- **DB-009 review gate**: review insert without delivered order_item → rejected.

## §3 INTEGRATION TESTS

- Coverers at `src/server-actions/*` through real Supabase client (local):
- **IT-001** registration → profile+role.
- **IT-002** cart add/merge-on-login.
- **IT-003** reserve through action (including rate-limit).
- **IT-004** checkout createOrderFromCart: creates order+groups+event+coupon; returns waUrls (n = groups); idempotency.
- **IT-005** WhatsApp URL builder: exact text composition (items, ref, sig, zone).
- **IT-006** seller listing submit auto-SL→draft (invalid step fails).
- **IT-007** moderation approve → published; reject needs reason.
- **IT-008** admin publish/unpublish product → RLS visibility flip.
- **IT-009** notification dispatch: prefer send path (AT mock / SES mock).

## §4 E2E TESTS (Playwright — headless chromium)

13 core journeys with EXACT named assertions:

1. **E2-01 Guest → search → product → reserve → cart → checkout** (assert: 5 tabs; reservation timer; stock decremented).
2. **E2-02 Guest → checkout → WhatsApp** (assert: order persisted, HMAC ref visible, WA URL returned; no auth).
3. **E2-03 Authenticated buyer → wishlist → cart → checkout** (assert merge & ownership).
4. **E2-04 Seller → signup → KYC → listing → submission** (assert draft autosave; step locks; submit → pending_review).
5. **E2-05 Moderator → review → approve/reject** (assert queue count; status flip; reason required on reject).
6. **E2-06 Admin → create product → publish** (assert variants SKU auto; visibility after publish).
7. **E2-07 Multi-seller cart split fulfillment** (assert 2 groups, 2 URLs, one ref).
8. **E2-08 Reservation → expiry → stock restored** (assert inventory delta 0 after cron/on-demand).
9. **E2-09 Order → confirmed → fulfillment → delivered → review write** (assert review gating).
10. **E2-10 Failed search → analytics → admin discovery** (assert failed_searches row → admin UI shows).
11. **E2-11 Unauthorized user → protected route** (assert redirect/403).
12. **E2-12 RLS attack attempts** (assert block via DB too).
13. **E2-13 Oversell/concurrent reserve** (parallel 2 buyers last unit; assert exactly 1 success).

## §5 PERF / AIR MEASURED AUTOMATED

Cf `GO_LIVE_GATES.md` — after each PR, run:
- **PERF-01 homepage LCP / INP / CLS vs §NAP performance budget** (mobile & desktop) Playwright perf trace.
- **PERF-02 category ISR 300s**; assert second fetch served from ISR cache.
- **PERF-03 search full page seek pagination** p95 < target via `timing` logs.
- **PERF-04 autocomplete edge** p95 < 200 ms (HTTPS call).
- **PERF-05 PDP ISR 60s** + revalidateTag on mutation.
- **PERF-06 cart + checkout action duration p95 < 800 ms**.

## §6 SEO automated checks
- **SEO-001** every route renders `<title>`, canonical, description (assert).
- **SEO-002** robots.txt disallows `/admin /account /api /checkout`.
- **SEO-003** sitemap index valid + links resolve (200).
- **SEO-004** PDP product JSON-LD schema valid (assert priceCurrency KES, availability, itemCondition, aggregateRating), BreadcrumbList.
- **SEO-005** category ItemList schema.
- **SEO-006** discontinued/unpublished → `noindex` + 404 PPC? (decide) 
- **SEO-007** duplicate content: same product variants few canonical href; filtered URLs canonicalized.

## §7 ASSEMBLY & CI
- CI (GitHub Actions on Vercel preview): unit + db + integration + e2e + lighthouse gates; block merge on fail. `npm run test`, `npm run test:e2e`, `npx playwright test` (needs DB service).

---

**End of AUTOMATED_TEST_PLAN.md**