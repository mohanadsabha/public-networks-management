# Network Management Frontend — Structure and Conventions

This document explains how the frontend project is organized and how new work should fit into the existing structure.

## 1. Project overview

The frontend app lives in `network-management-front/` and is part of the larger monorepo:

- `network-management-front/` — React admin dashboard
- `network-management-api/` — backend API server
- `docker-compose.yml` — local setup for the full stack

This app is the client layer for the network management system and is responsible for dashboards, account administration, billing, subscriber flows, settings, and operational tools.

## 2. Tech stack

Current stack used in this frontend:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- TanStack Table
- React Hook Form
- Axios
- i18next
- Recharts, Sonner, date-fns

## 3. Top-level structure

```text
network-management-front/
├── .env
├── .env.example
├── Dockerfile
├── README.md
├── STRUCTURE.md
├── eslint.config.js
├── index.html
├── nginx.conf
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
├── scripts/
├── docs/
├── src/
├── dist/
├── node_modules/
└── package-lock.json
```

## 4. Source structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── routing/
│       ├── GuestRoute.tsx
│       ├── ProtectedRoute.tsx
│       └── RequirePermission.tsx
├── components/
│   ├── layout/
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── DashboardSidebarPanel.tsx
│   │   ├── DocumentTitle.tsx
│   │   └── index.ts
│   ├── pages/
│   │   ├── activity-logs/
│   │   ├── auth/
│   │   ├── available-usernames/
│   │   ├── customers/
│   │   ├── expiring/
│   │   ├── finance/
│   │   ├── home/
│   │   ├── online-users/
│   │   ├── settings/
│   │   ├── sms/
│   │   ├── speeds/
│   │   ├── statistics/
│   │   ├── stopped/
│   │   ├── subscribers/
│   │   ├── support/
│   │   ├── usage/
│   │   └── users/
│   └── ui/
│       └── reusable design system pieces
├── hooks/
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   ├── useSubscribers.ts
│   ├── useSpeeds.ts
│   ├── useFinance.ts
│   ├── useInvoices.ts
│   ├── useOnlineUsers.ts
│   ├── usePermissions.ts
│   ├── useRoleAccess.ts
│   ├── useRouterCatalog.ts
│   ├── useSms.ts
│   ├── useStatistics.ts
│   ├── useSupport.ts
│   ├── useAdminUsers.ts
│   ├── useActivityLogs.ts
│   └── index.ts
├── lib/
│   ├── i18n.ts
│   ├── permissions.ts
│   ├── apiClient.ts
│   ├── cn.ts
│   ├── pageTitles.ts
│   └── other utilities
├── locales/
│   ├── ar.ts
│   └── en.ts
├── pages/
│   ├── activity-logs/
│   ├── auth/
│   ├── available-usernames/
│   ├── customers/
│   ├── expiring/
│   ├── finance/
│   ├── home/
│   ├── online-users/
│   ├── settings/
│   ├── sms/
│   ├── speeds/
│   ├── statistics/
│   ├── stopped/
│   ├── subscribers/
│   ├── support/
│   ├── usage/
│   ├── users/
│   └── _shared/
├── providers/
│   ├── AppProviders.tsx
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   └── index.ts
├── services/
│   ├── auth.service.ts
│   ├── customers.service.ts
│   ├── finance.service.ts
│   ├── invoices.service.ts
│   ├── logs.service.ts
│   ├── mikrotikConnection.service.ts
│   ├── onlineUsers.service.ts
│   ├── routers.service.ts
│   ├── sms.service.ts
│   ├── speeds.service.ts
│   ├── statistics.service.ts
│   ├── subscribers.service.ts
│   ├── support.service.ts
│   ├── usernames.service.ts
│   ├── users.service.ts
│   ├── vpn.service.ts
│   └── index.ts
├── styles/
│   ├── index.css
│   └── theme.ts
├── store/
├── types/
├── main.tsx
├── vite-env.d.ts
└── app/router.tsx
```

## 5. Architectural rules

### 5.1 Route pages stay thin

Files in `src/pages/` should act as route-level containers. They should:

- render the main page layout
- compose feature sections
- handle route-level state or navigation
- keep business logic light

Detailed UI and reusable sections should live under `src/components/pages/<feature>/` instead of inside the route file.

### 5.2 Feature modules are organized by domain

Each business feature is grouped by domain folder, for example:

- `customers`
- `subscribers`
- `finance`
- `sms`
- `settings`
- `speeds`
- `users`

This helps keep the codebase aligned with the actual product rather than with generic UI categories.

### 5.3 Services are data access only

Files in `src/services/` should contain HTTP or API logic only.

Good pattern:

```ts
export const authService = {
  login,
  logout,
  me,
};
```

Avoid putting React logic, component state, or UI rendering in service files.

### 5.4 Hooks wrap services with React Query

The `src/hooks/` layer is where data is read and mutated with TanStack Query.

Examples:

- `useAuth`
- `useCustomers`
- `useSubscribers`
- `useSpeeds`
- `useFinance`
- `useAdminUsers`

Hooks are responsible for:

- query keys
- API calls through services
- mutation invalidation
- UI-facing data shaping

### 5.5 UI primitives remain reusable and generic

`src/components/ui/` is reserved for generic design system primitives only.

Not for:

- page sections
- feature-specific forms
- route containers

Examples of generic UI elements include buttons, cards, forms, typography, feedback, navigation, modals, and branding primitives.

### 5.6 The app uses permission-aware routing

Route protection is implemented in `src/app/router.tsx` via wrappers like:

- `ProtectedRoute`
- `GuestRoute`
- `RequirePermission`

This ensures the UI respects access rules and feature visibility based on user role and permission sets.

## 6. Files and folders that matter most

### App shell

- `src/app/App.tsx` — root app wrapper and router mount
- `src/app/router.tsx` — all route definitions and permission boundaries
- `src/providers/` — auth, query, theme, app composition

### User and auth flow

- `src/services/auth.service.ts`
- `src/hooks/useAuth.ts`
- `src/providers/AuthProvider.tsx`
- `src/lib/i18n.ts`

### Styling and theming

- `src/styles/index.css`
- `src/styles/theme.ts`
- Tailwind config and PostCSS setup at the root

### Localization

- `src/locales/ar.ts`
- `src/locales/en.ts`

This project supports Arabic and English and updates document direction/language via the i18n layer.

## 7. Naming and code conventions

- Use TypeScript for all new code
- Prefer feature-based folder organization over utility-only groupings
- Keep imports clean and use the `@/` alias
- Keep route page components focused on composition
- Use hooks to encapsulate React Query state and API access
- Keep UI texts in locale files instead of hardcoded strings
- Match the repo’s existing domain naming patterns when adding new modules

## 8. Environment and runtime expectations

Important runtime assumptions:

- frontend runs on port `5173`
- backend is expected on `http://localhost:3000`
- Vite proxies `/api` requests to the backend
- app-level auth and permissions are enforced through route guards

