# CURRENT TASK

**Status:** **TASK-002 ✅ · TASK-003..008 (migrations written, execution pending) · TASK-009 ✅ · TASK-010 ✅ · TASK-011 ✅ · SESS-006 (Storefront UI & Kenyan Market Price Research) ✅** — see COMPLETED. DB execution (Level B) still pending environment (ENV-001). Next implementation task NOT yet activated by the human.

---

## Active Task

**Task ID:** `SESS-006` — **Storefront UI & Kenyan Market Price Research — COMPLETE** (SESS-006).
- Preserved all ImageKit export and inventory files in `data/`.
- Conducted audit of ImageKit assets vs `CATALOGUE_MASTER.md` taxonomy (`docs/CATALOGUE_UI_AUDIT.md`).
- Researched current Kenyan retail market pricing from PhonePlace Kenya, Avechi, Jumia (`docs/PRICE_RESEARCH_REPORT.md`), generating `data/product-market-research.json` & `csv`.
- Integrated real ImageKit CDN imagery & Market Reference pricing across Home, Category, Product Detail, and Search routes without fabricating stock or platform prices.
- Built `ProductGallery` client component and optimized static generation for fast production builds (181 SSG pages verified).
- Details in `AI_HANDOFF.md` SESS-006 + `DEVELOPMENT_LOG.md` + `walkthrough.md`.

**If you are an AI starting here:**
1. Read `AI_START_HERE.md` → `PROJECT_STATE.md` → `AI_HANDOFF.md` first.
2. TASK-002/009/010/011 & SESS-006 complete — do NOT redo. DB migrations 0001–0006 written; execution still pending human (ENV-001).
3. Await human: (a) run migrations on a live Supabase/Postgres, or (b) authorize next app task.
4. Do NOT start a later task (TASK-102+ etc.) without explicit assignment.
5. Preserve the Business-Data Integrity rule (AI_START_HERE §4.4).

**Migrations written (each validated statically):**
- `0001_init_roles_and_auth.sql` (roles, profiles+trigger, audit_logs, system_settings, sessions_anon, notification_preferences)
- `0002_catalog_core.sql` (categories/brands/products/variants/images/price_history, mv_search_index, synonyms, spec_templates/values, alerts, reviews, homepage)
- `0003_sellers_moderation.sql` (seller_profiles, KYC docs, drafts, used_listings/photos, moderation, reports, enquiries)
- `0004_orders_stock_finance.sql` (cart, reservations+sweepers, reserve_variant SKIP LOCKED, finance, `sign_order_ref`, orders FSM, fulfillments, disputes, refunds, payments)
- `0005_fulfillment.sql` (delivery_zones, pickup_locations, FK closure)
- `0006_rls_final.sql` (final RLS/JWT-role pass, grants, pg_cron jobs, rate-limit notes)
- `supabase/tests/rls_tests.sql` (RLS/SQL test scaffold)

---

## Task Template (every TASK ID must define ALL fields below)

A task is only "started" when the Human (or approved procedure) moves it into `## Active Task` above. The active task must also appear in `PROJECT_STATE.md`.

| Field | Definition |
|-------|-----------|
| **OBJECTIVE** | single sentence: what the task achieves |
| **SCOPE** | files/folders/areas the task may touch |
| **FILES EXPECTED TO CHANGE** | explicit list |
| **FILES THAT MUST NOT CHANGE** | explicit list (guard rails) |
| **DEPENDENCIES** | prerequisite tasks/issues/decisions |
| **ACCEPTANCE CRITERIA** | success conditions (cross-ref FEATURE_ACCEPTANCE_MATRIX IDs) |
| **AUTOMATED TESTS** | unit/integration/DB/E2E that must pass (AUTOMATED_TEST_PLAN.md) |
| **MANUAL TESTS** | human verification required (MANUAL_TEST_PLAN.md / GO_LIVE_GATES H-IDs) |
| **DONE DEFINITION** | every field of AI_START_HERE §Definition of Done |
| **BLOCKERS** | KNOWN_ISSUES IDs that must be cleared first |

Implementation is tracked via: `PROJECT_STATE.md` (live) + `DEVELOPMENT_LOG.md` (history) + `AI_HANDOFF.md` (last handoff) + `KNOWN_ISSUES.md` (problems) + `DECISION_LOG.md` (decisions).

---

## Completed Tasks (chronological)

