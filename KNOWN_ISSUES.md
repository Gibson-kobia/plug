# KNOWN_ISSUES.md — Permanent Issue Register (Kenya Electronics Marketplace)

**Purpose:** Every unresolved (and historically resolved) issue has a unique permanent ID. Future AIs read this file to understand problems discovered by earlier sessions without re-discovering them. **Never delete or rewrite history** — resolved issues get `status: RESOLVED` and a resolution date/by.

**Scalar:** status = `OPEN` | `RESOLVED` | `BLOCKED` | `SUPERSEDED`. Owner = `Human` | `TASK-xxx` | `AI` | `N/A`.
When resolved: set `status: RESOLVED`, fill `resolution`, `resolved_by`, `resolution_date`. Keep the row.

**All issues below were discovered by TASK-001-B / AI Session SESS-002 on 2026-08-08** unless otherwise noted.

---

## OPEN — C-series (cross-document contradictions)

### C-01 — Design token conflict (primary color / fonts / CTA)
- **ID:** C-01 · **Severity:** BLOCKER · **Status:** OPEN · **Discovered by:** TASK-001-B (SESS-002) · **Date:** 2026-08-08
- **Affected area:** DESIGN_SYSTEM §1/§2 · PRD §4.1 · TASK-002 · TASK-010 · every component.
- **Exact problem:** PRD says primary=brand-navy #0B2545, CTA gradient navy, accent copper #C4651A, body font Work Sans + mono JetBrains Mono. DESIGN_SYSTEM (the TASK-010 implementation doc) says primary=copper #EA6A0C, secondary navy #1E2C50, jade #12B76A, display Sora/body Inter, no mono. TASK-002 explicitly says "Kenyan Copper/Jade palette from DESIGN_SYSTEM.md". Two doc authorities disagree on the primary CTA color and font stack.
- **Evidence:** `IMPLEMENTATION_READINESS.md` C-01.
- **Decision required:** Human rules which doc is the token authority (recommend DESIGN_SYSTEM = authority; PRD §4.1 to be updated/superseded).
- **Resolution:** — · **Resolved by:** — · **Date:** —

### C-02 — Upload size / format limits conflict
- **Severity:** BLOCKER · **Status:** OPEN · **Discovered by:** TASK-001-B · **Date:** 2026-08-08
- **Affected:** CATALOGUE_MASTER §08 (images ≤4MB, video ≤120MB, ≥800×800, webp-only stored) vs Technical-Architecture §8.1 (image ≤15MB, mp4 ≤200MB, mime png/jpeg/webp/mp4).
- **Exact problem:** Two different validation budgets. Storage / Edge-function / frontend validation cannot be built consistently.
- **Evidence:** `IMPLEMENTATION_READINESS.md` C-02.
- **Decision required:** single authority. Recommend CATALOGUE §8 client-side + Storage enforcement, Tech-Arch limits for Storage object (or vice-versa) — human picks.
- **Resolution:** — · **Resolved by:** — · **Date:** —

### C-03 — Category count 13 vs 14 (“Feature Phones”)
- **Severity:** HIGH · **Status:** OPEN
- **Affected:** CATALOGUE §01 (13 categories, no Feature Phones; “order is meaningful”) vs Tech-Arch §6.3 seed (14 incl. Feature Phones, different order).
- **Problem:** Seed migration + navigation order ambiguous.
- **Evidence:** READINESS C-03.
- **Decision:** CATALOGUE = authority (13). Tech-Arch §6.3 list to be corrected (pending authorization).
- **Resolution:** — · **Resolved by:** — · **Date:** —

### C-04 — Spec-table entity naming (spec_templates vs specification_types)
- **Severity:** formerly BLOCKER → **RESOLVED** · **Status:** RESOLVED · **Resolved by:** SESS-004 (oc/deepseek-v4-flash-free) · **Date resolved:** 2026-08-08
- **Affected:** DATABASE_SCHEMA 0002 (spec_templates + spec_values jsonb) vs Tech-Arch ERD (spec_types + product_specifications).
- **Resolution:** Implemented `public.spec_templates` + `public.spec_values` (JSONB) in `0002_catalog_core.sql`, matching DATABASE_SCHEMA + TASK-004 + CATALOGUE §04/§05 guidance. Tech-Arch ERD names treated as schema-diagram-only and superseded by DATABASE_SCHEMA for naming.