Typical `.env` values include:

```env
VITE_API_BASE_URL=/api/v1
VITE_SKIP_AUTH_CHECK=false
VITE_VPN_LIVE=false
```

## 9. Working on this codebase

When adding a new feature:

1. Create or update the route page under `src/pages/<feature>/`
2. Add the UI implementation under `src/components/pages/<feature>/`
3. Create or extend the service file under `src/services/`
4. Add the query/mutation hook under `src/hooks/`
5. Wire the route and permission guard in `src/app/router.tsx`
6. Add translations if user-facing text is introduced

## 10. Final note

This frontend is intentionally structured to mirror the actual product domains and to keep the UI logic modular and maintainable. The most important rule is simple:

- `pages` = route-level orchestration
- `components/pages` = feature UI
- `services` = API access
- `hooks` = React Query integration
- `ui` = reusable design system

That separation is the foundation of the repo’s current architecture.

See `src/lib/roles.ts` for the canonical list.

### Roles (seed)

| Role   | `role_name` | Access               |
| ------ | ----------- | -------------------- |
| Admin  | `admin`     | Full access          |
| Viewer | `viewer`    | Read-only (`*.view`) |

### CORS (dev)

Allow origin `http://localhost:5173` so the Vite app can call the API.

### Dev proxy

Vite: `/api` → `http://localhost:3000` — frontend base URL is `/api/v1`.

