# DESIGN SYSTEM — Kenya Electronics Marketplace

**Status:** Placeholder. Complete tokens, component library, and theming to be implemented in **TASK-010** during Phase 1.

This file specifies the design system used by EVERY component. No UI work should proceed before TASK-010 is complete.

---

## 1. Brand & Palette

### Brand Personality
Minimal, Premium, Fast, Mobile-first, Kenyan. Subtle animations, obvious navigation, accessible.

### Core Palette (Kenyan Copper ↔ Jade ↔ Nairobi Navy)

| Token | HEX | RGB | Tailwind class → CSS var | Usage |
|-------|-----|-----|--------------------------|-------|
| `--brand-copper-50` | `#FFF7F2` | `255,247,242` | `bg-copper-50` / `text-copper-50` | Bg wash hero, card hover bg |
| `--brand-copper-100` | `#FEE9D9` | `254,233,217` | `copper-100` | Divider, soft pill |
| `--brand-copper-200` | `#FBCD9B` | `251,205,155` | `copper-200` | Border subtle |
| `--brand-copper-300` | `#F7A861` | `247,168,97` | `copper-300` | Ring / selection |
| `--brand-copper-400` | `#F28535` | `242,133,53` | `copper-400` | Pill, badge |
| `--brand-copper-500` ✨ PRIMARY | `#EA6A0C` | `234,106,12` | `copper-500` / `bg-primary` / `text-primary` | Main CTA, button, price, links |
| `--brand-copper-600` | `#C85607` | `200,86,7` | `copper-600` | Hovered CTA |
| `--brand-copper-700` | `#9E4307` | `158,67,7` | `copper-700` | Pressed |
| `--brand-copper-800` | `#743109` | `116,49,9` | `copper-800` | Heavy accents |
| `--brand-copper-900` | `#4A1E07` | `74,30,7` | `copper-900` | Deep text on light bg |
| | | | | |
| `--brand-jade-50` | `#F1FBF6` | `241,251,246` | `jade-50` | Trust strip bg |
| `--brand-jade-100` | `#DAF5E6` | `218,245,230` | `jade-100` | Verified/in-stock pill |
| `--brand-jade-300` | `#6ED6A6` | `110,214,166` | `jade-300` | Green ring |
| `--brand-jade-500` ✨ SUCCESS / ACCENT | `#12B76A` | `18,183,106` | `jade-500` / `text-success` / `bg-success` | Verified badge, in-stock, success toasts |
| `--brand-jade-600` | `#029662` | `2,150,98` | `jade-600` | Hover |
| | | | | |
| `--brand-navy-50` | `#F2F5FB` | `242,245,251` | `navy-50` | Section bg |
| `--brand-navy-100` | `#E1E8F5` | `225,232,245` | `navy-100` | |
| `--brand-navy-600` | `#2C3E6B` | `44,62,107` | `navy-600` | |
| `--brand-navy-700` ✨ SECONDARY | `#1E2C50` | `30,44,80` | `navy-700` / `bg-secondary` | Secure reserve badge, secondary button |
| `--brand-navy-900` ✨ BG DARK | `#0F172A` | `15,23,42` | `navy-900` | Header dark, footer bg |
| | | | | |
| `--neutral-0` | `#FFFFFF` | `255,255,255` | `white` | Backgrounds |
| `--neutral-50` | `#F8FAFC` | `248,250,252` | `slate-50` | Surface |
| `--neutral-100` | `#F1F5F9` | `241,245,249` | `slate-100` | Skeleton bg |
| `--neutral-200` | `#E2E8F0` | `226,232,240` | `slate-200` | Divider |
| `--neutral-300` | `#CBD5E1` | `203,213,225` | `slate-300` | Border |
| `--neutral-400` | `#94A3B8` | `148,163,184` | `slate-400` | Placeholder |
| `--neutral-500` | `#64748B` | `100,116,139` | `slate-500` | Muted text |
| `--neutral-700` ✨ BODY TEXT | `#334155` | `51,65,85` | `slate-700` | Default body |
| `--neutral-900` ✨ HEADLINE TEXT | `#0F172A` | `15,23,42` | `slate-900` | Headline, strong text |
| | | | | |
| `--error-500` | `#E11D48` | `225,29,72` | `rose-600` / `text-error` / `bg-error` | Out of stock, errors, declined |
| `--warning-500` | `#F59E0B` | `245,158,11` | `amber-500` | Low stock, pending, alerts |
| `--info-500` | `#2563EB` | `37,99,235` | `blue-600` | Info toasts |

