# DECISION_LOG.md — Permanent Decision Register (Kenya Electronics Marketplace)

**Purpose:** Every important architectural/business decision, recorded permanently. Future AIs treat recorded decisions as **constraints** unless a later decision explicitly supersedes them (recorded here with SUPERSEDED status).

**Format per decision:** DECISION ID · date · decision · reason · alternatives rejected · affected systems · authorized by.

**Only the human project owner (or an explicitly-authorized task) records decisions.** An AI may *recommend* a decision but must not record it as final until authorized.

---

## RECORDED DECISIONS

### DEC-001 — Stack & platform (Next.js 14 App Router + TS + Supabase + Vercel)
- **Date:** 2026-08-07 · **Decision:** Next.js 14.2 App Router, React 18.3, TypeScript 5.4 strict, Tailwind 3.4, Supabase (Auth + Postgres + Storage + Realtime + Edge Functions), Vercel deploy, Upstash rate-limit, Sentry/Logtail/Baselime, @serwist PWA, Africa's Talking SMS.
- **Reason:** PRD/Tech-Arch Rev2 (TASK-000-AR). RSC-first, ISR, Server Actions fit the WhatsApp-first mobile Kenya model.
- **Alternatives rejected:** other frameworks; monoliths; Next-PWA deprecated successor selected.
- **Affected:** entire project. **Authorized by:** Human (PRD/TA Rev2 approved for implementation).

### DEC-002 — RLS via JWT app_metadata claim (no per-row subqueries)
- **Date:** 2026-08-07 · **Decision:** role written into `auth.users.raw_app_meta_data.role` by `sync_auth_user_role_claim()` trigger; RLS policies read the claim directly.
- **Reason:** fix the 100x per-row-subquery perf bomb found in TASK-000-AR.
- **Alternatives rejected:** per-row `EXISTS` policies.
- **Affected:** every RLS policy. **Authorized by:** Tech-Arch Rev2 (human-approved).

### DEC-003 — Atomic stock via FOR UPDATE SKIP LOCKED + reservations + immutable ledger + cron sweeps
- **Date:** 2026-08-07 · **Decision:** `reserve_variant()` SP (inline expiry sweep → SELECT FOR UPDATE SKIP LOCKED → CHECK stock ≥ qty → decrement → insert reservation + inventory_transactions). pg_cron: reservation sweeper 1 min, order sweeper 2 min, MV 15 min, category counters. On-demand expiry check at every catalog read.
- **Reason:** the system must never oversell; closes race window between sweeps.
- **Affected:** orders/stock/finance. **Authorized by:** Tech-Arch Rev2.

### DEC-004 — No CASCADE deletes; soft delete `deleted_at` on every mutable table
- **Date:** 2026-08-07 · **Decision:** FKs `ON DELETE RESTRICT ON UPDATE CASCADE`; cascade only on pure join tables; `deleted_at timestamptz` on every mutable table + RLS `deleted_at is null` guard.
- **Affected:** all tables. **Authorized by:** Tech-Arch Rev2.

### DEC-005 — WhatsApp-first checkout with HMAC-signed order references
- **Date:** 2026-08-07 · **Decision:** guest checkout allowed; order ref `ELEC-YYMM-XXXX` + HMAC-SHA256 8-char sig; `wa.me` per fulfillment group; order TTL 15 min; HMAC-verify on confirmation page (spoofed sig → 404).
- **Reason:** kill fake-order spoofing and signup-friction abandonment.
- **Affected:** checkout, orders, confirmation. **Authorized by:** PRD/Tech-Arch Rev2.

### DEC-006 — Split fulfillment per seller (order_fulfillment_groups)
- **Date:** 2026-08-07 · **Decision:** one parent order; 1+ fulfillment groups (per seller + platform); N wa.me URLs; per-group status.
- **Affected:** orders/checkout/WA. **Authorized by:** PRD Rev2.

### DEC-007 — Guest identity = signed session cookie + sessions_anon with attribution
- **Date:** 2026-08-07 · **Decision:** middleware issues signed `session_id` UUID (2-yr TTL); `sessions_anon` rows carry UTM/ttclid/referer; attribution chain into carts→orders.
- **Affected:** sessions, carts, orders analytics. **Authorized by:** Tech-Arch Rev2.