---

### Support tickets _(connected to API)_

Route: `/support` — tickets are **created manually by support staff** (phone / office visit), not by subscribers online.

#### Suggested statuses

| `status`           | Meaning                                |
| ------------------ | -------------------------------------- |
| `open`             | Logged, not started                    |
| `in_progress`      | Team is working on it                  |
| `waiting_customer` | Waiting for subscriber callback / info |
| `resolved`         | Closed / solved                        |

#### Suggested fields (`SupportTicket`)

| Field             | Type                                        | Notes                                  |
| ----------------- | ------------------------------------------- | -------------------------------------- |
| `id`              | number                                      |                                        |
| `ticketNumber`    | string                                      | e.g. `TKT-2026-0142`                   |
| `title`           | string                                      | Short summary                          |
| `description`     | string                                      | Full issue details                     |
| `status`          | enum above                                  |                                        |
| `priority`        | `low` \| `medium` \| `high` \| `urgent`     |                                        |
| `channel`         | `phone` \| `visit` \| `whatsapp` \| `other` | How contact happened                   |
| `subscriberName`  | string                                      | May not be linked to DB subscriber yet |
| `subscriberPhone` | string                                      |                                        |
| `assignedTo`      | string                                      | Support staff name                     |
| `createdAt`       | ISO datetime                                |                                        |
| `updatedAt`       | ISO datetime                                |                                        |
| `resolvedAt`      | ISO datetime \| null                        | Set when status → `resolved`           |

#### Endpoints (implemented)

- `GET /api/v1/support/tickets` — list (+ optional `?status=` filter)
- `POST /api/v1/support/tickets` — create (admin)
- `PUT /api/v1/support/tickets/:id` — update (admin)
- `DELETE /api/v1/support/tickets/:id` — delete one (admin)
- `DELETE /api/v1/support/tickets/all` — delete all tickets (admin)

Charts/stats are computed on the frontend from the ticket list (`src/lib/supportAnalytics.ts`). Ticket `title` is free text (Arabic in production, e.g. «يحتاج برمجة راوتر»).

Seed: `npm run seed` (API) inserts roles and default admin/viewer users only — no sample subscribers or tickets.

---

### Customers & subscribers _(UI — mock; API spec ready)_

**Backend API (every request for UI pages):** [`docs/backend.md`](docs/backend.md).  
**Field-level contract:** [`docs/CUSTOMERS_SUBSCRIBERS_API.md`](docs/CUSTOMERS_SUBSCRIBERS_API.md).

**Model:** One DB row per person. Stopped accounts **stay on Customers** (balance/debt). Stop removes them from Subscribers and clears username back to pool.

| Page           | Rule                                                           |
| -------------- | -------------------------------------------------------------- |
| `/customers`   | **All** records (customer, subscriber, expiring, **stopped**)  |
| `/subscribers` | Has username, not stopped (**includes expiring**)              |
| `/expiring`    | Username, not stopped, disconnect ≤7 days or past              |
| `/stopped`     | **Customers + Stopped only** — `isSuspended`, username cleared |

Excel import/export → **Settings** only.

Helpers: `src/lib/customerUtils.ts`, `src/lib/subscriberUtils.ts`, mock: `src/lib/mocks/subscribers.mock.ts`.

---

### Available usernames _(connected to API)_

Route: `/available-usernames` — pool of PPPoE usernames **per speed tier**. When a username is assigned to a subscriber it stays visible here during a **cooldown** (default **30 days**), then moves to the **Expiring** page (separate route, not built yet).

#### Lifecycle (derived on frontend + backend)

| UI status   | `lifecycleStatus` | In pool? | Meaning                                                      |
| ----------- | ----------------- | -------- | ------------------------------------------------------------ |
| **New**     | `new`             | yes      | Never assigned (`assignedAt` / `expiryDate` null, not owner) |
| **Running** | `in_cooldown`     | yes      | Assigned; cooldown active until `expiryDate`                 |
| **Owner**   | `owner`           | yes      | `isOwnerUsername: true` — never expires                      |
| _(hidden)_  | `expired`         | no       | `expiryDate` passed — list on Expiring page later            |