### Semantic mapping (Tailwind theme extension — use these instead of raw colors):
- `bg-primary` / `text-primary` → copper-500
- `bg-primary-hover` → copper-600
- `ring-primary` → copper-300/20 shadow
- `bg-secondary` → navy-700
- `text-secondary` → navy-700
- `bg-success` → jade-500
- `text-success` → jade-500 / jade-600
- `bg-surface` → white / dark-mode navy-900
- `bg-muted` → neutral-50 / neutral-100
- `text-body` → neutral-700
- `text-heading` → neutral-900
- `text-muted` → neutral-500

---

## 2. Typography (Mobile-first Kenyan UX — legible, one-handed thumb-scroll zones top/bottom)

### Web Font Stack (local first + Google Fonts fallback):
**Display: "Sora" (hero, headlines) — loaded as variable.**
**Body: "Inter" (variable, 300–700) — loaded as variable.**
**Numeric prices/timers: tabular-nums (`font-variant-numeric: tabular-nums`).**

### Type scale (clamp → mobile → desktop):

| Token | Usage | Value |
|-------|-------|-------|
| `--fs-display-2xl` | Hero h1 | `clamp(2.25rem, 5.5vw + 0.5rem, 3.5rem)` (36/56 px). Line-height 1.1. tracking-tight, font-weight 700. |
| `--fs-display-xl` | Section h1 | `clamp(1.75rem, 4vw + 0.5rem, 2.5rem)` (28/40 px). Line-height 1.15. 700. |
| `--fs-display-lg` | PDP h2, page h2 | `clamp(1.5rem, 3vw + 0.25rem, 2rem)` (24/32 px). 1.2. 700. |
| `--fs-h3` | Card h3, filters title | `1.125rem / 1.25rem` (18/20 px). 600. |
| `--fs-body` | Default paragraph (mobile body ≥16px to avoid iOS zoom on inputs!) | `1rem` (16 px). Line 1.55. 400. **MANDATORY ≥16px for inputs. |
| `--fs-body-sm` | Meta text, captions, seller card | `0.875rem` (14 px). 1.45. 400. |
| `--fs-xs` | Helper text, breadcrumbs, fine print | `0.75rem` (12 px). 1.4. 500 uppercase for labels. |
| `--fs-price-lg` | PDP price (KES + KSh) | `1.5rem` (24 px) / desktop 1.75rem. 700. tabular-nums. Copper-500. |
| `--fs-price-sm` | Card price | `1.0625rem` (17 px). 700. tabular-nums. Copper-500. |
| `--fs-compare-at` | Strikethrough compare-at | `0.875rem` line-through, neutral-400. |
| `--fs-badge` | Chips | `0.6875rem` (11 px). 600 uppercase tracking-widest 0.05em. |

**Rules:**
- Never use <16 px for form inputs on iOS.
- Buttons tap target ≥48×48 px on mobile; main nav thumb zone ≤120 px from bottom.
- Line-height tight on display, generous on body paragraphs (≥1.55 ≥ 1.55).

---

## 3. Spacing (8px grid — strictly)

Use multiples of 4 / 8. NEVER px values arbitrary in style.

| Token | rem (px) | Usage |
|-------|----------|-------|
| 0.5 | 0.125 (2) | Hairlines |
| 1 | 0.25 (4) | Icon inside |
| 1.5 | 0.375 (6) | Badge py |
| 2 | 0.5 (8) | Card px/py, inline gap |
| 3 | 0.75 (12) | Card inner gap |
| 4 | 1 (16) | Section gap mobile |
| 6 | 1.5 (24) | Card outer gap, desktop section gap |
| 8 | 2 (32) | Section desktop, gutter |
| 10 | 2.5 (40) | Large section |
| 12 | 3 (48) | Padding page top/bottom |
| 16 | 4 (64) | Hero/feature gap |
| 20 | 5 (80) | XL sections |
| 24 | 6 (96) | Page header banner |