### DEC-008 — Search via MV + trigram + Sheng/Swahili synonym dict
- **Date:** 2026-08-07 · **Decision:** `mv_search_index` (tsvector + gin_trgm), refresh CONCURRENTLY 15 min, `pg_trgm.similarity_threshold=0.35`, custom thesaurus from CATALOGUE §10.
- **Affected:** search/autocomplete. **Authorized by:** Tech-Arch Rev2.

### DEC-009 — Catalogue single source of truth = CATALOGUE_MASTER.md
- **Date:** 2026-08-07 · **Decision:** no invented products/brands/specs/prices; missing data → TODO/HUMAN INPUT REQUIRED. Products live in one category; accessories cross-link via `compatibility_slugs`.
- **Affected:** all data, seeds, UI. **Authorized by:** AI_START_HERE + CATALOGUE_MASTER (human-approved).

### DEC-010 — 6 roles, guest=anon
- **Date:** 2026-08-07 · **Decision:** roles: Guest (Supabase anon), Buyer, Seller, Moderator, Administrator, Super Administrator. Note: DB `roles` table row count to be pinned by C-05 (pending).
- **Affected:** auth/RBAC. **Authorized by:** PRD Rev2 (with KNOWN_ISSUES C-05 pending).

### DEC-011 — KYC gate for sellers; Huduma number pgp_sym_encrypt
- **Date:** 2026-08-07 · **Decision:** sellers cannot publish until `seller_verification_documents.status=approved`; Huduma # stored encrypted; decrypt only in admin KYC panel (env key).
- **Affected:** sellers, listings, security. **Authorized by:** Tech-Arch Rev2.

### DEC-012 — Observability + SLA targets
- **Date:** 2026-08-07 · **Decision:** Sentry (3 layers), Logtail, Baselime; alert policies (5xx>1%, p95 createOrder>2s, RLS denials>5, reservation anomaly>0.7, KYC queue>30); PITR 7-day + weekly encrypted offsite backup; performance SLOs in Tech-Arch §8.2.
- **Affected:** ops, perf. **Authorized by:** Tech-Arch Rev2.

### DEC-013 — Acceptance contract = separate AI vs human test layers
- **Date:** 2026-08-08 · **Decision:** features not "done" on code-exists alone; FEATURE_ACCEPTANCE_MATRIX defines success criteria; AI tests vs MANUAL human tests are kept separate; evidence required per test (GO_LIVE_GATES H1–H10).
- **Affected:** QA/release process. **Authorized by:** SESS-002 audit (task-scope).

### DEC-014 — Pre-implementation verdict: GO WITH CONDITIONS
- **Date:** 2026-08-08 · **Decision:** architecture sound; implementation must not start until KNOWN_ISSUES C-01, C-02, C-04, C-06 (blockers) are ruled. Then TASK-002.
- **Affected:** sequencing. **Authorized by:** SESS-002 (recorded for human).

### DEC-015 — DB phase schema decisions (TASK-003..008, SESS-004)
- **Date:** 2026-08-08 · **Decision:** migrations 0001–0006 authored per DATABASE_SCHEMA.md + Tech-Arch §6. Notable definitive choices implemented:
  - C-04 resolved: `spec_templates` (key/value_type/enum_options/filterable/highlighted, per-category) + `spec_values` (JSONB), per DATABASE_SCHEMA + TASK-004. (Supersedes ERD table names; keep ERD as diagram.)
  - `reserve_variant()` = `FOR UPDATE SKIP LOCKED` with short retry loop (10ms x50) to avoid false OUT_OF_STOCK under concurrent multi-unit; qty cap 200/request; partial unique index on active reservations (idempotency per M-02).
  - `release_expired_reservations_for()` is the single sweep function used by both inline reserve and 1-min cron; `expire_pending_whatsapp_orders()` 2-min order sweep restores stock + writes events/groups.
  - `sign_order_ref()` HMAC-SHA256 8-char sig (key `app.hmac_key`, fallback value documented for dev only).
  - RLS is JWT `app_metadata.role` based (per DEC-002); writers narrow (service-role for most; owner policies granted to authenticated for client surface).
  - Grants explicit least-privilege; pg_cron wrapped in try/exception for portability.
