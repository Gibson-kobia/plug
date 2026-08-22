# SECURITY ACCEPTANCE — Kenya Electronics Marketplace

**Purpose:** Concrete, executable security tests — not "RLS is enabled" statements. Every test yields PASS/FAIL.

**Execution:** DB-level tests in Supabase local (`supabase db reset` + `SET ROLE`), app-level in Playwright/axios against staging. Evidence = query output / HTTP response / screenshots. Gate: all `BLOCKER`-tagged rows must PASS before Go-Live.

**Abbreviations:** RLS = row-level security; JWT = decoded Supabase JWT; MIX/HTTP = HTTP status codes.

---

## A. AUTHZ & ACCESS

| ID | Attack / requirement | Test procedure (exact) | Expected PASS | Security class |
|----|----------------------|------------------------|---------------|----------------|
| SEC-001 | Guest access to published data | As `anon` (no JWT), GET product list + PDP + search + category | 200, only `published` + `deleted_at is null` rows | BLOCKER |
| SEC-002 | Guest cannot read unpublished | `anon` attempts product with status `draft`/`scheduled`/`draft_review` | 0 rows / 403 | BLOCKER |
| SEC-003 | Guest cannot write (cart/reserve) | anon POST to reserve/cart server action | blocked or only via session + stock rules | BLOCKER |
| SEC-004 | Buyer reads only own orders/cart/reservations | Buyer A lists orders of Buyer B | 0 rows | BLOCKER |
| SEC-005 | Buyer cannot modify seller listings | Buyer B attempts UPDATE on Seller A listing | 403 / row error | BLOCKER |
| SEC-006 | Seller cannot modify others' listings or view others' ledger | Cross-seller access | blocked | BLOCKER |
| SEC-007 | Moderator cannot configure system / delete users | moderator action on system settings | denied | HIGH |
| SEC-008 | Admin cannot grant super_admin role | admin modifies super role | denied | HIGH |
| SEC-009 | Super-admin impersonation audited | super_admin `impersonate_start/end` rows present in audit_logs with `impersonation_actor_id` | rows exist | HIGH |
| SEC-010 | RBAC permission checks inside Server Actions (not only UI) | direct call to action with fake JWT of role | denied | BLOCKER |
| SEC-011 | IDOR on order confirmation | fetch order by guessable ref without owner/signature | 404/denied | BLOCKER |

## B. FORGERY / MANIPULATION

| ID | Attack | Test | Expected | Class |
|----|--------|------|----------|-------|
| SEC-012 | Forged order ref (HMAC) | tamper SIG in wa.me link/confirmation | friendly 404; no data | BLOCKER |
| SEC-013 | Manipulated price | client sends price override in checkout/create order action | ignored — server recomputes from DB | BLOCKER |
| SEC-014 | Manipulated quantity | qty negative / 9999 in reserve/cart | rejected (Zod + DB CHECK + qty cap) | BLOCKER |
| SEC-015 | Cart coupon abuse | apply coupon beyond uses/max; stack incompatible | rejected | HIGH |
| SEC-016 | Negative/zero price create product (admin) | product mutation with price < 0 | DB CHECK rejects | HIGH |

## C. RESERVATION ABUSE

| ID | Attack | Test | Expected | Class |
|----|--------|------|----------|-------|
| SEC-017 | Reserve flood / hold griefing (bots) | many sessions reserve same variant, cap & rate-limit | second+ blocked; order sweep releases; cap prevents stock lock | HIGH |
| SEC-018 | Reserve beyond stock | oversell attempt (2 buyers last unit) | exactly 1 success; `OUT_OF_STOCK` for the other | BLOCKER |
| SEC-019 | Concurrent modify reservations | two tx update same reservation | row-lock serializes | BLOCKER |
| SEC-020 | Extension abuse | try extend +10 more than once | second denied | MEDIUM |

## D. IMAGE / UPLOAD