---

## 4. Radius, Shadows, Borders, Motion

### Radius (tokens → not arbitrary):
- `--radius-sm` 6 px — input, badge
- `--radius-md` 10 px — card, button
- `--radius-lg` 16 px — modals, sheets, filter sidebar
- `--radius-xl` 24 px — hero cards, featured
- `--radius-full` 9999px — pills, FAB, avatar
- Rule: radius ≥ 10 on cards. No sharp corners on primary surfaces.

### Shadows (Kenya → Nairobi dust soft, not heavy harsh):
```
shadow-xs:   0 1px 2px rgba(15,23,42,0.05)
shadow-sm:   0 2px 6px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)
shadow-card: 0 4px 16px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)  (default card)
shadow-lg:   0 12px 32px -8px rgba(15,23,42,0.12), 0 4px 10px rgba(15,23,42,0.05)
shadow-xl:   0 24px 60px -12px rgba(15,23,42,0.18) (Quick View, Drawer above)
shadow-cta:  0 10px 24px -6px rgba(234,106,12,0.45) (primary button drop shadow — copper)
```

### Borders:
- Default border: `1px solid hsl(var(--neutral-200))` → border `2px on focus ring (copper 300 20% shadow + 2px outline)
- Input default neutral-200; error error-500; success jade-500

### Motion (subtle — no heavy Lottie / parallax on mobile!):
**Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` — easeOutQuint-ish.
**Durations:**
- Hover/Press: 150 ms
- Modal/Sheet enter: 220 ms
- Route transition View Transitions: 180 ms fade + slide
- Skeleton shimmer: 1.4s linear infinite (gradient 300% translateX)
- Reservation countdown pulse: 1.1s breathing on last 2 min, last 30s → error rose-600 bg pulse

**Hard rules:**
- No auto-playing video with sound. Muted video only, plays on hover or tap.
- No scrolljacking.
- Respect `prefers-reduced-motion: reduce` → disable animations, instant transitions.

---

## 5. Component Library (Base — Radix + Tailwind)

All interactive UI MUST use `@radix-ui/*` primitives for accessible keyboard/screen-reader. Custom-styled via Tailwind.

### Phase 1 Components (TASK-010 deliverables):

| Component | Radix primitive | Notes |
|-----------|----------------|-------|
| Button | — | variants: `primary / secondary / outline / ghost / danger / whatsapp` (WhatsApp green `#25D366`!); sizes: `sm/default/lg/icon` |
| Input | — | variants: `default / error / success`; label, helper, prefix icon, suffix toggle password |
| Select | `@radix-ui/react-select` | searchable multi-select for filters; default single |
| Textarea | — | autogrow |
| Checkbox | `@radix-ui/react-checkbox` | |
| Radio Group | `@radix-ui/react-radio-group` | variant swatches |
| Switch | `@radix-ui/react-switch` | notification preferences toggles |
| Slider | `@radix-ui/react-slider` | dual-thumb price slider KES |
| Dialog / Quick View | `@radix-ui/react-dialog` | modal + non-modal Quick View (pop over or Dialog? Use Dialog Modal) |
| Sheet / Drawer | `@radix-ui/react-dialog` (sheet-style) | mobile filter bottom-sheet |
| Toast / Sonner | `sonner` (already fits pattern) | success/error/info |
| Badge | — | variants: `verified(jade) / warranty(jade) / new(copper) / sale(rose) / negotiable(amber) / used(slate) / oos(rose-50) / low_stock(amber-50) / trending(copper-100) / reserved(navy-100)` |
| Card | — | variants: `product-card / listing-card / seller-card / kpi-card / filter-card` |
| Price | — | formatted KES `KES 24,999` or `KSh 24,999`; tabular nums; `--compare-at` strikethrough; discount badge `-18%` |
| Skeleton | — | shimmer 1.4s; variants: image rect, text lines, price, card grid |
| Alert | — | info/success/warning/error |
| Avatar | — | initials fallback + onError |
| Progress | — | TTL countdown bar (reservation 20 min → 0) |
| Accordion | `@radix-ui/react-accordion` | filter sidebar collapsible sections |
| Tabs | `@radix-ui/react-tabs` | PDP tabs (specs, reviews, shipping) |
| Dropdown Menu | `@radix-ui/react-dropdown-menu` | sort, user menu, bulk actions |
| Tooltip | `@radix-ui/react-tooltip` | icon-only buttons |
| Popover | `@radix-ui/react-popover` | color palette tooltip |
| Breadcrumbs | — | mobile collapsed, desktop full chain |
| Image Gallery (PDP) | `swiper/react` or custom — minimal | main image, thumbs, video overlay badge, pinch-zoom (Phase 2) |
| Compare-at / variant radio swatch | Radio Group + div | color swatch circle + name; stock per variant label |
| Kenyan Phone Input | custom Input + prefix + regex validation → React Hook Form Zod superRefine | +254 auto-prepend or 07/011 accept → normalize to +2547xx / +25410xx |
| Reservation Timer | Client Component (useCountdown zustand global + Realtime sync) | 20 min TTL; last 2 min pulse amber; last 30s pulse rose; extend +10 min button once |
| FAB Reserve (mobile PDP) | sticky bottom 12 px | 48×48 Copper-500 shadow-cta |