| Date | Task ID | Description | Completed By |
|------|---------|-------------|--------------|
| 2026-08-07 | `TASK-000-AR` | Architecture review — 59 issues identified, PRD Rev2 + Tech Arch Rev2 complete | Principal Architect Review Agent |
| 2026-08-08 | `TASK-001-B` | Pre-implementation validation — 7 acceptance/test/readiness docs; verdict GO WITH CONDITIONS | oc/deepseek-v4-flash-free (SESS-002) |
| 2026-08-08 | `TASK-001-C` | Multi-AI handoff/control layer — AI_START_HERE, PROJECT_STATE, KNOWN_ISSUES, DECISION_LOG, AI_HANDOFF, task template | oc/deepseek-v4-flash-free (SESS-003) |
| 2026-08-08 | `TASK-002` | Next.js foundation — verified: TS ✅ lint ✅ build ✅ dev-server ✅ `/` 200 ✅ | oc/deepseek-v4-flash-free (SESS-004) |
| 2026-08-08 | `TASK-003..008` | Database migrations 0001–0006 authored + statically validated (Level A). Execution (Level B) NOT RUN — no Docker/Postgres/linked project. See AI_HANDOFF | oc/deepseek-v4-flash-free (SESS-004) |
| 2026-08-08 | `TASK-009` | Middleware + session_id cookie + RBAC guards + JWT re-verification + server-only barrel — typecheck ✅ lint ✅ build ✅ | oc/deepseek-v4-flash-free (SESS-005) |
| 2026-08-08 | `TASK-010` | Design system component library (21 components + tokens) — typecheck ✅ lint ✅ build ✅ | oc/deepseek-v4-flash-free (SESS-005) |
| 2026-08-08 | `TASK-011` | Observability: Sentry config, Logtail wrapper, Baselime adapter, alert-policy + RUNBOOK.md — typecheck ✅ lint ✅ build ✅ | oc/deepseek-v4-flash-free (SESS-005) |
| 2026-08-08 | `DOC-005` | Business-Data Integrity & Provenance rule added (AI_START_HERE §4.4, DEC-017, DB-INTEG-001 resolved) | oc/deepseek-v4-flash-free (SESS-005) |
| 2026-08-14 | `SESS-006` | Storefront UI & Real ImageKit Data Integration — Home, Category, PDP, Search, ProductGallery (181 SSG pages verified) | Antigravity (SESS-006) |

---

## Queued Tasks (for reference only — do not start without explicit task assignment)

