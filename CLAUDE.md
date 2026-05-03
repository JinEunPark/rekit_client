# Rekit — Project context for AI assistants

> Vue 3 e-commerce app for **rekit** (철거 가전 직거래 플랫폼). This file is auto-loaded; read it before answering or editing.

## What is rekit

A marketplace for inspecting and reselling appliances rescued from 철거 (demolition) sites — average 73% off retail. Mobile-first responsive, mint/sage green accent. Brand was renamed from "rekle" to **rekit** (trademark conflict). **Never reintroduce "rekle"** — folder name `/rekle/` is the only legacy reference left intact (renaming would disrupt IDE state; user can `mv` manually).

## Stack

- Vue 3.5 (`<script setup>` + Composition API), TypeScript strict
- Vite 8 · Vue Router 5 · Pinia 3 (setup-store)
- Pretendard (Korean) + JetBrains Mono · scoped CSS + CSS variables (no framework)
- Node 20.19+ / 22.13+ / 24+

```bash
npm run dev          # dev server
npm run type-check   # vue-tsc --build
npm run build        # production
```

## Folder layout

```
src/
├── _design/                  Design reference (locked, DO NOT import in production)
│   └── ...                   14 mockup screens at /_design/* (kept for visual specs)
├── components/
│   ├── ds/                   Design-system primitives (Badge, Button, IconBase, RekitLogo, ApplianceGlyph, ProductTile)
│   ├── layout/               AppHeader, AppFooter, MobileTabBar, StaticPage
│   ├── products/             ProductCard
│   ├── search/               SearchDropdown (desktop only)
│   └── checkout/             CheckoutSteps
├── composables/              useSearchHistory (recents + popular)
├── data/products.ts          PRODUCTS mock + types
├── design/
│   ├── tokens.ts             REKIT.color/.radius/.font + won() formatter
│   └── icons.ts              ICON_PATHS map
├── stores/                   Pinia setup-stores, all localStorage-persisted
│   ├── auth.ts               (User, login/logout)
│   ├── products.ts           (PRODUCTS read-only + applyFilters() + CATEGORIES + SORTS)
│   ├── cart.ts
│   ├── wishlist.ts
│   ├── addresses.ts          (CRUD + default; auto-migrates legacy single-default)
│   └── orders.ts             (Order ID = RK-YYMMDDxxxx)
├── views/                    Real app screens (see "Built" below)
├── router/index.ts
├── App.vue                   Layout switcher (focused vs default)
└── main.ts

docs/api.md                   ← Authoritative backend API spec (50 endpoints, 9 domains)
todo.md                       ← Phased work plan (P0–P4)
```

## Critical conventions

### Design tokens — synchronized
- `src/design/tokens.ts` exports `REKIT` JS const (used by `_design/*` mockups)
- `src/assets/main.css` mirrors as `--rekit-*` CSS variables (used by real components)
- **Both must stay in sync** when changing colors. Real components prefer CSS variables.

### Layout switching (App.vue)
Routes branch into different layouts based on path prefix. Adding a focused page = add a `computed` flag + a `<RouterView v-else-if="...">` branch:

| Mode | Trigger | What renders |
|---|---|---|
| Design canvas | `/_design/*` | Black canvas frame |
| Design index | exactly `/_design` | Bare RouterView |
| **Auth focused** | `/auth/*` | Bare RouterView (no header/footer/tabbar) |
| **Search focused** | exactly `/search` | Bare RouterView (its own back+search bar) |
| **Checkout focused** | `/checkout/*` | Header only (no footer/tabbar) |
| **Admin shell** | `/admin/*` | Bare RouterView — `AdminShell` (sidebar+header) renders inside each admin view |
| Default | everything else | Header + main + Footer + MobileTabBar |

### Header pattern (responsive search)
- **Mobile <768px**: hamburger drawer + logo + search **icon link to `/search`** + cart (badge)
- **Desktop ≥768px**: logo + `<SearchDropdown />` (anchored panel, recents/popular/live preview, submit → `/products?q=…`) + heart/cart/user
- Drawer is auxiliary navigation only (account + help links). Categories live on home grid + `/products` chips + mobile tab bar — NOT in the header.

