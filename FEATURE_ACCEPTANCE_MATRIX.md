# FEATURE ACCEPTANCE MATRIX — Kenya Electronics Marketplace

**Purpose:** Every meaningful feature in the system broken into testable capabilities, each with an objective definition of success.
**Origin:** `TASK-001-B` pre-implementation validation (documentation only — no code written).
**Status default:** `Not Started` for every row. Status flips to `In Progress / Pass / Fail` as each TASK is implemented and tested.

**Column key**
- **Req src** = authoritative requirement source (PRD / TA = Technical-Architecture / CM = CATALOGUE_MASTER / DS = DESIGN_SYSTEM / CT = CURRENT_TASK / TODO note)
- **PC** = preconditions
- **Success = Success criteria**, **Fail** = failure criteria
- **Sec / Perf** = security test / performance test required (— = none; see SECURITY_ACCEPTANCE.md / AUTOMATED_TEST_PLAN.md)
- **Auto** = automated-testable (U=unit, I=integration, DB=database/test, E=E2E, Dev=dev-only tool, — = no)
- **Manual** = human verification required (Y = yes, see MANUAL_TEST_PLAN.md; N = no)
- **Test method** = where the test lives (AUTOMATED_TEST_PLAN.md / MANUAL_TEST_PLAN.md / SECURITY_ACCEPTANCE.md / DATABASE_ACCEPTANCE.md)
- **Dep** = blocking dependency (task IDs / files)

---

# PART 1 — AUTHENTICATION, SESSIONS & RBAC (AUTH)

