# DATABASE ACCEPTANCE — Kenya Electronics Marketplace

**Purpose:** Pre-SQL definition of every table, its constraints, RLS, triggers, and dependencies, plus a complete relationship checklist and the business-critical **Reservation & Stock Integrity** acceptance matrix. When migrations are generated (TASK-003→008) we diff the SQL against THIS document to detect missing tables/relationships/functions.

**Reference:** TA §4.1/§6 (ERD + DDL patterns), DATABASE_SCHEMA.md migrations 0001–0006, CM §04/§05.
**Notice:** Docs disagree on naming of spec tables and some entities (see IMPLEMENTATION_READINESS C-04/C-06). This document uses the **recommended** resolution names and flags the alias.

---

## §1 CONVENTIONS (apply to every table unless overridden)

- `id uuid PK default gen_random_uuid()`.
- `created_at timestamptz NOT NULL default now()`; `updated_at timestamptz` via `set_updated_at()` trigger.
- `deleted_at timestamptz NULL` (soft delete) on every mutable business table; RLS: `where deleted_at is null`.
- FK policy: `ON DELETE RESTRICT ON UPDATE CASCADE` except pure join tables (CASCADE).
- RLS claim pattern: policies read `auth.jwt()->'app_metadata'->>'role'`.
- Roles: Guest=anon (no roles row), Buyer, Seller, Moderator, Admin, Super_Admin.

---

## §2 PER-TABLE ACCEPTANCE

### 2.0 Migration 0001 — Roles & Auth
#### roles
- Purpose: role reference; seeded buyer/seller/moderator/admin/super_admin (guest=anon implicit, per C-05).
- PK id; UNIQUE name; indexes on name. Trigger: none. Test: seed count = 5.

#### profiles (FK auth.users)
- Purpose: 1:1 user identity, role_id, phone, status, notification prefs link.
- PK id = auth.users.id. FKs: roles(id) RESTRICT. Unique: user id, (phone) where not null.
- RLS: SELECT/UPDATE own (`auth.uid() = id`); ADMIN/SUPER full. No DELETE (restrict cascade requirement) — profile immutable except soft delete.
- Triggers: `sync_auth_user_role_claim()` AFTER UPDATE role_id → writes `raw_app_meta_data.role`.
- Test cases: role change propagates to JWT on next login; anon SELECT denied; super admin can see all.

#### audit_logs
- Purpose: admin/moderator/super write log incl. impersonation_actor_id.
- PK id; FKs actor_id→auth.users, impersonation_actor_id nullable. Index: (actor_id, created_at), (target_type,target_id).
- Append-only: INSERT via service/SECURITY DEFINER only; UPDATE/DELETE not permitted by RLS.
- Test: super admin impersonate → two rows (start/end); all admin writes logged.

#### system_settings (typed key-value)
- PK key (text); reserved keys list; values jsonb + per-type column checks (matches Admin §system settings).
- RLS: admin/super only write; public read some (e.g. TTL) if needed. Test: TTL change affects reservation SP (read via `current_setting`/table).

#### sessions_anon
- PK session_id uuid (matches signed cookie); attribution jsonb; first/last_seen; device/country.
- Index: last_seen. RLS: anon can read/write own via session_id claim? (session_id not in JWT → pattern TBD – server-side only writes, anon never reads directly). NOTE `session_id` is a plain cookie: table access is **server-only** (no anon SELECT) to prevent enumeration. Test: cannot read other sessions.

#### notification_preferences
- PK (user_id, event_key); FKs user_id→profiles; event_key enum from TA §4.1.
- RLS own. Test: toggle persists; channel matrix gates delivery.

### 2.1 Migration 0002 — Catalog
#### categories
- PK id; parent_id FK self RESTRICT; slug UNIQUE NOT NULL; sort_order; product_count (denormalized via trigger).
- Trigger `sync_category_product_count()` after product insert/update(published,deleted_at)/delete.
- RLS: SELECT public (published only at product level not category — categories all public); write admin.
- Test: publish product increments count; soft-delete decrements; parent tree no cycle (CHECK via trigger).

#### brands
- PK; name UNIQUE; slug; logo_url. RLS read-public/write-admin. Note: brand list MUST match CM §03.

#### products
- PK id; FK category_id, brand_id, seller_id nullable (null = platform), warranty via product_variants? (see C-04). status enum (CM §11). deleted_at.
- Unique: slug; variant-handling. Check: base_price_kes >= 0.
- Indexes: (status,published,deleted_at) partial; category_id; brand_id; created_at.
- RLS: pub → published & not deleted; admin/seller own create/update; seller status restricted (cannot publish without KYC approved + moderation).
- Trigger: category counter; tsvector append for MV refresh (or MV refresh via cron).
- Test cases: SEC-001/002 (anon visibility).