### Pinia + localStorage pattern
All stores: setup-style, `watch(state, ..., { deep: true })` persists to `rekit.<domain>.v<n>` keys. Bump the version when changing schema (old data silently dropped). Module-level singleton refs for things like `useSearchHistory.recents`.

### Form fields
The `.field` / `.field__row` / `.field__label` pattern with focus-ring (`box-shadow: 0 0 0 3px rgba(26,26,23,0.06)`) is duplicated across ~7 views (auth, checkout, addresses). **If a 3rd new form gets added**, extract to `components/ds/TextField.vue`. Until then the duplication stays.

### ProductCard inside RouterLink
The heart `<button>` uses `@click.stop.prevent` to avoid triggering navigation. Copy this pattern for any actionable button inside a link-card.

## Implementation status

### ✅ Built — buyer flow is feature-complete
- **Auth (4)**: `/auth/sign-in`, `/auth/sign-up`, `/auth/find-id`, `/auth/find-password`
- **Storefront (4)**: `/`, `/products`, `/products/:id`, `/cart`
- **Search**: `/search` (mobile full-page) + `<SearchDropdown />` (desktop)
- **Checkout (3)**: `/checkout/identity` → `/checkout/order` → `/checkout/complete?order=…`
- **My (6)**: `/my`, `/my/orders`, `/my/orders/:id`, `/my/wishlist`, `/my/addresses`, `/my/profile`
- **Static (7)**: `/guide`, `/about`, `/help/{faq,contact,notice}`, `/legal/{terms,privacy}`, 404
- **Admin (6)**: `/admin`, `/admin/{products,products/new,orders,members,sales}` — responsive port via `components/admin/AdminShell.vue` (sidebar collapses to drawer <1024px). UI only — no RBAC, no CRUD, no real CSV. Read-only on `useProductStore`; orders/members/sales use mock arrays inline. `products/new` is a 5-section form with sticky preview sidebar — submit is a no-op.
- **Design ref**: 14 screens at `/_design/*` (locked)

### 🔴 Not built (priority order)
1. **Backend** — every store is mock. Spec at `docs/api.md`. Migrate stores one at a time, swap loaders inside while keeping the public Pinia API stable.
2. **Admin functionality** — shell + 5 views ship as visual ports. Still needed: RBAC gate (auth store has no `role` yet), product/order CRUD, real CSV export, live charts.
3. **Misc**: `/sell` (seller signup), real social auth, real PG payment, real OTP. Currently mocks.

## Working with the design reference

`/_design/*` are faithful Vue ports of the original Claude Design canvas. They use **fixed dimensions** (390×844 phone, 1440×900 desktop) + canvas chrome. **Never import from `_design/`** in production. To build a real screen: open the matching `_design/*.vue` for visual intent, then rebuild responsively under `src/views/`.

## Payment / personal data — never store

Per PCI DSS + 여신금융업법, we **never** receive or store card numbers, CVCs, OTPs, plaintext passwords. PG (토스페이먼츠 / 포트원) handles all card input via their widget. Our server stores only: order metadata, payment status, PG transaction ID. Currently the app stores nothing because there's no backend yet — when integrating, follow this rule strictly. See `docs/api.md` §10 Payments.

## When to ask vs proceed

- Refactor candidates (form fields, etc.) — proceed if the user requests; don't auto-extract.
- Adding a new view to the catalog — match an existing layout mode (focused vs default), follow form-field pattern, persist UI state to a Pinia store with localStorage if it should survive refresh.
- Brand changes — never. "rekit" is final.
- Folder rename `/rekle/ → /rekit/` — defer to user; risky for IDE state.

## Pointers
- Detailed work plan: [todo.md](todo.md)
- Backend API spec: [docs/api.md](docs/api.md) — 50 endpoints, 9 domains, conventions, error codes, data models, security
- Original design package extracted to `/tmp/rekle-design*/` (transient, not in repo)
