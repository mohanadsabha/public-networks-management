# Project structure & conventions

> Read this file at the start of a session so the agent follows our conventions without re-explaining everything.  
> Applies to **WeWiFi / Network PPPOE Management** and can be reused in other projects with the same layout.

---

## Repositories in this monorepo

| Folder | Role |
|--------|------|
| `network-management-front` | Admin UI (currently **React + Vite**; new projects use **Next.js** — see below) |
| `network-management-api` | REST API (**Express + TypeScript + Drizzle + PostgreSQL**) |

API base path: `/api/v1`

---

# Frontend (Next.js)

Use this structure for **new** admin dashboards (Next.js App Router). It mirrors the rules we already use in the Vite app, adapted for Next.js.

## Stack (recommended)

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** — semantic tokens via CSS variables (`src/styles/globals.css`)
- **TanStack Query** — server state
- **TanStack Table** — data tables
- **React Hook Form** — forms (Zod optional on API; frontend can stay without Zod if you prefer)
- **Axios** or `fetch` wrapper — HTTP
- **date-fns**, chart library (ECharts / Recharts), **Sonner** toasts
- **i18next** — Arabic (default, RTL) + English
- Auth: **httpOnly cookie** from API + `credentials: "include"` on requests

## Folder structure

```
src/
├── app/                          # Next.js App Router — routes only (thin)
│   ├── layout.tsx                # Root layout (providers, fonts, dir/lang)
│   ├── page.tsx                  # Home / dashboard
│   ├── (auth)/                   # Route group — no URL segment
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/              # Authenticated shell
│   │   ├── layout.tsx            # DashboardLayout + auth guard
│   │   ├── subscribers/
│   │   │   ├── page.tsx
│   │   │   └── [lineId]/
│   │   │       ├── page.tsx      # redirect → default tab
│   │   │       └── [tab]/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── expiring/page.tsx
│   │   └── …
│   └── api/                      # Optional Route Handlers (BFF only — prefer external API)
│
├── components/
│   ├── layout/                   # DashboardLayout, AuthLayout, Sidebar, Header
│   ├── pages/                    # Page sections — one folder per feature/route
│   │   ├── auth/
│   │   ├── subscribers/
│   │   ├── speeds/
│   │   └── support/
│   └── ui/                       # Design system ONLY (reusable primitives)
│       ├── buttons/
│       ├── forms/
│       ├── typography/
│       ├── navigation/
│       ├── feedback/
│       ├── modals/
│       ├── cards/
│       ├── data/
│       └── */index.ts            # barrel exports
│
├── services/                     # HTTP only — no React
│   ├── auth.service.ts
│   ├── subscribers.service.ts
│   └── …
│
├── hooks/                        # TanStack Query + services
│   ├── useAuth.ts
│   ├── useSubscribers.ts
│   └── …
│
├── lib/                          # Pure utilities
│   ├── apiClient.ts
│   ├── cn.ts
│   ├── permissions.ts
│   ├── queryKeys.ts
│   ├── i18n.ts
│   └── *Utils.ts                 # domain helpers (subscriberUtils, smsUtils, …)
│
├── types/                        # Shared TS types
├── providers/                    # Client providers (Query, Theme, Auth)
├── locales/                      # i18n JSON / TS modules (ar, en, *.i18n.ts)
├── styles/
│   ├── globals.css               # Tailwind + CSS variables
│   └── theme.ts
│
└── middleware.ts                 # Auth redirect, locale (root of src/ or project root per Next version)
```

### React (Vite) → Next.js mapping

| Vite / React Router | Next.js App Router |
|---------------------|-------------------|
| `src/app/router.tsx` | `src/app/**/page.tsx` file-based routes |
| `src/pages/SubscribersPage.tsx` | `src/app/(dashboard)/subscribers/page.tsx` |
| `ProtectedRoute` | `(dashboard)/layout.tsx` + `middleware.ts` or client guard |
| `GuestRoute` | `(auth)/layout.tsx` |
| `VITE_*` env | `NEXT_PUBLIC_*` env |
| `index.html` title | `metadata` / `generateMetadata` in layouts |
| `DocumentTitle` component | `metadata.title` in `layout.tsx` or per-page |

## Page vs section components

**App route files stay thin** — compose layout + hooks + sections. All UI lives under `components/pages/`:

```
app/(dashboard)/subscribers/page.tsx     ← wiring only
components/pages/subscribers/
├── SubscribersTable.tsx
├── SubscriptionFilters.tsx
├── SubscriberFormModal.tsx
└── index.ts
```

Rules:

- **One folder per feature** under `components/pages/` (mirrors route name).
- Shared across 2+ pages in the same domain → keep in that domain folder (e.g. `components/pages/speeds/SpeedTierPicker.tsx`).
- **Never** put page sections in `components/ui/` — that folder is the design system only.
- Promote to `components/<domain>/` only when used across many unrelated features.

## Client vs server components

| Use | Where |
|-----|--------|
| Server Component (default) | Static layout, metadata, initial shell |
| `"use client"` | Hooks, TanStack Query, forms, modals, tables, i18n `useTranslation`, browser APIs |

Keep client boundaries **small**: page shell can be server; wrap interactive blocks in client components.

## Services + hooks pattern

```ts
// services/subscribers.service.ts — HTTP only, no React
export const subscribersService = {
  list(params) { … },
  getByLineId(lineId) { … },
};

// hooks/useSubscribers.ts — TanStack Query
export function useSubscribersQuery(params) {
  return useQuery({
    queryKey: subscribersQueryKey(params),
    queryFn: () => subscribersService.list(params),
  });
}
```

- **useQuery** → GET / read
- **useMutation** → POST, PUT, PATCH, DELETE — invalidate related `queryKey`s after success
- Centralize keys in `lib/queryKeys.ts`

## UI rules

| Need | Use | Do not use |
|------|-----|------------|
| Titles | `<Heading as="h1">` | raw `<h1>` |
| Body text | `<Text>`, `<Text muted>` | manual `<p>` classes |
| Buttons | `<Button>` | raw `<button>` |
| Inputs | `<Input>`, `<Textarea>` | raw `<input>` |
| Loading | `<Spinner>`, skeletons | one-off spinners |
| Logo | `<Logo>` | hardcoded brand text in every page |

Import from barrels: `@/components/ui/buttons`, `@/components/ui/typography`, etc.

## i18n

- All user-facing strings in `src/locales/` (split by domain: `subscribers.i18n.ts`, `en.ts`, `ar.ts`)
- `useTranslation()` → `t("subscribers.table.lineId")`
- Do not hardcode Arabic/English in JSX (except fixed brand name if required)
- RTL: `dir` on `<html>`; prefer logical Tailwind (`ps-*`, `pe-*`, `start`, `end`)

## Styling

- Semantic tokens: `bg-primary`, `text-muted-foreground`, `border-border`
- No hardcoded hex in components — variables in `globals.css`
- Theme presets in `styles/theme.ts` if needed

## Auth

```env
NEXT_PUBLIC_API_BASE_URL=/api/v1
```

- JWT in **httpOnly cookie** — frontend never stores token in `localStorage`
- All API calls: `credentials: "include"`
- `AuthProvider` calls `GET /auth/me` on load
- `middleware.ts`: redirect unauthenticated users away from `(dashboard)/*`
- Permissions: `lib/permissions.ts` + `<Can permission="…">` or `usePermissions()`

## Admin vs viewer

| | Admin | Viewer |
|---|-------|--------|
| Actions (add/edit/delete/import) | Shown (`canManage`) | Hidden |
| Password fields | Masked + reveal toggle | Masked only |
| Tables | Actions column | Data only |

## Commands (Next.js)

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

# Backend (Express API)

Clean **feature-module** layout. One folder per domain under `src/modules/`.

## Stack

- **Node.js** + **TypeScript**
- **Express 5**
- **Drizzle ORM** + **PostgreSQL**
- **Zod** — request validation
- **JWT** in httpOnly cookie + optional Bearer for tools
- **Winston** logging, **Helmet**, **CORS**, **cookie-parser**

## Folder structure