Do **not** rely on `isUsed` alone for UI; use `assignedAt`, `expiryDate`, `isOwnerUsername`, and compare `expiryDate` to now.

#### API row shape (`AvailableUsername`)

| Field             | Type                 | DB column           | Notes                                                          |
| ----------------- | -------------------- | ------------------- | -------------------------------------------------------------- |
| `id`              | number               | `id`                |                                                                |
| `username`        | string               | `username`          | unique                                                         |
| `password`        | string               | `password`          |                                                                |
| `speedId`         | number               | `speed_id`          | FK → speed tier                                                |
| `isOwnerUsername` | boolean              | `is_owner_username` | Owner pool row                                                 |
| `createdAt`       | ISO date             | `created_at`        |                                                                |
| `assignedAt` (UI) | ISO datetime \| null | `start_date`        | API field **`startDate`** e.g. `2026-05-21T21:50:33.724+03:00` |
| `expiryDate` (UI) | ISO datetime \| null | `end_date`          | Set by API when `startDate` + 30 days; null for new / owner    |

Optional legacy fields in DB: `is_used`, `first_connection_date`, `package` — can support assign flow on backend.

#### Endpoints (implemented)

Base: `/api/v1/speeds/:speedId/usernames`

| Method | Path      | Notes                                            |
| ------ | --------- | ------------------------------------------------ |
| GET    | `/`       | List (`?page=1&limit=500`), excludes `isExpired` |
| POST   | `/`       | Create — body below                              |
| PUT    | `/:id`    | Update status/password                           |
| DELETE | `/:id`    | Soft-delete (`isExpired`)                        |
| POST   | `/import` | multipart `file` (Excel)                         |
| GET    | `/export` | Excel download                                   |

UI list filters (`new` / Running / Owner) are **client-side** on the list response.

#### Pool counts (speed cards / header)

Per `speedId`, return or let frontend compute:

```json
{ "total": 12, "new": 5, "inCooldown": 4, "owner": 3 }
```

Helpers: `src/types/availableUsername.ts` (`getSpeedPoolCounts`, `getDaysUntilExpiry`).

#### Assign / cooldown (subscriber flow — backend)

When admin assigns pool username to subscriber (or subscriber changes username but cooldown not finished):

1. Set `assignedAt` (and `is_used` if you keep it).
2. Set `expiryDate = assignedAt + USERNAME_COOLDOWN_DAYS` (30 unless configurable).
3. Row remains in **Available usernames** list with status **Running** and “Expires in N days”.

After `expiryDate`, row leaves this pool → **Expiring** table/page (future).

Owner usernames: `isOwnerUsername: true`, no `expiryDate` / no cooldown.

#### POST body (create) — maps from UI status

| UI status | `isOwnerUsername` | `isUsed` | `startDate`                              |
| --------- | ----------------- | -------- | ---------------------------------------- |
| New       | `false`           | `false`  | omit                                     |
| Running   | `false`           | `true`   | **required** — ISO with offset from form |
| Owner     | `true`            | `false`  | omit                                     |

Example Running payload:

```json
{
  "username": "0599123456PP",
  "password": "wifi2024",
  "isOwnerUsername": false,
  "isUsed": true,
  "startDate": "2026-05-21T21:50:33.724+03:00"
}
```

PUT uses the same flags; `isUsed: false` or `isOwnerUsername: true` clears `startDate` / `endDate` on the server.

Frontend: `src/services/usernames.service.ts`, `src/lib/mapAvailableUsernames.ts` (`toApiStartDate`), `src/hooks/useAvailableUsernames.ts`

---

## Commands

```bash
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

---

## Product context (WeWiFi)

Admin dashboard for WiFi/PPPoE subscription management:

- Customers → assign username from pool → 30-day cycle
- Speed tiers, invoices (debit/credit), MikroTik online users, SMS, RBAC
- Roles: **admin** (full access) + **viewer** (read-only) — only two roles for now
- Arabic RTL primary; English secondary

See client requirements in chat history for full feature list.
