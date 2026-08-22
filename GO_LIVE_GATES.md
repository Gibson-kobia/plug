# GO-LIVE GATES — Kenya Electronics Marketplace

**Purpose:** The project is NOT production-ready until every gate below passes. This is the release checklist (extends TA §9.2). Gate statuses: `PASS` / `FAIL` / `BLOCKED` with evidence ID.

**Owner:** Human (release manager). Automated portions run in CI; human portions require MANUAL_TEST_PLAN evidence.

---

## 1. CODE GATES (CI-blocking)

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| CODE-01 | `tsc --noEmit` clean (strict) | CI log | ☐ |
| CODE-02 | ESLint (next/core-web-vitals + custom) clean | CI log | ☐ |
| CODE-03 | `next build` production success | CI log | ☐ |
| CODE-04 | No broken imports (all barrels resolved) | CI + smoke | ☐ |
| CODE-05 | No console errors on all routes (Playwright collects) | e2e log | ☐ |
| CODE-06 | Bundle first-load JS mobile < 120 KB gzip | Lighthouse | ☐ |
| CODE-07 | Accessibility AA via axe on every page | axe run | ☐ |

## 2. DATABASE GATES

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| DB-01 | Migrations 0001–0006 apply clean on fresh Supabase local + prod | `supabase db push` log | ☐ |
| DB-02 | RLS verified per role (SEC-001..011) | SECURITY_ACCEPTANCE | ☐ |
| DB-03 | Constraints verified (SKU, FK RESTRICT, stock ≥ 0, checks) | DATABASE_ACCEPTANCE §2 | ☐ |
| DB-04 | Stored procs verified (reserve_variant, sign_order_ref, sweeps) | DATABASE_ACCEPTANCE §RES | ☐ |
| DB-05 | pg_cron jobs live (1-min sweep, 2-min order, 15-min MV, 10-min category) | cron table | ☐ |
| DB-06 | PITR enabled (7-day) + backup verified | Supabase console + restore drill | ☐ |
| DB-07 | Weekly encrypted offsite backup config | runbook | ☐ |
| DB-08 | RLS JWT claim role sync works | login→publish test | ☐ |

## 3. SECURITY GATES

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| SEC-01 | SECURITY_ACCEPTANCE A–F all PASS | doc | ☐ |
| SEC-02 | Service role key not in client bundle | grep build | ☐ |
| SEC-03 | Upload security (size/MIME/traversal/private bucket) PASS | SECURITY_ACCEPTANCE D | ☐ |
| SEC-04 | Rate limiting verified (OTP, search, listing, order) | SECURITY_ACCEPTANCE E | ☐ |
| SEC-05 | Secrets rotated & none committed | repo scan | ☐ |
| SEC-06 | 2FA enforced for privileged roles | auth test | ☐ |

## 4. COMMERCE GATES (automated + manual)

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| COM-01 | Cart pass (add/merge/qty/remove) | E2E | ☐ |
| COM-02 | Reservation integrity pass (RES-01..21 incl. oversell proof) | DATABASE_ACCEPTANCE §RES | ☐ |
| COM-03 | Checkout guest + auth pass | E2E | ☐ |
| COM-04 | WhatsApp flow pass (WA-001..006 manual + automated URL assertions) | MANUAL §WA | ☐ |
| COM-05 | Delivery workflow (real Nairobi zone) pass | MANUAL COMM-001 | ☐ |
| COM-06 | Pickup workflow pass | MANUAL 3-2 | ☐ |
| COM-07 | Full order lifecycle 8-state pass | E2E-09 | ☐ |
| COM-08 | North-Star: PDP→WA ≤ 5 taps real device | MANUAL §4 | ☐ |
| COM-09 | 7-day seller listing → first sale ≥ 15% (measure after launch) | analytics | ☐ (post) |

