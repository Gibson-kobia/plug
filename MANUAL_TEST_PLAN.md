# MANUAL TEST PLAN — Kenya Electronics Marketplace

**Purpose:** ONLY tests that require a real human. No automated mixture. Anything a machine can assert lives in `AUTOMATED_TEST_PLAN.md`, DB checks in `DATABASE_ACCEPTANCE.md`, security probes in `SECURITY_ACCEPTANCE.md`.

**Who runs this:** Human QA / product owner. Suggested hardware: one Android phone (Android 10+), one iPhone (secondary), one desktop (Chrome), a real WhatsApp account, a real Africa's Talking phone number, a real Supabase project (can be staging), a real Nairobi address for delivery simulations.

**Evidence rule:** Every PASS requires a screenshot or short video clip saved to the task's evidence folder. Every FAIL requires screenshot + OS version + device + repro steps.

**Recording:** Each section has a checkbox list. When complete, owner marks `PASS` / `FAIL` / `BLOCKED` per row and files a summary into `DEVELOPMENT_LOG.md`.

**Prerequisites (before any manual test):** deploy a staging build, seed catalogue with admin-approved real products (per CM rules — no invented data), set up WhatsApp Business number, Africa's Talking SMS, Supabase project, and a real Kenya phone.

---

## 1. WHATSAPP CHECKOUT & ORDER FLOW

### WA-001 — Guest checkout opens WhatsApp to correct business number
- **Setup:** Staging with a real orderable product (stock > 0), `NEXT_PUBLIC_BUSINESS_WHATSAPP_NO` set to a test WhatsApp number you control.
- **Steps:**
  1. As an anonymous (no login) visitor, open a product PDP.
  2. Click Reserve → confirm reservation appears with 20-min timer.
  3. Click Add to Cart, open Cart, then Checkout.
  4. Enter name + a real +254 phone; choose Delivery → Kilimani zone; keep coupon blank.
  5. Click “Confirm & Send via WhatsApp”.
- **Expected result:** WhatsApp (app or wa.me) opens to the configured business number with a prefilled message containing: item names, quantities, per-item totals, order total, delivery zone + ETA, order reference `ELEC-XXXX-XXXX(SIG)`, and buyer details.
- **Failure conditions:** WhatsApp does not open / opens wrong number / message missing items or totals / ref formatted incorrectly / message truncated.
- **Evidence:** screenshots of (a) checkout summary, (b) the open WhatsApp text (including the ref line). PASS ☐ / FAIL ☐ / BLOCKED ☐

### WA-002 — Multi-seller cart produces separate WhatsApp messages
- **Setup:** 2 product listings: 1 Platform-managed product + 1 verified seller’s listing, both in cart.
- **Steps:** Repeat WA-001 checkout with both items.
- **Expected:** Two (or more) WhatsApp opens, one per fulfillment group, each referencing the SAME parent order ref, per-group totals correct, and each addressed to the correct group owner (business number vs seller’s number).
- **Failure:** single combined message; wrong seller number; mismatch in parent ref; double-counted delivery fees.
- **Evidence:** screenshot of both WhatsApp drafts + the order confirmation page. PASS ☐ / FAIL ☐

### WA-003 — Real user sends message, agent replies within TTL → confirmed
- **Setup:** admin already able to run seller/order screens.
- **Steps:** Send the WhatsApp message from WA-001. In admin, mark `customer_contacted`. Refresh user’s order page.
- **Expected:** order moves `pending_whatsapp → customer_contacted → confirmed`; reservation converted to permanent stock debit; user sees confirmed status + timeline.
- **Failure:** state stuck; stock double-charged; timeline wrong.
- **Evidence:** before/after status screenshots. PASS ☐ / FAIL ☐

### WA-004 — TTL expiry: no reply within 15 min → auto-cancel + stock restore
- **Steps:** Begin checkout, create order, but never send WhatsApp. Wait >15 min (or shorten TTL in staging system_settings to 1 min for test).
- **Expected:** order auto-cancelled, stock restored to previous value (check inventory), reservation released. Confirmation page shows cancelled state.
- **Failure:** stock not restored; order still `pending_whatsapp`.
- **Evidence:** inventory before/after + order page. PASS ☐ / FAIL ☐

### WA-005 — Tampered order ref signature is rejected
- **Steps:** After creating an order, edit the HMSIG on the checkout-confirm URL to a wrong value and refresh.
- **Expected:** friendly 404 (not a data leak).
- **Evidence:** screenshot. PASS ☐ / FAIL ☐

### WA-006 — WhatsApp Share product button on Android
- **Setup:** real Android phone with WhatsApp installed.
- **Steps:** from a PDP tap the WhatsApp share icon → share via WhatsApp.
- **Expected:** WhatsApp shares product link + product name + price.
- **Failure:** deep link broken on Android / missing product info.
- **Evidence:** screenshot. PASS ☐ / FAIL ☐

---

## 2. MOBILE UX (real phone)

### MOB-001 — One-handed navigation
- **Setup:** Android phone e.g. Moto G. 360-390px. 
- **Steps:** Navigate landing → category → PDP → cart → checkout using ONLY the right hand thumb, never two-finger tap.
- **Expected:** All primary actions within thumb zone (bottom 120px); no pinch/reach required; Sell FAB reachable.
- **Failure:** anything out of thumb reach. Evidence: screen recording. PASS ☐ / FAIL ☐

