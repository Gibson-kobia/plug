# AI START HERE — Kenya Electronics Marketplace

**This is the permanent operating manual for EVERY AI that works on this repository.**

Read this file first. Then read the CONTROL LAYER in the order defined in §2. Do NOT read the entire repository.

---

## 1. This Is a Multi-AI Project

- This project is developed by **many different AI agents in sequence**. The human switches AIs when an AI reaches its context/tool limit or another AI is better suited.
- You are a **temporary worker**, not the project owner. Another AI will continue after you.
- Your job: complete the **single active task**, verify it, and leave a handoff that lets the next AI continue immediately.
- **Never restart work already completed.** Never re-derive the project state. Read the control layer instead.
- **Never assume undocumented decisions.** If a decision is not recorded, ask for it or record it as a pending decision — do not invent one.
- **Never silently resolve contradictions** across documents. Record them in `KNOWN_ISSUES.md` and flag for human or task-scope resolution.

---

## 2. CONTROL LAYER — READ IN THIS ORDER (default startup sequence)

The control layer is the persistent multi-AI handoff system. A fresh AI must read, at minimum, in this order:

1. **`AI_START_HERE.md`** — this file (operating manual; read once per session regardless)
2. **`PROJECT_STATE.md`** — the dashboard: phase, current task, status, blockers, verdict, next action (always read)
3. **`AI_HANDOFF.md`** — the most recent AI's handoff; what changed last and what the next AI must do (always read)
4. **`KNOWN_ISSUES.md`** — permanent register of every unresolved issue (read only if relevant to the task; search by ID)
5. **`DECISION_LOG.md`** — permanent register of decisions already made; treat recorded decisions as constraints unless superseded (read only if relevant)
6. **`CURRENT_TASK.md`** — the single active task definition (always read after status)
7. **`FEATURE_ACCEPTANCE_MATRIX.md` / `AUTOMATED_TEST_PLAN.md` / `SECURITY_ACCEPTANCE.md` / `DATABASE_ACCEPTANCE.md` / `MANUAL_TEST_PLAN.md` / `GO_LIVE_GATES.md`** — acceptance & test contracts (read only the parts the task touches)
8. **Source documents for the task** — `PRD.md`, `Technical-Architecture.md`, `CATALOGUE_MASTER.md`, `DESIGN_SYSTEM.md`, `DATABASE_SCHEMA.md` (read ONLY the sections the task requires)

**Never read the entire repository. Never read all documentation. Never read every source file.**

If the task is e.g. "ProductCard", read only that component and its imports (per `AI_START_HERE.md` original rules: `components/products/ProductCard.tsx` and its imports). Do not inspect unrelated folders.

Confidence rule: If `PROJECT_STATE.md` + `AI_HANDOFF.md` + `CURRENT_TASK.md` don't tell you exactly what to do, STOP and ask — do not guess.

---

## 3. The Control Files & Their Roles (source of truth)

| File | Role | Authority on |
|------|------|--------------|
| `AI_START_HERE.md` | Rules & reading order (this file) | How to work |
| `PROJECT_STATE.md` | LIVE dashboard — the current snapshot | What exists, current phase/task/status |
| `AI_HANDOFF.md` | The exact last session's handoff | What the previous AI did + what to do next. Overwritten each session. |
| `DEVELOPMENT_LOG.md` | Permanent chronological history | Append-only: every session that changes the project |
| `KNOWN_ISSUES.md` | Permanent issue register | All unresolved + resolved issue IDs (never delete history) |
| `DECISION_LOG.md` | Permanent decision register | Decisions (C- / DEC- IDs) — constraints |
| `CURRENT_TASK.md` | The active task definition | What is being worked now + task template |
| `CATALOGUE_MASTER.md` | Catalogue single source of truth | Products/brands/categories/specs/filters/synonyms — never invent |
| `DESIGN_SYSTEM.md` | Design system authority | Tokens/components (implementation in TASK-010) |
| `DATABASE_SCHEMA.md` + `Technical-Architecture.md` | DB & architecture authority | DB/migrations/architecture |
| `.trae/documents/PRD.md` | Product requirements authority | Features/requirements |
| `FEATURE_ACCEPTANCE_MATRIX.md` | Feature acceptance contract | What "done" means per feature |
| test plan + security + db acceptance files | Test/security contracts | How each feature is proven |

---

## 4. Definitions of roles & rules

### 4.1 Roles (from PRD) — 6 roles
Guest (anon), Buyer, Seller, Moderator, Administrator, Super Administrator.

### 4.2 Golden rules (from PRD / CATALOGUE)
Never invent products, brands, categories, subcategories, filters, specifications, search synonyms, prices, inventory, images, or business logic. If missing → leave `TODO` / `MISSING INFORMATION` and record.

### 4.3 Work discipline
- Before coding, briefly explain what will be changed, which files and why.
- Do not modify anything else.
- Never perform "helpful" refactors outside the active task.
- Never change architecture/catalogue unless explicitly authorized.
- Never change `CURRENT_TASK.md` except allowed procedure.
- Never bypass `DEVELOPMENT_LOG.md` / handoff updates.

### 4.4 BUSINESS-DATA INTEGRITY & PROVENANCE (permanent project-wide rule)

**AI MUST NEVER silently invent, guess, fabricate, or substitute real business data merely to make the application (or a commit, page, seed, or demo) appear complete.** This applies to every future AI on this repository, for the lifetime of the project.