| ID | Area | Feature | Req src | Role | Preconditions | Expected behaviour | Success criteria | Fail | Edge cases | Sec | Perf | Auto | Manual | Test method | Depends | Status |
|----|------|---------|---------|------|----------------|-------------------|------|------------|-----|------|------|------|--------|-------------|---------|--------|
| AUTH-001 | Auth | Email + password registration (Buyer) | PRD §2.1, PRD §2.2.9 | Guest → Buyer | Supabase Auth project configured | User enters email+password, creates account, receives profile row, JWT role= buyer | Account created; profile row with default buyer role; can log in | Duplicate email rejected; invalid email; weak password | Email case; existing account; OAuth login (future) | JWT role from JWT claim | — | Unit(Zod) + DB | Login only | AUTOMATED §AUTH, DB | Supabase, migration 0001 | Not Started |
| AUTH-002 | AUTH | Password reset | PRD §2.2.9 | Buyer | Registered | sends reset link → new password | Can log in with new password; old invalid | Token expiry/revoke | Tombstoned accounts | Sec: token single-use | — | DB tal | — | SECURITY_ACCEPTANCE | Supabase | Not Started |
| AUTH-003 | Phone OTP (AT) | PRD §2.2.9, TASK-109, Africa's Talking | Seller/ Buyer | Phone unverified; AT account | OTP sent to phone via Africa's Talking SMS, verify | OTP accepted, marks phone_verified, session upgraded | OTP reused/expired after N attempts | Missing phone; wrong prefix; OTP rate limit | Rate limit (3/5m 10/day); never log OTP | — | Unit(rate)+I | Yes (real SMS later | AUTOMATED §AUTH, MANUAL §OTP | SECURITY | Not Started |
| AUTH-003 | Sessions | Signed session_id cookie (Guest) | PRD §2.2.7, TA §5 | Guest | middleware | First visit sets signed session_id; stored in session anon / database | Anonymous identity stable across requests; cart persists | Cookie tampered → fails HMAC | multi-tab; incognito; cookie cleared | HMAC guest | — | Unit | — | AUTOMATED §AUTH | SECURITY | Not Started |
| AUTH-004 | Sessions | Session table (sessions_anon) + UTM/ttclid attribution | TA §4.1 | Guest | session cookie | Attribution stored at session level, used in attribution chain orders | All order chains traceable | — | Missing referrer | — | — | DB triggerset | — | DATABASE_ACCEPTANCE | migration 0001 | Not Started |
| AUTH-005 | Session | JWT re-verification in Server Actions | TA §5 | All | — | Every Server Action re-fetches user from supabase SSR client | Only valid sessions act | Role toggles | Action with stale JWT | JWT not trusted from cookie alone | — | I | — | SECURITY_ACCEPTANCE | auth lib | Not Started |
| AUTH-006 | RBAC | Role guard middleware (store/group only, not auth gate) | TA §3 | Guest | App loads | /account /seller /admin redirect to login; /admin role gate | Guards correct | 404 wrong | — | Not auth gate | — | I(e2e auth) | — | SECURITY_ACCEPTANCE | middleware | Not Started |
| AUTH-007 | RBAC | Permission keys + role_permissions matrix enforced in actions | PRD §2.1, TA §4.1 | Admin/Super | — | Permissions enforced for each mutation | Only authorized | — | misc roles | IDOR prevention | — | I | — | SECURITY_ACCEPTANCE | migrations | Not Started |
| AUTH-008 | 2FA | TOTP for Admin/Moderator/Super + Seller gated | TA §8.1 | Privil | — | Must complete 2FA on login | 2FA enforced | Login blocked if skipped | no TOTP app | seeding | — | I | yes | SECURITY_ACCEPTANCE | lib | Not Started |
| AUTH-009 | Auth | Impersonation (super_admin → user), audit | TA §9, PRD §2.2.13 | Super | — | Impersonate buyer/seller; audit_log impersonation_actor_id | impersonation audit rows | — | concurrent | — | SECURITY_ACCEPTANCE | Yes | Not Started | — | — |
| AUTH-010 | Auth | Guest identity FKs | TA §5 (guest = anon claim) | Guest | — | Guest can hold carts/reservations keyed by session | — | — | — | SECURITY | — | — | Not Started |

---

# PART 2 — CATEGORIES & CATALOGUE (CAT)

| ID | Feature | Req | Role | User | Expected | Success | Fail | Edge | Sec | Dep | Test | Method | Depends | Status |
|----|---------|------|------|-----|----------|---------|------|------|-----|-----|-----|--------|---------|---------|--------|
| CATA-001 | Category tree (13 top-level + unlimited depth) | CM §01/02, TA ERD | Buyer/Admin | — | Reads CM; renders tree; parent_child in nav | 13 C01–C13 rendered in CM order | — | missing categories | — | CAT-001 seed | Yes(I) | AUTOMATED 지식; DB | Not Started |
| CATA-002 | Subcategory list (CM §02) | CM | — | Fully seeded, visible | — | — | — | Inconsistency vs CM (flag) | seed | Yes(DB) | — | Not Started |
| CATA-003 | Category product_count counter trigger | TA §6.2(4) | — | Product writes update count | Count accurate after publish/unpublish/soft-delete | — | — | Trigger tested | DATABASE_ACC | — | — | — |
| CATA-004 | Category SEO meta | CM §09, DS | Buyer | ISR 300s | Title/desc canonical | — | — | removed cat | — | — | Not Started |
| CATA-005 | Breadcrumbs (category chain) | — | — | Deep link | Correct chain | — | — | no parent | — | — | — |
| CATA-006 | Product count badge on tiles | — | — | — | count from trigger | — | — | — | — | — |

# PART 3 — SEARCH & AUTCOMPLETE

| ID | Feature | Req | Role | Expected | Success | Fail | Edge | Sec/Perf | Auto | Manual | Method | Deps | Status |
|----|---------|-----|------|----------|---------|------|------|----------|------|--------|--------|-------|------|--------|
| SRC-001 | Autocomplete (edge) routes | TA §3 Vercel | Public | Returns products/brands/categories/recent | 5+3+3 shape | correct cache | p95<200ms | Yes(edge) | No | AUTOMATED §PERF | search MV | Not Started |
| SRC-002 | Trigger trigram + synonym (MV) | CM §10, TA §8.3 | — | Canonical search expanding Sheng/Swahili | "simu" → phones | — | — | Unit | — | AUTOMATED §SEARCH | synonym dict | Not Started |
| SRC-003 | "Did you mean" trigram similarity ≥0.35 | TA §8.3 | — | suggestion surfaced | — | — | — | Unit | — | AUTOMATED §SEARCH | — | Not Started |
| SRC-004 | Full search filters per-category dynamic | CM §06, TASK-102 | Buyer | correct filter widgets | matches spec | wrong widget | — | — | E2E | MANUAL (mobile filter sheet) | cm | Not Started |
| SRC-005 | Filter state in zustand | TA §2 | Buyer | Filters persist across pagination | — | — | — | — | — | — | — |
| SRC-006 | Keyset pagination page³+ (no OFFSET) | TA §8.2 | — | Page3+ uses seek | perf/p95 | — | — | I | — | AUTOMATED §PERF | — | Not Started |
| SRC-007 | Failed-search capture to failed_searches | TA §6.1, PRD | — | zero-result query → stored | — | — | — | — | — | — | — |
| SRC-008 | Search | Sort (price rel) | — | Works | — | — | — | — | — | — | — |

---

# PART 4 — PRODUCT (PDP etc.)

| ID | Feature | Req | Role | Expected | Success | Fail | Edge | Sec/Perf | Test | Dep | Status |
|----|---------|-----|------|---------|---------|------|------|---------|------|-----|--------|
| PRD-001 | PDP gallery (images+video muted) | PRD §2.3, CM §08 | Buyer | gallery renders | alt text | — | empty media | Perf image | MANUAL (real) | Not Started |
| PRD-002 | Variant picker (color/storage/RAM) | CM §04/05 | Buyer | stock per variant; price delta | choose variant updates | sold-out | PriceHistory | — | E2E | Not Started |
| PRD-003 | Price + compare-at + price-history badge (90d) | CM; PRD | Buyer | shows | correct | — | — | MANUAL | — | — |
| PRD-004 | Warranty badge | CM | — | months shown | — | — | — | — | — |
| PRD-005 | Reserve timer (20 min, extend+10 once) | PRD/DS | Buyer | countdown | — | stale | — | E2E | - |
| PRD-006 | Reviews (aggregate + verified only) | TA Review FK | Buyer | shows | — | — | — | E2E res | — |
| PRD-007 | Related products + also bought | PRD | Buyer | — | — | — | — | — | — |
| PRD-008 | Quick View (Dialog), TikTok-first | - | Buyer | — | — | — | — | MANUAL | — |
| PRD-009 | Pre-Oid back-in-stock/price-drop alert CTA | CM Alert | Buyer | — | — | — | — | — |
| PRD-010 | Product schema JSON-LD + OG dynamic | TA §8.3 | — | Present | valid | — | SEO | AUT | — |
| PRD-011 | Add-to-cart / Reserve FAB | — | — | — | — | — | — | — |
| PRD-012 | Spec matrix (grouped rows | Copper highlight | Compare toggles) | — | — | — | — | — |

---

# PART 5 — IMAGES/MEDIA (MEDIA) — full acceptance in IMPLEMENTATION_READINESS §8; test rows condensed here

| ID | Feature | Req | Success / Fail | Sec | Auto | Manual | Method | Status |
|----|---------|-----|----------------|-----|------|--------|--------|--------|
| MED-001 | Admin uploads replace webp placeholder | CM §08 | job done via editor | — | Y(DB) | Manual (asset) | MANUAL §IMAGES | Not Started |
| MED-002 | Seller upload (8 imgs max + video ≤120s) | PRD | enforced | virus | — | Manual (camera) | MANUAL §IMAGES | Not Started |
| MED-003 | Buckets public/private + signed URLs | TA §8.1 | expiration | Sec | AUT | — | SECURITY_ACCEPTANCE | Not Started |
| MED-004 | WebP convert + on-the-fly transform | CM §08 | transforms _thumb/_large | Sec(&) | I | Manual (visual) | AUTOMATED | Not Started |
| MED-005 | Moderation states (pending_review/approved/rejected) | CM §8 | — | Secrecy: public | Sec | — | Not Started |
| MED-006 | Missing-image placeholder (NO AI images) | DS §8 | placeholder div only | — | ESLINT | — | — | Not Started |
| MED-007 | Video muted autoplay | — | — | — | — | — | — | — |
| MED-008 | Image ordering + deletion behavior | flag | — | — | — | — | — | — |

---

# PART 6 — CART

| ID | Feature | Req | Expected | Success | Fail | Edges | Test | Deps | Status |
|----|---------|-----|----------|---------|------|-------|------|----|------|--------|
| CART-001 | Add to cart (anon/anon) | PRD §2.2.7 | line added | sku merge qty ✓ | reserved at | duplicate sku | — | E2E | Not Started |
| CART-002 | Cart by session_id (guest) + owner merge-on-login | TA | — | merge dedupe | — | — | — | — | — |
| CART-003 | Per-item TTL countdown chip (jade/amber/rose) | - | 20m | — | expired grace | — | MANUAL WIS | — |
| CART-004 | Qty stepper + remove + line total | PRD | recalc | — | — | — | — | — |
| CART-005 | Split by seller groups + delivery preview | — | — | — | — | — | — | — |
| CART-006 | Reservation integrity: reserved stock blocked others | — | — | — | — | — | — | — |
| CART-007 | Empty state trending | — | — | — | — | — | — | — |

---

# PART 7 — RESERVATION (RES) — business-critical. Acceptance is THE authoritative matrix; P34 rows defined in DATABASE_ACCEPTANCE.md §RES (R-001…R-022). Each row names PCB test:
- R-001 normal reserve (qty 1)
- R-002 multi-qty
- R-003 concurrent two buyers, one last unit (only one) — promise.allSettled parallel
- R-004 insufficient stock (exact OUT_OF_STOCK error)
- R-005 expired → auto-release + stock restore
- R-006 reservation cancel → restore
- R-007 checkout conversion: reservation → order → stock final
- R-008 guest reservation by session
- R-009 authenticated reservation (higher priority)
- R-010 multi-seller group (each seller a reservation) 
- R-011 multi-variant
- R-012 double-click / duplicate request → single reservation (idempotency; see M-02)
- R-013 refresh page while reserved
- R-014 TTL extension +10 once; second denied
- R-015 race: two processes reserve same last unit → one
- R-016 cron sweeper failure → on-demand check at read heals
- R-017 on-demand expiry sweep on every catalog read
- R-018 stock ledger sums = current stock
- R-019 full restore after order TTL cancel
- R-020 seller partial response (one group canceled)
- R-021 sc analysis: reservation griefing (hold flood) → prevented by cap (M-01)
- R-022 reservation + cart → order → delivered → review gating

Status for all: Not Started. Execution location: DATABASE_ACCEPTANCE.md §RES + AUTOMATED_TEST_PLAN (E2E concurrency).

---

# PART 8 — CHECKOUT () and WHATSAPP (WA)

### 8.1 Checkout form (shared by guest & buyer)
| ID | Feature | Req | Expected | Success | Fail | Edges | Sec | Auto | Manual | Method | Status |
|----|---------|-----|----------|---------|------|-------|-----|-----|--------|--------|--------|
| CO-001 | Guest allowed (no signup) | PRD | Why /privacy | Click-through | — | — | — | E2E | — | AUTOMATED | Not Started |
| CO-002 | Fields + regex (name/phone/email)Validation | TA Zod | Phone regex accepts 07/011/010/+254, rejects bad | — | leading 0 vs +254 | regex unit | AUTOMATED | — |
| CO-003 | Delivery vs Pickup + zone lookup fee+ETA | — | selector toggles | — | — | — | — | — |
| CO-004 | Coupon apply + validation | — | applied once | — | — | — | — |
| CO-005 | Notes (500 ch) + TOS | — | — | — | — | — | — |
| CO-006 | Attribution (UTM/ttclid recorded) | — | — | — | — | — | — |
| CO-007 | CreateOrderFromCart server action (HMAC ref, groups, TTL 15) | TA § | atomic | — | — | — | — | — |
| CO-008 | Rate limit order 3/session | — | — | — | — | — | — |

### 8.2 WhatsApp state machine (WA) — design in IMPLEMENTATION_READINESS §7/§8
| ID | Feature | Goal | Success | Manual (Must be human) | Auto | Status |
|-----|---------|------|---------|------|------|------|--------|
| WA-001 | wa.me opens correct business number | — | Correct number | MANUAL §WA-001 | E2E verify URL | Not Started |
| WA-002 | Prefilled message (items,totals,zone,ETA,ref+sig) | — | Correct text | MANUAL §WA-002 | — | Not Started |
| WA-003 | Split-seller N messages | — | One per group | MANUAL §WA-003 | — | Not Started |
| WA-004 | What-if WhatsApp doesn't open / user closes / no send: stays pending_whatsapp → auto-TTL cancel | — | stock restore | MANUAL | E2E(ttl) | Not Started |
| WA-005 | Order ref HMAC verify on confirmation page; fake sig → 404 | — | — | — | AUTOMATED unit | Not Started |
| WA-006 | Re-send WhatsApp link | — | Regenerate valid | MANUAL | — | Not Started |
| WA-007 | WhatsApp share product | — | — | MANUAL | — | Not Started |
| WA-008 | Admin/agent marks customer_contacted (spot) | — | — | — | — | — |
| WA-009 | Message truncation guard (W-05) | — | — | — | — | — |

---

# PART 9 — SELLER YOU (SELLER) — full KYC+listing in §10 §11

| ID | Feature | Expected | Edges | Sec | Auto | Manual | Status |
|----|---------|----------|-------|-----|-------|--------|-------|
| SELLER-001 | Seller profile (create/update own) | — | only own | RLS own row | Yes | — | Not Started |
| SELLER-002 | Dashboard (my listings, sold, views, rating) | — | — | — | — | — | — |
| SELLER-003 | New listing (multi-step + draft autosave 2s) | — | — | Enquiry | — | — | — |
| SELLER-004 | Listing rating average trigger | — | — | — | — | — |
| SELLER-005 | Mark Sold → status sold_by_seller | — | — | — | — | — |
| SELLER-006 | Relist from expired (90day) free | — | — | — | — | — |
| SELLER-007 | Enquiries (Contact she no reserve) | — | — | — | — | — |
| SELLER-008 | Rate limit (10/hr 50/day) | — | — | — | — | — |
| SELLER-009 | Notif seller.new_order Realtime | — | — | — | — | — |

# PART 10 — KYC (PROFILE)
| KYC-001 | Seller onboarding multi-step (Phone → profile → docs) | PRD | — | — | — |
| KYC-002 | Document upload (ID front/back, selfie) | — | drag+cam | — |
| KYC-003 | Huduma # encrypted (pgp_sym_encrypt) | Secp | — | — |
| KYC-004 | Review pending/rejected/approved | — | — | — |
| KYC-005 | Verified badge gate: cannot sell until docs approved | — | — | — |
| KYC-006 | KYC SLA alert (>30 queue) | — | — | — |

# PART 11 — MODERATION (MOD)
| MOD-001 | Listing moderation queue list/detail | PRD | — |
| MOD-002 | Approve / Reject w/ template + reason | — | — |
| MOD-003 | Queue event history (1 listing N events) | — | — |
| MOD-004 | Auto-suspend / edit non-price | Edit listing content allowed | — |
| MOD-005 | Report listing (buyer) → moderation | — | — |
| MOD-006 | Review-spam prevention; reported listing | — | — |

# PART 12 — ADMIN (control center)
All rows ADMIN-xxx below = "administrator must be able to...". Status Not Started.

| ID | Feature | Expected (adm can) | Test | Status |
|----|---------|--------------------|------|--------|
| ADMIN-001 | Dashboard KPIs (GMV, reservations, approvals, sellers, inventory alerts, reports) | Values visible | I | Not Started |
| ADMIN-002 | Product CRUD + bulk publish/unpublish + CSV export | — | — | Not Started |
| ADMIN-003 | Variant/SKU management with SKU auto-gen | — | — | Not Started |
| ADMIN-004 | Category tree editor + spec template drawer | — | — | Not Started |
| ADMIN-005 | Brands CRUD | — | — | Not Started |
| ADMIN-006 | Seller KYC review (decrypt Huduma w/ env key) | — | — | Not Started |
| ADMIN-007 | Moderation queue bulk approve/reject template | — | — | Not Started |
| ADMIN-008 | Orders + fulfillment management, POD view | — | — | Not Started |
| ADMIN-009 | Delivery zones editor | — | — | Not Started |
| ADMIN-010 | Pickup locations editor | — | — | Not Started |
| ADMIN-011 | Coupons CRUD | — | — | Not Started |
| ADMIN-012 | Homepage sections editor | — | — | Not Started |
| ADMIN-013 | Search analytics + failed searches + synonyms | — | — | Not Started |
| ADMIN-014 | Listing reports workflow | — | — | Not Started |
| ADMIN-015 | Disputes resolution | — | — | Not Started |
| ADMIN-016 | Notifications broadcast | — | — | Not Started |
| ADMIN-017 | Audit log explorer (actor/target/IP) | — | — | Not Started |
| ADMIN-018 | System settings (typed KV) | — | — | Not Started |
| ADMIN-019 | Admin permissions / 2FA | — | — | Not Started |
| ADMIN-020 | Marketplace seller stats / export | — | — | Not Started |

# PART 13 — RESERVATION & STOCK (see DATABASE_ACCEPTANCE §RES for all; duplicated here not necessary)

# PART 14 — NOTIFY / REAL-TIME / ALERT
| NOTE-001 | Notification preferences matrix | per event/channel toggles | — |
| NOTIF-001 | Realtime 4 channels (notifications, listings, moderation, stock) | — |
| NOTIF-002 | Reservation expiring pulse | — |
| NOTIF-003 | SMS/WA/email send routing (AT + WA + SES) | — |
| NOTIF-004 | Smart trigger price_drop / back_in_stock | — |
| ALRT-001 | Price-alert subscription | — |
| ALRT-002 | Back-in-stock subscription | — |

# PART 15 — ACCOUNT & WISHLIST
| WISH-001 | Wishlist add/remove/share | — |
| ACCT-001 | Buyer dashboard (orders, profile) | — |
| ACCT-002 | Order history / timeline | — |
| ACCT-003 | Saved delivery zones/addresses | — |
| ACCT-004 | Data export | — |

# PART 16 — AUTO / SECURITY / PERF / SEO / A11Y / RESP / MEDIA / CMP
| SEO-001 | generateMetadata all pages | — |
| SEO-002 | Canonical + noindex rules + duplicate-guard | — |
| SEO-003 | JSON-LD (Product/Breadcrumb/etc) per page | — |
| SEO-004 | Dynamic OG image per product | — |
| SEO-005 | Sitemap index + paginated products 50k | — |
| SEO-006 | Robots.txt disallow /admin /account /api /checkout | — |
| SEO-007 | Discontinued/unlisted product SEO behavior | — |
| SEC-ALL | All rows → SECURITY_ACCEPTANCE.md §A-001…A-030 | — |
| PERF-ALL | HOME/CAT/SEARCH/AC ► targets in AUTOMATED §PERF + GO_LIVE | — |
| A11Y-ALL | WCAG AA axe run + keyboard | — |
| RESP-ALL | 360/390/430/768/1440 per-page grid in MANUAL §MOBILE | — |

---

## MASTER REGISTER OF MATRIX DELTA

The FEATURE_ACCEPTANCE_MATRIX is authoritative at row level. Test execution is delegated:
- DB-level checks → `DATABASE_ACCEPTANCE.md`
- Security checks → `SECURITY_ACCEPTANCE.md`
- Headless/AI-automatable JS paths → `AUTOMATED_TEST_PLAN.md`
- Physical-device / human workflows → `MANUAL_TEST_PLAN.md`
- Go-live conditions → `GO_LIVE_GATES.md`

**Status legend:** Not Started (default) → In Progress → Passed / Blocked (with note) and recorded by task owner.

**End of FEATURE_ACCEPTANCE_MATRIX.md**