---

## 6. Grid & Responsive Breakpoints

Tailwind default: `sm:640 / md:768 / lg:1024 / xl:1280 / 2xl:1536`

**Mobile-first rules:**
- Mobile < md: 2-col grid product results; sticky filters bottom sheet (trigger FAB)
- md ≤ desktop < lg: 3-col; left filter sidebar compact
- lg+: 5-col + 280 px left filter sidebar; header 80 px sticky
- Page max-width: `max-w-7xl (1280 px) mx-auto` for content. Landing hero: full-bleed but content constrained.
- PDP: Mobile stack (gallery → buy box → info); Desktop split-left-gallery / right-buybox 60/40.
- Always test: 360 px (Galaxy A series), 390 px (iPhone 15), 430 px (iPhone 15 Pro Max), 768 (iPad mini), 1440 (desktop).

---

## 7. Accessibility (WCAG 2.1 AA — MANDATORY)

Must-haves before marking any UI task done:
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text. Test copper-500 on white — verify passes.
- All non-decorative images have meaningful `alt`; decorative images have `alt=""` and `role="presentation"`.
- Every interactive element is keyboard tabbable; visible focus ring 2 px copper-300 + offset 2 px.
- Skip-to-content link on first tab (jump to main id=`main`).
- Radix primitives used for all dialogs/menus/tabs/accordions — no custom div-based focus traps (screen reader labels).
- `aria-live="polite"` region for cart add / reservation success / error toasts.
- Form errors announced via `aria-describedby` → error id linked to input.
- Form inputs ≥ 16 px to avoid iOS auto-zoom.
- `prefers-reduced-motion: reduce` honored — `@media (prefers-reduced-motion)` → disable all transform / transition animations; instant.
- Touch targets ≥ 48×48 px; spacing between ≥ 8 px.

---

## 8. Iconography & Images

- **Icons:** `lucide-react` (tree-shaken, modular imports). Sizes: 16/20/24. Stroke 1.5.
- **Product Image placeholder:** Use empty `<div>` with skeleton shimmer OR a "Image coming soon" placeholder — NO AI phones, NO random free Unsplash phones. Only use the 10 placeholders from CATALOGUE_MASTER.md §08 (front.webp…video.mp4) — admin uploads via Supabase Storage bucket later.
- **OG product images:** Generated via Vercel OG on-the-fly (or stored transform) — not hand-crafted.

---

## 9. Dark Mode

- **Phase 2.** Force light theme for Phase 1 v1 launch (`class: light only`) to reduce QA. Roadmap item.
- When implemented: tokens above will add dark-mode complementary variables. Nairobi Navy-900 is the dark-mode surface bg.

---

**End of Design System Placeholder — implement tokens & components in TASK-010.**