#### product_variants
- PK id; FK product_id; **SKU UNIQUE NOT NULL** (CM §04 convention); attributes_jsonb (color/storage/ram…); price_delta_kes >= -product price? `CHECK (price_delta_kes >= 0)` or sign convention (flag to lock); compare_at_price_kes; stock >= 0 CHECK; weight_grams; gtin/mpn; image_ids?
- RLS: read public published + variant status; ownership same as product.
- Indexes: UNIQUE(sku); (product_id, {sort}); stock>0 partial for availability filter.
- Test: **oversell proof** (DB-006), SKU uniqueness, qty cap.

#### product_images
- FK product_id / variant_id; url; sort_order; alt text; kind (front/back/… per CM §08 enum); transform_suffix handling.
- Storage object path policy (SECURITY/A refer).
- Soft-delete retained.

#### price_history
- FK product_id/variant_id; old/new price; effective_at; reason; actor.
- RLS admin read/write; public read aggregate badge via function.
- Test: PDP badge math.

#### spec_templates / spec_values
- (Naming C-04.) spec_templates: category FK, key (CM §05 exact), type, unit, enum_options, filterable, highlighted, sort; UNIQUE (category_id,key).
- spec_values: product_id/variant_id FK; jsonb from template keys; validation trigger per template type; CHECK unknown keys (optional strict).
- RLS: write admin; read public.
- Test: filter widget built from template; invalid spec value rejected; all CM keys present per category.

#### search: mv_search_index + synonym
- MV: tsvector + gin_trgm across title/brand/model/specs; created by 0004; refresh CONCURRENTLY via pg_cron 15-min.
- thesaurus_search_kenya: synonym dict from CM §10 (120+), directionality.
- Test: queries with synonyms return expected canonical; refresh doesn't block SELECT.

#### reviews
- PK id; **order_item_id FK NOT NULL** (verified purchase gate; UNIQUE(order_item_id) → 1 review per item); reviewable_type('product'/'listing'/'seller'); rating 1..5; status; helpful_votes.

#### product_alerts (price_drop + back_in_stock)
- PK id; kind; user_id / anonymous_phone alternatives; variant_id; threshold_kes; channel enum; status.

#### homepage_sections / items
- sections: key, kind, titles, layout_jsonb, sort, active, starts/expires; items polymorphic reference_type/ref_id/… . RLS: admin only.

### 2.2 Migration 0003 — Sellers & Moderation
#### seller_profiles
- FKs: profile_id (1:1). Fields: display_name, whatsapp_number (**W-01 field), bio, verified bool, rating_avg, listings_count, location (county/area), joined_at.
- RLS: own; admin review. Trigger: rating_avg recalc.
- Audit: KYC approve/reject → audit_logs.

#### seller_verification_documents
- PK; FK seller_id; document_type; `document_number_enc` = pgp_sym_encrypt with env key (KYC_ENCRYPTION_KEY_PASSPHRASE); front/back/selfie URL; status pending/approved/rejected; rejects reason.
- RLS: **private** (seller own; admin/super only). SEC-038.
- ** Precondition rule: sell → only when status approved (UNIQUE pending guard?). Test gate.

#### listing_drafts (JSONB autosave)
- FK seller_id; listing_id nullable; step; content jsonb; updated_at. 2s debounce later.

#### used_listings
- FK category_id, brand_id, model_id nullable; title, description, price, condition enum, negotiable flag, location, status (CM used_listing_status_enum: draft_seller/pending_review/rejected_with_reason/approved_awaiting_images/published/sold_by_seller/expired_90_days/suspended_moderation/deleted_soft).
- RLS: published → public; seller own; moderation status visibility.
- Trigger: auto-expire after 90d.

#### used_listing_photos / moderation_queue / listing_reports / listing_enquiries
- as spec. Each: FK + RLS split by role.

### 2.3 Migration 0004 — Orders, Stock, Finance
#### carts / cart_items (join => CASCADE)
#### reservations
- FK session/user/variant/listing; qty; status (active/converted/released/expired/cancelled); expires_at; TTL field + extension_count + ext_end time (M-08).
- **UNIQUE partial unique index (session_id, variant_id) WHERE status='active'** (idempotency M-02 / SEC-017).
- Trigger: on-expiry check indexed by (expires_at) partial.

#### inventory_transactions
- immutable; reason enum purchase/reserve_hold/reserve_release/…; qty_delta signed.

#### stock_checks order_items, order_fulfillment_groups/order_fulfillments/order_events/sign_order_ref()/orders

#### finance: commission_rules, seller_ledger_entries (running), coupons/coupon_redemptions.