- **Alternatives rejected:** filesystem `.ths` thesaurus (not possible on hosted Supabase → `search_synonyms` table); in-memory/redlock stock guards (DB-level chosen).
- **Affected:** all 6 migrations. **Authorized by:** TASK-003..008 activation (human, 2026-08-08).

### DEC-016 — Environment shorthand & execution-gate rules
- **Date:** 2026-08-08 · **Decision:** DB work is gated on a real Supabase/Postgres environment (Docker daemon OR linked project + token). Until it exists, feature tasks that need DB verification remain NOT-RUN (recorded honestly as Level A only). No fabricated catalogue data in any seed; delivery-zone fees are illustrative pending admin confirmation.
- **Affected:** workflow; **Authorized by:** SESS-004 record (human confirms).

### DEC-017 — Permanent Business-Data Integrity & Provenance rule
- **Date:** 2026-08-08 · **Decision:** codified in `AI_START_HERE.md` §4.4 a permanent project-wide rule (all future AIs): never silently invent/guess/fabricate/substitute real business data (full enumerated list incl. prices, SKUs, stock, delivery fees, WhatsApp numbers, order totals, coupons, taxes, warranties, business contacts, synonyms, etc.); explicit PLACEHOLDER rule (`TODO`/`PLACEHOLDER`/`DEV_ONLY`, record missing value + location, never present as verified data, never invent realistic-looking business values); provenance chain `AUTHORITATIVE DOCUMENT → DATABASE/SEED → APPLICATION/UI`; and an explicit **Order Confirmation & commerce-screens clause** — displayed amounts/statuses must be derived from authoritative order state / server-side calculation, never invented by the frontend.
- **Reason:** the existing specs (AI_START §4.2/§9, DEC-009, CATALOGUE_MASTER) covered catalogue data but did not enumerate the full business-value list nor explicitly guarantee Order Confirmation derivation.
- **Alternatives rejected:** redesigning commerce architecture (out of scope); silently proceeding without a rule (rejected).
- **Affected:** AI_START_HERE.md (control layer), all future AI work. **Authorized by:** human instruction (2026-08-08, SESS-005).

### DEC-018 — Observability SDK adaptations (TASK-011, SESS-005)
- **Date:** 2026-08-08 · **Decision:** 
  1. `@baselime/nextjs` does not exist on npm (404) → created a credential-gated adapter stub (`src/lib/observability/baselime.ts`) that no-ops until a human/arch picks a supported SDK (see KNOWN_ISSUES OBS-001). No fabricated config/credentials.
  2. `@logtail/next` requires Next ≥15 (conflicts with pinned Next 14.2, DEC-001) → integrated `@logtail/node` behind a thin wrapper (`src/lib/observability/logtail.ts`); drain functional, Next-specific request middleware deferred until a Next upgrade.
  3. Sentry config files (client/server/edge) written to no-op safely without DSN; `next.config.mjs` wrapped with `withSentryConfig` and webpack plugins disabled when `SENTRY_AUTH_TOKEN` absent so builds stay green without credentials.
- **Reason:** keep the build green and integration honest in an environment without credentials, while preserving the architecture's contract.
- **Alternatives rejected:** pinning versions not on the registry; fabricating DSNs/webhooks (rejected under DEC-017).
- **Affected:** observability stack. **Authorized by:** TASK-011 activation (human, 2026-08-08).

---

## PENDING DECISIONS (awaiting human — see KNOWN_ISSUES.md)

Note: PD-04 (C-04) is now RESOLVED by implementation (DEC-015).

| Pending | Issue | Recommended default |
|---------|-------|---------------------|
| PD-01 | C-01 design tokens | DESIGN_SYSTEM = authority |
| PD-02 | C-02 upload limits | CATALOGUE §8 = authority |
| PD-03 | C-03 categories | CATALOGUE (13) |
| PD-04 | C-04 spec tables | spec_templates + spec_values |
| PD-05 | C-05 roles table | 5 rows + guest=anon |
| PD-06 | C-06 missing entities | add to migration plan |
| PD-07 | C-08 order status enum | enumerate 8-state list |
| PD-08 | M-01/M-02/M-03 | reserve cap 5; idempotency; cart limits |
| PD-09 | W-01/W-02/W-03 | seller WA field; actor permission; group semantics |
| PD-10 | M-11/M-12 | pickup fee; delivery split formula |

---

**End of DECISION_LOG.md — append-only. Record only authorized decisions.**