### Phase 1 — Project Bootstrap & Foundations
- **`TASK-002`** — Initialize Next.js 14.2 App Router project with TypeScript, Tailwind, ESLint, Prettier. Install @serwist/next, zod, react-hook-form, zustand, lucide-react, @radix-ui/* primitives, recharts, sentry. Configure `tsconfig.json` strict, tsconfig paths. Configure PostCSS/Tailwind with Kenyan Copper/Jade palette from DESIGN_SYSTEM.md. Create `.env.example` with all Supabase/Upstash/AT/Sentry keys. Create vercel.json config with regions `af-south-1` or `eu-west-2` for Kenya latency.
- **`TASK-003`** — Supabase bootstrap: `supabase init`, migrations folder structure. Create `0001_init_roles_and_auth.sql` — 6 roles (no guest), profiles table FK auth.users, `sync_auth_user_role_claim()` trigger, RLS seed policies, `audit_logs`, `system_settings`, `sessions_anon`, `notification_preferences` tables.
- **`TASK-004`** — Supabase migration `0002_catalog_core.sql` — categories (parent_id tree), brands, products, product_variants (SKU UNIQUE), product_images, price_history, mv_search_index with GIN (tsvector + gin_trgm_ops), refresh CONCURRENTLY policy, search synonyms Sheng/Swahili dict, spec_templates + spec_values jsonb, product_alerts, reviews (FK order_item_id NOT NULL), homepage_sections + items.
- **`TASK-005`** — Supabase migration `0003_sellers_moderation.sql` — seller_profiles, seller_verification_documents (pgp_sym_encrypt Huduma #), listing_drafts (auto-save 2s debounce target), used_listings, used_listing_photos, moderation_queue_events, listing_reports, listing_enquiries.
- **`TASK-006`** — Supabase migration `0004_orders_stock_finance.sql` — CART: carts, cart_items. RESERVATION: reservations + release_expired_reservations_for() inline sweep SP + pg_cron sweeper 1-min + order sweeper 2-min. STOCK: `reserve_variant()` SP (`FOR UPDATE SKIP LOCKED` — release inline → select for update → check stock ≥ qty → update stock −qty → insert reservations → insert inventory_transactions reason enum). FINANCE: commission_rules, seller_ledger_entries (running balance_after_kes), coupons + coupon_redemptions, orders + order_items + sign_order_ref() HMAC SP, order_fulfillment_groups (per seller/platform split) → order_fulfillments (partner/tracking/driver/proof_of_delivery/signature_url/delivered_at), order_events 8-state FSM, disputes, order_cancellations, return_requests, refunds, order_payments.
- **`TASK-007`** — Supabase migration `0005_fulfillment.sql` — delivery_zones (Nairobi 8 + outskirts + nationwide), pickup_locations (lat/lng, hours_jsonb, address_structured).
- **`TASK-008`** — Supabase RLS final pass + Upstash rate-limit integration tests. JWT app_metadata.role policies everywhere. RLS unit tests per table.
- **`TASK-009`** — Middleware, session_id cookie, RBAC route guards, JWT re-verification pattern for Server Actions, `server-only` barrel admin file.
- **`TASK-010`** — Design system implementation: tokens, typography, Radix primitives wrappers, base component library (Button, Input, Select, Dialog, Sheet, Toast, Badge, Card, Price, Skeleton, Alert, Avatar, Progress, Accordion, Tabs, DropdownMenu).
- **`TASK-011`** — Observability: Sentry (server/client/edge), Logtail drain, Baselime instrumentation.ts, alert policies Slack webhook configs. RUNBOOK.md draft.

### Phase 2 — Vertical Routes
- **`TASK-101`** — Landing page (editorial hero, category shortcut grid, featured carousel, trending deals with price-drop-alert CTA, used marketplace spotlight, trust strip, newsletter, app-install banner). ISR 60 s, revalidateTag mutations.
- **`TASK-102`** — Search & Autocomplete: `/search` (filters sidebar + results grid + infinite scroll + sort), `/api/search/autocomplete` (edge, GIN trigram MV, Sheng/Swahili synonyms, "Did you mean", keyset pagination page-3+). Query state zustand.
- **`TASK-103`** — Category landing + breadcrumbs + SEO meta + dynamic spec filters (from spec_templates). ISR 300 s.
- **`TASK-104`** — Product Detail Page (PDP): gallery, variants (stock per variant + price delta per variant), Quick View Radix Dialog, price history badge + compare-at, warranty badge, reviews aggregate + verified-only, related + "also bought", add-to-cart, Reserve timer button (20 min TTL countdown), WhatsApp share, compare toggle, back-in-stock alert subscribe.
- **`TASK-105`** — Product comparison page (max 4, diff highlighting).
- **`TASK-106`** — Cart page, merge-on-login, reservation integrity flow, countdown timers.
- **`TASK-107`** — Checkout (Guest allowed!): name/phone/email (Kenyan regex 07/011), Delivery vs Pickup selection, zone lookup, split-fulfillment group display, **Confirm & Send via WhatsApp** Server Action: create order → HMAC sign → wa.me URLs per group → redirect to TTL confirmation page. Attribution UTM/ttclid saved.
- **`TASK-108`** — Post-WhatsApp confirmation page (15 min TTL, HMAC-verify query sig → 404 if spoofed, optional account creation, merge order).
- **`TASK-109`** — Buyer auth (email/password + phone OTP via Africa's Talking Edge Function, WebOTP autofill), seller KYC multi-step (Profile → Documents Upload with drag-drop camera capture, Huduma # masked encrypted field → submit → pending screen).
- **`TASK-110`** — Seller dashboard, listing creation with auto-save drafts, moderation status, seller analytics.
- **`TASK-111`** — Admin dashboard: KPI grid, Recharts trends, moderation queue (bulk approve/reject templates with reasons), seller KYC review (decrypt Huduma env key), orders, products bulk publish, coupons, homepage sections editor, audit logs, system settings typed key-value.
- **`TASK-112`** — Account pages: buyer dashboard, order history, wishlist, notification preferences matrix toggle, saved delivery zones.
- **`TASK-113`** — Supabase Realtime 4 channels integration (notifications, listings, moderation, stock).
- **`TASK-114`** — PWA: @serwist/next config, manifest (share_target + url_handlers), install prompt, offline fallback.
- **`TASK-115`** — SEO final pass: dynamic OG images per product (Vercel OG), metadata generateMetadata everywhere, JSON-LD schemas, sitemap.xml, robots.txt.
- **`TASK-116`** — Accessibility AA compliance audit (axe-core), keyboard navigation, screen-reader labels, focus rings, color contrast.
- **`TASK-117`** — Go-live checklist 12-point run-through, Vercel prod deploy, Supabase PITR 7-day confirm, external provider keys live test.

---

## Updating This File

Only the Human Admin or the AI completing the current task may update this file.

When you finish the **Active Task**, replace:
1. The `Task ID`, `Description`, and body.
2. Move the completed task ID into a new line under **Completed Tasks** with a date.

---

**End of CURRENT_TASK.md — the active task here must always mirror PROJECT_STATE.md.**