This applies to ALL values that represent real business information, including but not limited to: product names, product models, brands, product images, product specifications, prices, sale prices, previous/compare-at prices, stock quantities, SKUs, seller information, seller commissions, delivery fees, delivery zones, pickup locations, payment information, WhatsApp numbers, order totals, subtotals, discounts, coupon values, taxes/charges, warranties, return policies, business contact details, catalogue/category information, search synonyms, and any other business value.

**PLACEHOLDER RULE — when development needs a value that is not yet available:**
1. Do NOT silently guess it.
2. Use an explicitly identifiable development placeholder **only when necessary**.
3. Mark it clearly `TODO` / `PLACEHOLDER` / `DEV_ONLY`.
4. Record what information is missing and where the placeholder was used (in `KNOWN_ISSUES.md` or the task log).
5. Ensure it can never be presented as verified production data (e.g. never display placeholders in production UI paths; never label DEV_ONLY as final).
6. If the missing value affects business correctness, create an issue/decision entry — do not silently proceed.
7. Never invent realistic-looking Kenyan prices, phone numbers, delivery fees, stock numbers, seller/business details, or business values just to make a UI look finished.
8. If a value is sourced from an authoritative project document, identify that source (`AUTHORITATIVE DOCUMENT → DATABASE/SEED → APPLICATION/UI`).
9. If you are unsure whether a value is authoritative, treat it as unknown/missing — do not guess.

**ORDER CONFIRMATION & COMMERCE SCREENS (explicit):** all displayed amounts — price, quantity, subtotal, discounts, delivery fee, taxes, seller/platform amounts, final payable, payment/reservation status, order reference, seller/fulfillment/delivery info, and WhatsApp checkout content — MUST be derived from the authoritative order state and server-side calculations (e.g. `createOrderFromCart`), never invented by the frontend or from demo values. The Order Confirmation screen renders the stored order state; it must never fabricate totals or statuses. This rule also governs every cart/checkout/dashboard amount.

---

## 5. Token-Efficiency & Reading Discipline

- A fresh AI must read, at minimum, only items 1–3 + 6 of §2 (≈ 6 small control files) before starting any work.
- Read `KNOWN_ISSUES.md` / `DECISION_LOG.md` only if the active task touches areas they cover; search by ID rather than reading end-to-end.
- Read source docs (PRD, TA, CM, DB, DESIGN_SYSTEM) only in the sections the task needs.
- If a control doc is stale (differs from what you observe), do NOT fix it silently — flag in `KNOWN_ISSUES.md` and continue unless it blocks you.

---

## 6. Change Control (BEFORE / AFTER every change)

BEFORE CHANGE — confirm:
- Current task & its OBJECTIVE
- Reason for the change (must trace to task / PRD / TA / accepted issue / decision)
- Files affected (must be inside task SCOPE)
- Acceptance criteria you will satisfy

DURING CHANGE — touch only files in the task scope. If you hit an unrelated problem:
- DO NOT fix it on the way — record it in `KNOWN_ISSUES.md` (assign new ID) and keep going, unless it blocks completion.

AFTER CHANGE — verify:
- Intended behaviour matches the task
- Regression risks (what else could be affected)
- Tests run (automated + which manual/human still pending)
- Docs/status updated (DEVELOPMENT_LOG, PROJECT_STATE, AI_HANDOFF, KNOWN_ISSUES, DECISION_LOG as applicable)

---

## 7. Workflow per session (the handoff loop)

STEP 1 — Enter the repo. Read §2 items 1–3 (manual, state, handoff). Then item 6 (active task). Then relevant source files only.

STEP 2 — Determine the active task from `CURRENT_TASK.md` / `PROJECT_STATE.md`. If `CURRENT_TASK.md` says **AWAITING-GO-AHEAD / WAITING / BLOCKED**, do not start any implementation; report readiness/blocker status to human as instructed there.

STEP 3 — Complete ONLY that task. Verify: types, lint, tests, DB, mobile, accessibility, design system, production-ready definition.

STEP 4 — Record the outcome:
- Append an entry to `DEVELOPMENT_LOG.md` (append-only, chronological, using the MULTI-AI template at the top of that file).
- Update `PROJECT_STATE.md` (status, working on, blockers, next action).
- Overwrite `AI_HANDOFF.md` with the session report.
- If any decision was made → add to `DECISION_LOG.md` (as decision record).
- If any issue existed/remained/or discovered → update `KNOWN_ISSUES.md` (keep history).
- If `CURRENT_TASK.md` finished → update per instructions (move to completed).

STEP 5 — Stop. Do not volunteer next task. Do not scope-creep.

---

## 8. Definition of Done (from AI_START_HERE original)

A task is complete only if: feature works; UI matches design system; DB updated if required; types correct; no TS errors; no lint errors; no build errors; no broken imports; responsive mobile + desktop; accessible; production ready; tests pass; and the handoff docs updated.

---

## 9. Never Do These (regardless of task)

Never redesign project; rename folders; change architecture; add UI library; change DB schema unless requested; modify routes unless requested; refactor unrelated code; update deps unrequested; remove functionality; create fake data; create placeholder products as real; generate AI product images (as real catalog imagery); invent brands/specs/categories/prices/inventory/business logic.

---

**End of AI_START_HERE.md — Operating manual for all AI workers.**