### 2.4 0005 delivery_zones & pickup_locations

### 2.5 0006 RLS final + seed; missing entities list per READINESS C-06 (wishlists, recently_viewed, search_history, analytics_events, failed_searches, banners, permissions).

---

## §3 RELATIONSHIP CHECKLIST (RLS-friendly)

Checkbox per relationship; implementer confirms presence: 
- [ ] auth.users ↔ profiles (1:1) 
- [ ] profiles → roles (key) 
- [ ] roles ↔ permissions / role_permissions (junction)
- [ ] categories → self(parent) 
- [ ] category → products; brand → products; seller → products(null=platform)
- [ ] product 1→N variants →1→N inventory_transactions; variant→price_history
- [ ] product → spec_templates/spec_values; product_images
- [ ] product → reviews (via order_item)
- [ ] writes each → audit per target_type
- [ ] listing_drafts → used_listings; used listing → moderation → events; listing → reports/enquiries/photos
- [ ] session → carts/cart_items → reservations (variant/listing)
- [ ] users → orders → items (variant/listing) → fulfillment groups (per seller) → fulfillments
- [ ] orders → coupon_redemptions → coupons; orders → payments
- [ ] groups → delivery zone/pickup loc
- [ ] disputes → against group/order
- [ ] ledger (seller) ← commission_rules; ← order sales + refunds
- [ ] reviews → order_item (verified gate)
- [ ] wishlists/recent_viewed/search_history → product/listing
- [ ] alerts → user/session, variant/product
- [ ] homepage_sections → items (poly)
- [ ] analytics_events → session (anon)
- [ ] audit_logs → actor + target + impersonation

---
## §4 RESERVATION & STOCK — ACCEPTANCE (business-critical)

Goal: **the system must never oversell inventory.** That is proven at DB level: after every operation, `stock == (restock sum) - Σ(reserve_hold|sold)` for the variant, checked via `inventory_transactions`.

### Acceptance cases (R-#) with exact assertion script‑points

| ID | Case | Steps at DB/SQL | Expected PASS assertion |
|----|------|-----------------|-------------------------|
| RES-01 | Normal reserve qty1 | 1 session, variant stock 5 | stock4, reservation active, ledger -1 |
| RES-02 | Multi-qty (5 of 5) | qty=5 on stock 5 | stock=0; reservation qty5 |
| RES-03 | Concurrent last unit | 2 parallel reserve(tx) on stock 1 | exactly 1 success; other OUT_OF_STOCK; no oversell; ledger sums −1 |
| RES-04 | Insufficient stock | qty > stock | OUT_OF_STOCK exception; no partial write |
| RES-05 | Expired reservation | advance expires_at past now; run sweeper | status=released; stock+1; ledger +1 release |
| RES-06 | Cancel reservation | cancel active | released; stock restored |
| RES-07 | Checkout conversion | reserve→order(fr) → confirmed | stock permanently debited; reservation=converted; no double |
| RES-08 | Guest reserve | by session | works via session claim; ledger actor session |
| RES-09 | Authenticated reserve | by user | works; priority display |
| RES-10 | Multi-seller | 2 variant/listing in cart | 2 reserves; each group converts independently |
| RES-11 | Multi-variant | reserve 2 variants of one product | both atomic in tx |
| RES-12 | Repeated click/refresh | idempotent same session+variant twice | 1 reservation, not 2 |
| RES-13 | Refresh page | reload during active | timer persists via DB expiry, not overwritten |
| RES-14 | Race | heavy parallel cry allow | serialized by lock; invariant holds |
| RES-15 | Cron failure | stop cron; call read with on-demand sweep | expired released on next read (heal) |
| RES-16 | On-demand expiry on read | read catalog | sweep runs first |
| RES-17 | Ledger == stock | run reconciliation | assert equal |
| RES-18 | Order TTL cancel | order pending_whatsapp past TTL | stock rest + release ALL group entries once (idempotent) |
| RES-19 | Partial seller response | group1 contacted; group2 TTL-expired | group2 cancelled; parent remains; stock for group2 restored; group1 charged |
| RES-20 | Abuse/fraud griefing flood | >cap per session; >rate | blocked (cap M-01); alert policy tripped |
| RES-21 | Extension | +10 once; again pending | second denied; DB field prevent |

**DB-level proof (blocker):** `SELECT SUM(qty_delta) FROM inventory … GROUP BY variant` reconciliation passes after ALL of the above; concurrency stress (100 iterations x `promise.allSettled`) never observes negative stock or double.

Sweeper: `release_expired_reservations_for()` inline + pg_cron 1-min + catalog-read on-demand.

---

**End of DATABASE_ACCEPTANCE.md** — used as checklist for migrations 0001–0006.