### C-05 — Role model consistency (5 vs 6 roles; role_permissions)
- **Severity:** HIGH → **RESOLVED** · **Status:** RESOLVED · **Resolved by:** SESS-004 · **Date:** 2026-08-08
- **Affected:** PRD §2.1 (6 roles incl guest) vs TASK-003 (“6 roles (no guest)”) vs DATABASE_SCHEMA (0001 “roles (5)”).
- **Resolution:** Implemented **5 role rows** (buyer, seller, moderator, admin, super_admin) in `0001_init_roles_and_auth.sql` with guest = Supabase `anon` JWT (no guest row), matching DATABASE_SCHEMA 0001 and PD-05 recommended default. `role_permissions` junction remains application-layer (RBAC via permission keys); not materialized as a table — flag if a physical permissions table is later required (see C-06).

### C-06 — Missing entities in DATABASE_SCHEMA migration plan
- **Severity:** BLOCKER · **Status:** OPEN
- **Affected:** DATABASE_SCHEMA 0001–0006 · Tech Arch ERD · PRD account dashboard.
- **Missing tables (present in ERD/interfaces, absent in migration index):** wishlists, recently_viewed, search_history, analytics_events, failed_searches, banners, permissions, role_permissions, warranties, product_models (see C-07).
- **Decision:** add to correct migration or explicitly justify omission — before SQL generation.
- **Resolution:** — · **Resolved by:** — · **Date:** —

### C-07 — product_models physical vs conceptual
- **Severity:** MEDIUM · **Status:** OPEN
- **Affected:** CATALOGUE §4 (maps to products+variants) vs ERD (`product_models` table).
- **Decision:** is `product_models` a real table? (Recommend: NO; models live in `product_models`→products naming concept; seed via products+brands. Actually if ERD keeps it, define it.) Human decision.

### C-08 — order_status_enum not enumerated
- **Severity:** HIGH · **Status:** OPEN
- **Affected:** PRD §3.4 FSM (9 states implied) vs TASK-006 “8-state FSM” vs OrderStatus type undefined.
- **Decision:** enumerate exact `order_status_enum` + allowed-transitions table.

### C-09 — image optimization targets (minor)
- **Severity:** LOW · **Status:** OPEN · transform q vs next/image q (CATALOGUE vs Tech-Arch §2). Non-blocking; record + document layer precedence.

### C-10 — SEO brand token mismatch (NairobiElectronics vs electronics.co.ke)
- **Severity:** LOW (INFO) · **Status:** OPEN · add `SITE_BRAND` token to system_settings.

---

## OPEN — M-series (missing business rules / gaps)

### M-01 — Reserve quantity cap (anti-hoarding)
- **Severity:** HIGH · For reserve_variant no max qty per session per variant. Needed vs grief/fraud (SEC-017). Decision: cap (recommend 5).

### M-02 — Idempotency / duplicate-request protection (reserve + order create)
- **Severity:** HIGH · No idempotency key / unique constraint preventing duplicate reserves or duplicate orders from repeated click/refresh. Recommend partial unique index on active reservations (session_id, variant_id) + idempotency header on checkout.

### M-03 — Cart line quantity / items-per-cart limits
- **Severity:** HIGH · undefined — recommend max qty per SKU (e.g., stock cap) + max distinct lines (e.g., 50).

### M-04 — Coupon edge cases (single-use flag, stacking, used-listing scope, min/max payout)
- **Severity:** MEDIUM · Coupon lacks `single_use` (has max_uses_total + uses_per_user); stacking with auto-bundles; category/product/seller scope on used listings; coupon + commission interplay.

### M-05 — Refund/return window & thresholds
- **Severity:** MEDIUM · “7-day window” formal; condition thresholds for full/partial refund; return vs dispute interplay.

### M-06 — Negotiable-flag semantics (display + confirm)
- **Severity:** MEDIUM · PDP/cart behavior when negotiable=false/true; how price is confirmed post-What; how ledger finalizes.

### M-07 — Verified-listing badge criteria + storage field
- **Severity:** MEDIUM · needs an explicit `verified_listing` field + workflow (admin/super inspection) separate from seller-verified.

### M-08 — Reservation extension +10 persistence
- **Severity:** MEDIUM · reservations needs `extension_count`/`extended_until` to enforce once-rule as per M-08 resolve on DB side.

### M-09 — KES formatting / locale helper
- **Severity:** MEDIUM · formalize `Intl.NumberFormat('en-KE'...)`, KSh vs KES usage in DESIGN SYSTEM / utils.

### M-10 — “popular” sort metric undefined
- **MEDIUM** · define popularity (views? orders? 30d trend — CATALOGUE mentions “trending 30d” for accessories → reuse).

### M-11 / M-12 — Pickup fee + split-group delivery fee formula
- **MEDIUM** x2 · pickup free? delivery fee split per group sum vs per order once; needed before checkout build.