```
src/
├── index.ts                      # App entry — middleware, route mount, listen
├── drizzle.config.ts
│
├── config/                       # App configuration
│   ├── db.ts                     # Pool + initDb
│   ├── cloudinary.ts
│   ├── multer.ts
│   └── mikrotikEnabled.ts
│
├── middleware/
│   ├── auth.middleware.ts        # protect, restrictTo
│   ├── error.middleware.ts       # globalErrorHandler
│   └── logger.middleware.ts      # activity logs
│
├── modules/                      # Feature modules (main code lives here)
│   ├── auth/
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   ├── subscribers/
│   │   ├── subscribers.route.ts
│   │   ├── subscribers.controller.ts
│   │   ├── subscribers.service.ts
│   │   ├── subscribers.validation.ts
│   │   └── subscribers.excel.ts  # import/export only for this domain
│   ├── sms/
│   ├── support/
│   └── …
│
├── db/
│   ├── schema/                   # Drizzle table definitions
│   │   ├── subscribers.ts
│   │   ├── smsTemplates.ts
│   │   └── index.ts              # re-export schemas
│   ├── migrations/               # SQL migrations (drizzle-kit)
│   └── seed/
│       └── seeder.ts
│
└── utils/                        # Shared pure helpers (no business rules)
    ├── appError.ts
    ├── authCookie.util.ts
    ├── disconnectDate.util.ts
    └── zod.util.ts
```

## Module pattern (per feature)

Each feature follows the same layers:

```
route.ts       → HTTP paths, middleware (protect, restrictTo), maps to controller
controller.ts  → Parse req, call service, shape JSON response, activity meta
service.ts     → Business logic + DB (Drizzle queries)
validation.ts  → Zod schemas for body/query/params
```

**Responsibilities:**

| Layer | Does | Does not |
|-------|------|----------|
| **Route** | Path, method, auth guards | Business logic |
| **Controller** | Status codes, `res.json`, thin orchestration | Raw SQL, complex rules |
| **Service** | Queries, transactions, domain rules | `req` / `res` |
| **Validation** | Input shape | Database access |

Example flow:

```
DELETE /api/v1/sms/templates/:id
  → sms.route.ts (protect + restrictTo)
  → sms.controller.deleteTemplate
  → sms.service.deleteSmsTemplate(id)
```

## Registering routes (`index.ts`)

```ts
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/subscribers", subscribersRoute);
app.use("/api/v1/sms", smsRoute);
// …
app.use(globalErrorHandler);
```

- Prefix every module with `/api/v1/<resource>`
- Register `activityLogMiddleware` once for `/api/v1` (exclude auth if needed)
- Health check: `GET /health` outside versioned API

## Database

- **Schema** in `db/schema/*.ts` — one file per table/group
- **Migrations** in `db/migrations/` — never edit production DB by hand
- **Seed** in `db/seed/seeder.ts` — roles, default admin only (no fake business data unless dev)

```bash
npm run migrate:generate   # after schema change
npm run migrate            # apply migrations
npm run seed               # optional seed data
```

## API response conventions

Prefer consistent envelopes:

```json
{ "success": true, "data": { … } }
{ "status": "success", "data": { … } }
```

Errors via `AppError` → `error.middleware.ts`:

```json
{ "status": "fail", "message": "Human-readable message" }
```

Use **404** for missing resources, **403** for forbidden, **401** for unauthenticated.

## Auth

- Cookie name: `wewifi_token` (httpOnly, secure in production)
- `protect` middleware attaches `req.user`
- `restrictTo("super_admin", "admin")` on write/delete routes
- Viewer: read-only endpoints without `restrictTo` or with permission checks in service if needed

## Cross-cutting rules

- **Excel import/export** → colocated `*.excel.ts` in the owning module
- **Shared date/subscriber helpers** → `utils/` (e.g. `disconnectDate.util.ts`)
- **No** business logic in `index.ts` beyond bootstrapping
- **Transactions** for multi-table writes (`db.transaction`)
- Foreign keys: prefer `ON DELETE SET NULL` when deleting parents should not block (e.g. SMS logs → template)

## Commands

```bash
npm run dev          # tsx watch src/index.ts
npm run build
npm run start
npm run migrate
npm run seed
```

---

# Full-stack workflow

1. **API first** (or contract): route → controller → service → validation → schema/migration  
2. **Types** on frontend in `types/` matching API DTOs  
3. **Mapper** in `lib/map*.ts` if API shape ≠ UI shape  
4. **Service** + **hook** on frontend  
5. **Page section** components under `components/pages/<feature>/`  
6. **Thin route** in Next `app/.../page.tsx` or Vite `pages/`

## After each task

List **files edited/added** at the end of the response for review.

## Product context (WeWiFi)

Admin dashboard for WiFi / PPPoE subscription management:

- Customers & subscribers, username pool, 30-day billing cycle, expiring / stopped
- Speed tiers, invoices, MikroTik online users, SMS, support tickets, RBAC
- Roles: **admin** (manage) + **viewer** (read-only)
- Arabic RTL primary; English secondary