### MOB-002 — Search keyboard / autocomplete
- **Steps:** Tap search, type a real brand like “tecno spark” and “oraimo”.
- **Expected:** OS keyboard opens; autocomplete shows product/brand/category; results grid returns correct.
- **Failure:** keyboard covers results; autocomplete unusable; zero-result on correct term.
- **Evidence:** screenshots. PASS ☐ / FAIL ☐

### MOB-003 — Filter bottom-sheet (Radix Sheet)
- **Steps:** On search/category page tap the filter FAB → sheet slides up → apply filters → close.
- **Expected:** sheet slides, applies, chip shows applied; closing resets nothing silently.
- **Failure:** sheet overlaps content; filters not applied; close stops working.
- **Evidence:** screenshots before/after filter. PASS ☐ / FAIL ☐

### MOB-004 — Camera upload (seller)
- **Setup:** logged-in verified seller (or staging) on phone.
- **Steps:** seller listing form → upload images → choose “Take photo/camera”, take one photo of a real item.
- **Expected:** photo captured, uploaded, converted to webp, shows thumbnail; file validated (size/format).
- **Failure:** camera crashes; too-large image rejected with a friendly msg; no conversion; timeout on 4G.
- **Evidence:** photo + thumbnail screenshot. PASS ☐ / FAIL ☐

### MOB-005 — Checkout on mobile data (not wifi)
- **Steps:** disconnect wifi, run a full guest checkout on 4G.
- **Expected:** reasonable load < 3s; WhatsApp flow opens; no network-broken states.
- **Evidence:** screenshot + network panel logs. PASS ☐ / FAIL ☐

### MOB-006 — Reserve countdown pulse on real device
- **Steps:** reserve; watch timer.
- **Expected:** 20-min countdown correct; last 2 min amber pulse, last 30 s rose/red pulse; extend +10 works once.
- **Evidence:** recordings at 2-min and 30-s marks. PASS ☐ / FAIL ☐

---

## 3. REAL-WORLD COMMERCE WALKS

### COMM-001 — Nairobi same-day delivery workflow (end-to-end)
- **Setup:** Real order on a Nairobi zone (e.g., Kilimani), buyer supplies real address.
- **Steps:** Place order (WA-001), agent confirms, pick pack, dispatch to driver (Sendy or in-house), driver delivers, buyer receives, agent uploads POD photo + buyer signature, order to `delivered`.
- **Expected:** complete 8-state timeline correct; POD stored; buyer can review product.
- **Failure:** any step → see FSM; duplicate stock handling; wrong zone fee.
- **Evidence:** screenshots of each state + POD. PASS ☐ / FAIL ☐

### 3-2 — Pickup workflow
- **Setup:** buyer chooses Pickup at Nairobi CBD location.
- **Steps:** checkout → pickup; confirm via WA-003; arrive at store, show ref, staff marks ready_for_pickup → delivered with signature.
- **Expected:** verified pickup. Failure: no pickup cloud.
- **Evidence:** screenshots.

### 3-3 — Seller / buyer communication via WhatsApp
- For used items, seller enquiry (Contact Seller button) — human verify the message goes to seller number with correct content.

### 3-4 — Real cancellation + dispute
- Place order, dispute (e.g., damaged), admin resolves partial refund; verify ledger entry + buyer refund message.

---

## 4. WRITE-A-BURST REAL-DEVICE TIMING TEST (optional LPD)

Measure actual wall-clock on the device: PDP→ WhatsApp open ≤ 5 taps (North Star). Record each `MTS_WA_001_tapcount.png`.

---

## 5. RESPONSIVE VIEWPORT GRID (per major page)

Test set: 360px (Galaxy A), 390px (iPhone 15), 430px (Pro Max), 768px (iPad mini), 1440px (desktop).
For **each** of: Landing, Category, Search, PDP, Cart, Checkout, Confirmation, Account, Seller Listing, Moderation, Admin Dashboard — verify:
- no horizontal scroll/overflow
- navigation works + search present
- filters reachable
- buttons ≥ 48px tap, reachable one-handed (mobile)
- text readable (200% zoom safe)
- images sized correct
- sticky elements (bottom NAV) don’t cover content
- keyboard tab order sane; focus ring visible

Record per page in `MANUAL_RESP_<page>.md` table with PASS/FAIL/notes + screenshots for the 5 breakpoints. 

---

## 6. DIRECT HUMAN-ONLY CHECKS (things automation cannot confirm)

- **Sounded/Branding feel**: "Premium, minimal, Kenyan" editorial feel — subjective human review.
- **Accessibility real device**: mobile keyboard; iOS Don't; screen reader (TalkBack among screen-slides).
- **Offline PWA**: airplane-mode → cached skeleton + banner, exactly per PRD §4.4.
- **Vendor reconcile**: admin can decrypt Huduma # view in the KYC review panel with env key (super_admin 2FA prompt). (Test on staging fixture only!)
- **Email notifications** deliver (vcs).

---

## 7. EVIDENCE & REPORTING

After the full cycle: 
- Update go-live gate statuses in GO_LIVE_GATES.md referencing test evidence IDs.
- Log every run (date, reviewer, device, results) in DEVELOPMENT_LOG.md.

---

**End of MANUAL_TEST_PLAN.md**