### M-13 — price-drop / back-in-stock trigger mechanics (cron)
- **MEDIUM** · who fires product_alerts (a cron or event-handler) not in pg_cron list. Add job.

### M-14 — Newsletter storage
- **LOW** · landing newsletter → where stored (recommend `newsletter_subscriptions`).

### M-15 — Wishlist share link endpoint
- **LOW** · public share route undefined.

### M-16 — App-install banner visit-count storage
- **LOW** · 3-visit rule storage target undefined.

---

## OPEN — E-series (error / empty / loading / offline states)

### E-01 — Central error-state spec (PDP 404, spoofed-order 404, not-found/error boundaries)
**Severity:** HIGH · define not-found.tsx / error.tsx strategy + custom 404 content.

### E-02 — Empty-state set (search zero-result, category empty, seller empty, moderation empty, notifications empty, admin tables, wishlist)
**MEDIUM:** MEDIUM.

### E-03 — Loading states (checkout submit, admin tables, charts, autocomplete debounce)
**MEDIUM:** MEDIUM.

### E-04 — Offline PWA detail (cached skeleton + banner; what’s allowed offline)
**MEDIUM:** MEDIUM.

---

## OPEN — S-series (security gaps / formalize)

### S-01 — Guest phone verification for alerts (anonymous_phone "verified guest")
- **HIGH** — define OTP-verification flow for guest phone before product_alerts.

### S-02 — Order-confirmation link lifetime/revocation
- **HIGH** — shared ref+sig URL; define TTL + revoke-on-cancellation.

### S-03 — analytics_events bearer token rotation
- **MEDIUM**.

### S-04 — CSRF: SameSite cookie & action-origin checks
- **MEDIUM** — confirm SameSite=Lax/Strict + Server-Action origin validation.

### S-05 — Impersonation single-active guard
- **MEDIUM** — enforce only one active impersonation per admin.

### S-06 — Rate-limit keying doc (IP vs user) + search 60/min clarity
- **LOW**.

---

## OPEN — W-series (WhatsApp checkout)

### W-01 — Seller WhatsApp target number field (schema)
- **HIGH** — order_fulfillment_group.whatsapp_target needs source field on seller_profiles (missing).
### W-02 — Who may mark `customer_contacted` + permission key
- **HIGH** — actor = agent/moderator/admin/seller? permission key + role. Not defined.
### W-03 — Partial multi-seller response semantics (group vs parent order status)
- **MEDIUM** — define per-group cancel + parent lifecycle.
### W-04 — WA re-send HMAC & TTL re-lock after cancel
- **MEDIUM**.
### W-05 — wa.me text clamping (message truncation guard)
- **LOW**.

---

## OPEN — P-series (performance)

### P-01 — MV freshness 15 min vs catalog immediate (documented tolerance)
- **MEDIUM** — feature parity acceptance test (search vs catalog gap allowed ≤ 15 min).

### P-02 — Pagination sitemap + noindex rules (50k/page)
- **MEDIUM**.

### P-03 — SWR windows for /u/ and cache headers
- **LOW/MEDIUM**.

---

## OPEN — CAT-series (catalogue integrity)

### CAT-01 — `televizheni` spelling typo (CATALOGUE §10 line ~948 → actual Sheng "televisheni")
- **MEDIUM · fix requires authorization**.
### CAT-02 — C09 `-cross` virtual subcategories (links) vs real rows
- **MEDIUM** — decide subcategory model.
### CAT-03 — multi-category membership (C13 accessories cross-link to C08/C10/C12)
- **MEDIUM** — single category_id vs multi. Decision needed.
### CAT-04 — jua_kali / mwitu synonyms left TODO (by design)
- **LOW · INFO — keep TODO**.
### CAT-05 — SKU keyword length edge cases
- **LOW**.
### CAT-06 — accessories compatibility_slugs[] model
- **MEDIUM** — array of slugs vs join table. Decision needed.
---

## OPEN — Environment & infra (ENV-series, discovered SESS-004 2026-08-08)

### ENV-001 — Cannot execute database migrations (no local/remote Supabase runtime)
- **Severity:** BLOCKER (environment) · **Status:** OPEN · **Discovered by:** SESS-004 · **Date:** 2026-08-08
- **Affected:** all Level-B DB verification (migration apply, RLS tests, `db push`), AUTOMATED_TEST_PLAN DB/E2E steps.
- **Exact problem:** Docker daemon not running (no Docker Desktop service/executable), `psql`/Postgres absent (WSL apt install timed out), Supabase CLI unauthenticated (no `SUPABASE_ACCESS_TOKEN`) and no linked project (`supabase/.temp` absent). So migrations 0001–0006 cannot be executed or tested here.
- **Decision required:** Human starts Docker Desktop, _or_ provides `SUPABASE_ACCESS_TOKEN` + links a staging Supabase project, _or_ explicitly allows proceeding with Level-A-only validation.
- **Resolution:** — · **Resolved by:** — · **Date:** —