## 5. MARKETPLACE GATES

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| MKT-01 | Seller onboarding (phone OTP) pass | E2E-04 | ☐ |
| MKT-02 | KYC flow (upload, encrypt, review, gate) pass | E2E-04 + MANUAL | ☐ |
| MKT-03 | Listing moderation queue approve/reject pass | E2E-05 | ☐ |
| MKT-04 | Seller listing CRUD + autosave + rate limit pass | E2E-04 | ☐ |
| MKT-05 | Reports & disputes pass | E2E/manual | ☐ |

## 6. UX & PERFORMANCE GATES

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| UX-01 | Responsive grid all 5 viewports no overflow | MANUAL §5 | ☐ |
| UX-02 | Mobile UX (one-hand, thumb zone) pass | MANUAL MOB | ☐ |
| UX-03 | Lighthouse mobile: Perf ≥ 90, A11y ≥ 92, BP ≥ 95, SEO ≥ 95 | Lighthouse | ☐ |
| UX-04 | LCP < 2.0 s mobile / < 1.2 s desktop; INP < 100; CLS < 0.08 | Perf trace | ☐ |
| UX-05 | Autocomplete p95 < 200 ms | trace | ☐ |
| UX-06 | Checkout create p95 < 800 ms | trace | ☐ |
| UX-07 | DB hot path p95 < 50 ms (EXPLAIN ANALYZE) | SQL | ☐ |
| UX-08 | PWA installable + offline skeleton works | manual | ☐ |
| UX-09 | prefers-reduced-motion honored | manual/axe | ☐ |

## 7. SEO GATES

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| SEO-01 | Sitemap index + product pagination (50k/URL) valid, robots correct | AUTOMATED §SEO | ☐ |
| SEO-02 | Metadata/canonical/OG on every page | AUTOMATED §SEO | ☐ |
| SEO-03 | JSON-LD schemas valid (Product/Breadcrumb/ItemList/…) | validator | ☐ |
| SEO-04 | noindex rules (deep filters, admin, account) | robots/assert | ☐ |
| SEO-05 | Discontinued/unpublished products handled (404/noindex) | E2E | ☐ |

## 8. INFRA & OPS GATES

| Gate | Requirement | Evidence | Status |
|------|-------------|----------|--------|
| OPS-01 | Domain `electronics.co.ke` + SSL; Supabase Auth Allow List | console | ☐ |
| OPS-02 | WhatsApp Business number registered + profile + quick replies | WA console | ☐ |
| OPS-03 | Africa's Talking live SMS test | manual | ☐ |
| OPS-04 | Sentry + Logtail + Baselime + Slack alerts wired (SEC-044..49) | test alert | ☐ |
| OPS-05 | Smoke tests 40 queries run | smoketest.sql | ☐ |
| OPS-06 | Rollback plan exercised (Vercel promote + PITR drill) | runbook | ☐ |

---

## 9. HUMAN-VERIFICATION LIST (cannot be automated — must be personally signed by owner)

| # | Test | Evidence required |
|---|------|-------------------|
| H1 | WA-001..006 real WhatsApp end-to-end | screenshots/video |
| H2 | Real Nairobi delivery + pickup walk (COMM-001/3-2) | photos/POD |
| H3 | One-handed mobile UX on real Android (MOB-001..006) | recording |
| H4 | KYC Huduma decrypt in admin review (super_admin) | screenshot |
| H5 | Offline PWA (airplane mode) | screenshot |
| H6 | iOS + desktop Safari/Chrome smoke | screenshots |
| H7 | Brand/feel subjective review ("premium Kenyan") | sign-off |
| H8 | Real seller does a live listing + real buyer purchases | end-to-end proof |
| H9 | 200% zoom text check all pages | screenshots |
| H10 | North-Star tap count (PDP→WhatsApp) on own phone | recording |

**Release decision:** All CODE/DB/SEC/COM/MKT/UX/SEO/OPS gates PASS **and** all H1–H10 signed off by the owner ⇒ GO-LIVE. Any FAIL or missing evidence = not production-ready.

---

**End of GO_LIVE_GATES.md**