| ID | Attack | Test | Expected | Class |
|----|--------|------|----------|-------|
| SEC-021 | Malicious filename | upload `../../shell.php`, `%00`, unicode | sanitized/renamed; stored under server-generated name | BLOCKER |
| SEC-022 | Oversized upload | POST image > size limit | 413 / rejected | BLOCKER |
| SEC-023 | Invalid MIME / polyglot | upload `.exe` renamed `.png`, image+HTML | MIME sniffing rejects; stored path never served as HTML | BLOCKER |
| SEC-024 | XSS via image (SVG/HTML) | upload `.svg` with script | svg not allowed / served as attachment with content-disposition | BLOCKER |
| SEC-025 | Private bucket access | non-owner GET `kyc/` object | 403; signed URL expires | BLOCKER |
| SEC-026 | Signed URL expiry | reuse old signed URL after expiry | 403 | HIGH |
| SEC-027 | Bucket path traversal / public exposure | request `product-images/../..` | no traversal | HIGH |
| SEC-028 | Virus scan | upload known-evil file (test fixture) | quarantined/rejected | HIGH (pending provider) |

## E. WEB / TRANSPORT

| ID | Attack | Test | Expected | Class |
|----|--------|------|----------|-------|
| SEC-029 | SQL injection | input `' OR 1=1--` in search/filter/ref | parameterized queries → no effect; no error leak | BLOCKER |
| SEC-030 | Stored/reflected XSS | product title/description contains `<script>` | escaped/sanitized on render (React) + CSP | BLOCKER |
| SEC-031 | CSRF | craft form POST from other origin | SameSite cookie + Server Action origin check → rejected | HIGH |
| SEC-032 | Brute force login | 20 rapid password attempts | rate limited (Upstash) + lockout | BLOCKER |
| SEC-033 | OTP brute force | >3 tries / 5 min, >10 / day | blocked | BLOCKER |
| SEC-034 | Privilege escalation via JWT tamper | modify JWT role claim | rejected (signature) + RLS still blocks | BLOCKER |
| SEC-035 | Service-role key exposure | attempt to read `SUPABASE_SERVICE_ROLE_KEY` from client bundle / endpoint | not present; server-only import enforced | BLOCKER |
| SEC-036 | Clickjacking | embed site in iframe | X-Frame-Options/CSP frame-ancestors self | MEDIUM |
| SEC-037 | Open redirect | `?next=` to evil domain | only relative/allowed hosts | MEDIUM |
| SEC-038 | KYC data exposure | read another seller's `seller_verification_documents` | blocked; Huduma encrypted at rest | BLOCKER |
| SEC-039 | Rate limit on search | >60/min IP | 429 + Retry-After | HIGH |
| SEC-040 | Analytics endpoint spoof | POST fake analytics | CORS origin lock + per-session cap | MEDIUM |

## F. SERVER-SIDE

| ID | Attack | Test | Expected | Class |
|----|--------|------|----------|-------|
| SEC-041 | SSRF via image URL | product/seller allows external image URL fetch | only allowed CDN/supabase domains (image proxy allowlist) | HIGH |
| SEC-042 | Server action side-effect w/o auth | call admin action as guest | denied | BLOCKER |
| SEC-043 | Data exfiltration via error detail | trigger error with stack traces | generic error page; no internal details | MEDIUM |

## G. MANDATORY ALERTS (from TA §8.4)
- SEC-044 RLS denials > 5/session alert; SEC-045 5xx > 1%; SEC-046 p95 createOrder > 2s; SEC-047 reservation anomaly ratio > 0.7; SEC-048 KYC queue > 30; SEC-049 dead tuples > 20M. Each = alert policy wired + tested with synthetic trigger.

---

## RECORD & RESULT

| Section | Tests | Passed | Failed | Blocker Pass |
|---------|-------|--------|--------|--------------|
| A. Authz | 11 | | | |
| B. Forgery | 5 | | | |
| C. Reservation | 4 | | | |
| D. Upload | 8 | | | |
| E. Web | 9 | | | |
| F. Server | 3 | | | |
| G. Alerts | 6 | | | |

All rows must be PASS (or HIGH rows PASS with documented risk) before GO-LIVE. Any FAIL blocks merge.

---

**End of SECURITY_ACCEPTANCE.md**