### OBS-001 — `@baselime/nextjs` not published on npm (architecture gap)
- **Severity:** MEDIUM · **Status:** OPEN · **Discovered by:** SESS-005 · **Date:** 2026-08-08
- **Affected:** Technical-Architecture §2 (lists `@baselime/nextjs`); TASK-011 Baselime integration; `src/lib/observability/baselime.ts`.
- **Exact problem:** `npm view @baselime/nextjs` → 404 (package does not exist on registry as of 2026-08-08). `@baselime/node-opentelemetry` (0.5.8) exists but is a different, older package. Cannot install the exact library the architecture names.
- **Decision required:** Human/arch picks: (a) use `@vercel/otel` (Vercel-native OpenTelemetry), (b) use `@baselime/node-opentelemetry`, or (c) drop Baselime. Adapter stub currently no-ops; no fabricated config.
- **Resolution:** — · **Resolved by:** — · **Date:** —

### OBS-002 — `@logtail/next` requires Next ≥15; project pins Next 14.2
- **Severity:** MEDIUM · **Status:** OPEN (adaptation in place) · **Discovered by:** SESS-005 · **Date:** 2026-08-08
- **Affected:** Technical-Architecture §2 (`@logtail/next`); `src/lib/observability/logtail.ts`.
- **Exact problem:** `@logtail/next@0.4.0` declares `peer next@">=15.0"`; this project pins `next@14.2.35` (DEC-001). Installing it produces ERESOLVE conflict.
- **Adaptation:** used `@logtail/node` (0.5.8, Next-agnostic) behind a thin wrapper. Logtail drain remains functional; Next-specific request logging middleware may be added when the project upgrades Next.
- **Decision required:** accept `@logtail/node` wrapper (recommended) or upgrade Next. 
- **Resolution:** — · **Resolved by:** — · **Date:** —

### DB-NOTE-01 — delivery_zone fee_kes & pickup seeds are illustrative
- **Severity:** MEDIUM · **Status:** OPEN · **Discovered:** SESS-004 · **Affected:** `0005_fulfillment.sql` (fees 150–600 KES, single Nairobi CBD pickup row).
- **Problem:** Values are reference seeds; must be validated/replaced with real rates by the human before go-live. Not fabricated catalogue product data — flagged.

### DB-NOTE-02 — Search synonym dictionary is a table, not a filesystem thesaurus
- **Severity:** MEDIUM/INFO · **Status:** OPEN · **Discovered:** SESS-004 · **Affected:** `0002_catalog_core.sql` + `search_synonyms`.
- **Problem:** CATALOGUE §10 specifies a `.ths` thesaurus file; hosted Supabase cannot create dictionary files. Implemented as `search_synonyms` table + query-expansion. Keep flagged for search perf review.

---

## RESOLVED (keep history — never delete)

### C-04 — Spec-table naming (RESOLVED by implementation, see §C-04 above)
### C-05 — Role model (RESOLVED by implementation, see §C-05 above)
### DB-INTEG-001 — Business-data integrity / Order-Confirmation derivation not explicit (RESOLVED)
- **Severity:** HIGH → **RESOLVED** · **Status:** RESOLVED · **Discovered by:** SESS-005 · **Date:** 2026-08-08
- **Affected:** AI_START_HERE.md (control layer); all future UI/screens showing business values.
- **Problem:** specs forbade inventing catalogue data but did not enumerate the full business-value list nor explicitly guarantee Order Confirmation/checkout amounts are derived from authoritative order state.
- **Resolution:** added permanent **§4.4 BUSINESS-DATA INTEGRITY & PROVENANCE** to AI_START_HERE.md (DEC-017): never silently invent/guess/fabricate business data; explicit PLACEHOLDER (`TODO`/`PLACEHOLDER`/`DEV_ONLY`) + provenance chain; Order Confirmation & commerce screens must render authoritative order state / server-calculated values only.
- **Resolved by:** SESS-005 (oc/deepseek-v4-flash-free) · **Resolution date:** 2026-08-08

**All other TASK-001-B findings remain OPEN.**

---

**End of KNOWN_ISSUES.md — append-only. Assign ID before closing. Never delete rows.**