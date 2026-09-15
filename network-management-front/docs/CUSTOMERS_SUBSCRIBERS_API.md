# Customers & Subscribers API — Backend Contract

> **For:** Mohanad / `network-management-api`  
> **From:** `network-management-front` UI (mock today, ready to wire)  
> **Base URL:** `/api/v1` (same as Support, Speeds, Available usernames)  
> **Auth:** Bearer JWT — `protect` middleware; write routes use `restrictTo("admin")` unless noted.

---

## 1. Domain model

One **person record** in Postgres (`subscribers` table). The UI splits the same record across pages by **lifecycle**, not separate “customer” and “subscriber” tables.

| UI page | Who appears | Rule |
|---------|-------------|------|
| **Customers** `/customers` | Everyone | All records (including **stopped** — they may still **owe money**). |
| **Subscribers** `/subscribers` | Subscriptions with username | `usernameId` set, `isSuspended = false` — **includes expiring** (same row also on Expiring). |
| **Expiring** `/expiring` | End / soon end of cycle | Same as above + `disconnectionDate` within 7 days or past; **not stopped**. |
| **Stopped** `/stopped` | Stopped (موقوف) | `isSuspended = true`, `usernameId = null` — **Customers + Stopped only** (not Subscribers, not Expiring). |

**Rules the UI expects:**

1. **Add** only creates a **customer** (line ID + profile fields, **no** username).
2. **Assign username** → starts subscription → record appears on **Subscribers**.
3. **Stop subscriber** → remove from Subscribers, show on **Stopped**, **keep** on **Customers** (balance/history).
4. On stop: set `isSuspended = true`, clear `usernameId` (and password on API), **release username** back to **available usernames** pool (respect cooldown rules).
5. When cycle **expires or is near expiry** → UI shows them on **Customers**, **Subscribers**, and **Expiring**.
6. **Excel import/export** → **Settings** (admin), **not** these list pages.

```text
                    ┌─────────────┐
     POST /customers │  Customer   │ no usernameId
                    └──────┬──────┘
                           │ POST …/assign-username
                           ▼
                    ┌─────────────┐
                    │  Subscriber │───► /subscribers + /customers
                    │  (username) │
                    └──────┬──────┘
           disconnect soon/past
                           ▼
                    also listed on /expiring
                           │ POST …/stop
                           ▼
                    ┌─────────────┐
                    │  Stopped    │───► /stopped + /customers only
                    └─────────────┘
```

---

## 2. Shared resource: `Subscriber` (customer record)

Align with existing schema (`src/db/schema/subscribers.ts`) and extend as needed for UI fields.

### 2.1 Response shape (JSON)

```json
{
  "id": 1,
  "lineId": "W08-205",
  "speedId": 2,
  "usernameId": 12,
  "username": "0598765432PP",
  "password": "wifi205!",
  "fullName": "ليلى منصور",
  "facilityType": "محل تجاري",
  "phone": "0598765432",
  "packageLine": 8,
  "speedMbps": 8,
  "monthlyPrice": "160.00",
  "balance": "-45.00",
  "startDate": "2025-12-01T00:00:00.000Z",
  "firstContactDate": "2026-04-20",
  "disconnectionDate": "2026-05-20",
  "isActive": true,
  "isSuspended": false,
  "isOwnerUsername": false,
  "notes": null,
  "createdAt": "2026-01-12T10:00:00.000Z",
  "updatedAt": "2026-05-01T08:00:00.000Z",
  "lifecycle": "active"
}
```

| Field | Type | Notes |
|-------|------|--------|
| `id` | number | PK |
| `lineId` | string | Unique display ID e.g. `W04-101` |
| `speedId` | number | FK → `speed_tiers` |
| `usernameId` | number \| null | FK → `available_usernames`; null = customer only |
| `username` | string \| null | Denormalized for lists (from join) |
| `password` | string \| null | Only when assigned; mask in logs |
| `fullName` | string | |
| `facilityType` | string | |
| `phone` | string \| null | |
| `packageLine` | number | Legacy “line/package” tier (4, 8, 16, …) |
| `speedMbps` | number | From `speed_tiers` join |
| `monthlyPrice` | string (decimal) | |
| `balance` | string (decimal) | Negative = owes company |
| `startDate` | ISO datetime \| null | |
| `firstContactDate` | ISO date \| null | Start of current username cycle |
| `disconnectionDate` | ISO date \| null | End of 31-day cycle |
| `isActive` | boolean | |
| `isSuspended` | boolean | true = stopped (موقوف) |
| `isOwnerUsername` | boolean | Owner username (non-expiring rules) |
| `notes` | string \| null | |
| `lifecycle` | enum | **Computed** for lists: `customer` \| `active` \| `expiring` \| `stopped` |

**`lifecycle` computation (server-side recommended):**

```ts
if (isSuspended) return "stopped";
if (!usernameId) return "customer";
if (disconnectionDate && daysUntil(disconnectionDate) <= 7) return "expiring";
return "active";
```

### 2.2 Standard list response

```json
{
  "status": "success",
  "data": {
    "items": [ /* Subscriber[] */ ],
    "total": 42,
    "page": 1,
    "limit": 50
  }
}
```

### 2.3 Standard error response

```json
{
  "status": "error",
  "message": "Subscriber not found"
}
```

HTTP: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict (duplicate lineId / username already used).

---

## 3. Customers registry (`/customers` UI)

### 3.1 List customers (registry)

**`GET /api/v1/customers`**

All records for the customers table (including stopped). Subscribers-only and expiring-only are separate endpoints (below).

| Query | Type | Description |
|-------|------|-------------|
| `search` | string | Name, phone, `lineId`, username, notes |
| `kind` | `all` \| `customer` \| `subscriber` \| `stopped` | Filter by computed lifecycle |
| `speedId` | number | Optional speed tier filter |
| `page` | number | Default `1` |
| `limit` | number | Default `50` |

**Permission:** `subscribers.view`

**Frontend:** `customersService.list(params)` → `CustomersPage`

---

### 3.2 Get one customer (simple profile)

**`GET /api/v1/customers/:lineId`**

By `lineId` (e.g. `W08-205`) or internal `id` — pick one style; UI uses **`lineId` in routes**.

**Permission:** `subscribers.view`

**Frontend:** `CustomerProfilePage`

---

### 3.3 Create customer (no username)

**`POST /api/v1/customers`**

**Permission:** `subscribers.create`

**Body:**

```json
{
  "fullName": "نور صالح",
  "facilityType": "منزل",
  "phone": "0599333444",
  "speedId": 1,
  "packageLine": 4,
  "notes": "زبون جديد"
}
```

**Server must:**

- Generate unique `lineId` (`W##-###`).
- Set `usernameId = null`, `isSuspended = false`.
- Do **not** assign from username pool.

**Response:** `201` + full `Subscriber` with `lifecycle: "customer"`.

**Frontend:** `AddCustomerPage` → `POST /customers`

---

### 3.4 Update customer profile

**`PUT /api/v1/customers/:lineId`**

Editable on customer profile (and parts of subscriber profile): `fullName`, `facilityType`, `phone`, `packageLine`, `speedId`, `notes`.

**Permission:** `subscribers.update`

**Body (partial allowed):**

```json
{
  "fullName": "نور صالح",
  "facilityType": "منزل",
  "phone": "0599333444",
  "packageLine": 8,
  "notes": "ملاحظة"
}
```

**Frontend:** `CustomerProfileForm`, `SubscriberStatsTab` (overlap)

---

### 3.5 Delete customer

**`DELETE /api/v1/customers/:lineId`**

**Permission:** `subscribers.delete`

**Rules:** Reject if active subscription unless you cascade stop first (recommend: require stop or admin confirm).

**Bulk:**

- **`POST /api/v1/customers/bulk-delete`** — body `{ "ids": [1, 2, 3] }`
- **`DELETE /api/v1/customers/all`** — delete all (admin only, dangerous)

**Frontend:** `CustomersPage` confirm dialogs

---

## 4. Assign username (customer → subscriber)

**`POST /api/v1/customers/:lineId/assign-username`**

**Permission:** `subscribers.update` + `available_usernames` pool access

**Body:**

```json
{
  "usernameId": 15
}
```

**Server must (transaction):**

1. Validate customer exists, `!isSuspended`, `usernameId == null`.
2. Validate `usernameId` is in pool for customer’s `speedId`, not in cooldown (see available usernames module).
3. Set `subscribers.usernameId`, copy `username`/`password` if denormalized.
4. Set `firstContactDate` = today, `disconnectionDate` = today + 31 days (or org rule).
5. Mark username row as assigned (remove from pool / set `assignedAt`).
6. Insert `username_history` row.

**Response:** `200` + `Subscriber` with `lifecycle: "active"`.

**Frontend:** `AssignUsernameModal` on `CustomerProfilePage`

---

## 5. Active subscribers (`/subscribers` UI)

### 5.1 List active subscriptions

**`GET /api/v1/subscribers`**

`usernameId` set, `isSuspended = false` (**includes expiring** — same rows as Expiring list subset).

| Query | Type | Description |
|-------|------|-------------|
| `search` | string | Same as customers |
| `speedId` | number | Optional |
| `page`, `limit` | number | Pagination |

**Permission:** `subscribers.view`

**Frontend:** `SubscribersPage`, `SubscribersTable`

---

### 5.2 Get subscriber profile (full)

**`GET /api/v1/subscribers/:lineId`**

**404** if **stopped** or customer-only (no username). **Expiring** subscribers are allowed (same as Subscribers list).

**Include (query or always):**

- `usernameHistory[]`
- `speedHistory[]`
- `invoices[]` or link to invoices module

**Permission:** `subscribers.view`

**Frontend:** `SubscriberProfilePage` tabs

---

### 5.3 Update subscriber (full profile)

**`PUT /api/v1/subscribers/:lineId`**

Same fields as customer update plus read-only subscription fields on UI: `monthlyPrice`, `firstContactDate`, `disconnectionDate` (admin-only if editable).

**Permission:** `subscribers.update`

---

### 5.4 Stop subscriber (موقوف) — critical

**`POST /api/v1/subscribers/:lineId/stop`**

**Permission:** `subscribers.update` or `disabled.restore` inverse — use **`subscribers.update`** for stop

**Body (optional):**

```json
{
  "reason": "طلب الزبون / دين"
}
```

**Server must (transaction):**

1. Load active subscriber (`usernameId` was set).
2. Copy username/password to history if needed.
3. **Release username** to available pool (`available_usernames`): set `assignedAt` / cooldown per business rules (username still “running” until cooldown — UI message: returned to pool).
4. Set `subscribers.usernameId = null`, `password = null` (or clear).
5. Set `isSuspended = true`.
6. **Do not delete** the row — **keep** `balance`, `lineId`, profile for **Customers** page.
7. Optional: insert audit row in `stopped_subscribers` with `stoppedAt`, `stoppedReason` (snapshot only; **canonical state** stays on `subscribers`).

**Response:** `200`

```json
{
  "status": "success",
  "message": "Subscriber stopped",
  "data": {
    "lineId": "W08-205",
    "lifecycle": "stopped"
  }
}
```

**UI after stop:** Removed from `GET /subscribers`, appears in `GET /stopped` and still in `GET /customers`.

**Note:** Legacy service `stopSubscriber` deleted the row — **do not** do that for this UI.

**Frontend:** `SubscriberProfilePage` → `ConfirmDialog` → navigate `/stopped`

---

### 5.5 Change username (active subscriber)

**`POST /api/v1/subscribers/:lineId/change-username`**

**Body:**

```json
{
  "usernameId": 20
}
```

Same pool rules as assign; close previous username history segment; start new cycle dates.

**Frontend:** `SubscriberUsernameTab` (buttons today: API pending)

---

### 5.6 Delete from subscribers list

Use **`DELETE /api/v1/customers/:lineId`** (same record) or alias `DELETE /api/v1/subscribers/:lineId`.

---

## 6. Expiring (`/expiring` UI)

### 6.1 List expiring

**`GET /api/v1/subscribers/expiring`**

| Query | Type | Description |
|-------|------|-------------|
| `search` | string | Optional |
| `page`, `limit` | number | Pagination |

**Filter:** `usernameId IS NOT NULL`, `isSuspended = false`, `disconnectionDate < CURRENT_DATE`.

**Permission:** `expired.view`

**Frontend:** Expiring page (placeholder today)

---

### 6.2 Renew / extend cycle (optional)

**`POST /api/v1/subscribers/:lineId/renew`**

Reset `firstContactDate` / `disconnectionDate` after payment — product decision.

**Permission:** `expired.update`

---

## 7. Stopped (`/stopped` UI)

### 7.1 List stopped

**`GET /api/v1/subscribers/stopped`**

**Filter:** `isSuspended = true` (and `usernameId IS NULL`).

| Query | Type | Description |
|-------|------|-------------|
| `search` | string | Optional |
| `page`, `limit` | number | Pagination |

**Permission:** `disabled.view`

**Response fields for table:** `lineId`, `fullName`, `phone`, `balance`, `updatedAt` (as stopped date), link to customer profile.

**Frontend:** `StoppedPage`

---

### 7.2 Reactivate stopped customer (future)

**`POST /api/v1/subscribers/:lineId/restore`**

**Permission:** `disabled.restore`

**Body (optional):**

```json
{
  "usernameId": 15
}
```

Set `isSuspended = false`; optionally assign new username in same transaction.

**Frontend:** Stopped page “Reactivate” (mock toast today)

---

## 8. Invoices (subscriber profile tab)

Can live under subscribers module or separate `invoices` module.

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/v1/subscribers/:lineId/invoices` | List |
| `POST` | `/api/v1/subscribers/:lineId/invoices` | Add payment / invoice |
| `PUT` | `/api/v1/invoices/:id` | Update |
| `DELETE` | `/api/v1/invoices/:id` | Delete |

**Invoice shape (UI mock):**

```json
{
  "id": 1,
  "subscriberLineId": "W08-205",
  "amount": 160,
  "paidAmount": 80,
  "status": "partial",
  "paymentMethod": "cash",
  "notes": null,
  "createdAt": "2026-04-01T00:00:00.000Z",
  "paidAt": "2026-04-05T00:00:00.000Z"
}
```

`status`: `unpaid` | `partial` | `paid` | `debt`

**POST body (add invoice — UI):**

```json
{
  "amount": 160,
  "paidAmount": 80,
  "paymentMethod": "cash",
  "notes": "دفعة جزئية"
}
```

Server updates `balance` by `paidAmount - amount`.

---

## 8b. Change username (pool only — subscriber profile)

**`POST /api/v1/subscribers/:lineId/change-username`**

**Body:** `{ "usernameId": 15 }` — must reference row in **available usernames** pool for subscriber `speedId`. **No free-text username** on this endpoint.

**Server:** append old username to `username_history`; release old username to pool (cooldown); assign new; reset `firstContactDate` / `disconnectionDate`.

**Frontend:** `SubscriberUsernameTab` → `PickAvailableUsernameModal` (same picker as customer assign).

---

## 9. History endpoints

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/v1/subscribers/:lineId/username-history` | Past usernames |
| `GET` | `/api/v1/subscribers/:lineId/speed-history` | Speed changes |

---

## 10. Excel import / export (Settings — not list pages)

| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/v1/settings/import/subscribers` | Multipart xlsx — admin |
| `GET` | `/api/v1/settings/export/subscribers` | Download xlsx — admin |

**Permission:** `subscribers.import`, `subscribers.export`

---

## 11. Permissions map

| UI action | Permission |
|-----------|------------|
| View customers / subscribers lists & profiles | `subscribers.view` |
| Add customer, assign username, edit, stop | `subscribers.create`, `subscribers.update` |
| Delete | `subscribers.delete` |
| View expiring | `expired.view` |
| Renew expiring | `expired.update` |
| View stopped | `disabled.view` |
| Restore stopped | `disabled.restore` |
| Import/export Excel | `subscribers.import`, `subscribers.export` |

---

## 12. Suggested module layout (API)

```
src/modules/
  customers/
    customers.route.ts      # GET/POST /customers, GET/PUT/DELETE /:lineId, assign-username
    customers.controller.ts
    customers.service.ts
    customers.validation.ts
  subscribers/
    subscribers.route.ts    # GET /subscribers, GET/PUT /:lineId, stop, change-username
    subscribers.service.ts  # lifecycle filters, stop transaction
  subscribers-expiring/     # or subscribers/expiring.routes
  subscribers-stopped/    # GET stopped, POST restore
```

Mount example:

```ts
app.use("/api/v1/customers", customersRoute);
app.use("/api/v1/subscribers", subscribersRoute);
```

---

## 13. Frontend wiring checklist (after API exists)

| File to add | Purpose |
|-------------|---------|
| `src/services/customers.service.ts` | Registry CRUD + assign |
| `src/services/subscribers.service.ts` | Active list, profile, stop, change username |
| `src/hooks/useCustomers.ts` | TanStack Query |
| `src/hooks/useSubscribers.ts` | TanStack Query |
| Remove / stop using `mockSubscribers` in pages | |

**Stop flow call:**

```ts
await subscribersService.stop(lineId, { reason?: string });
// invalidate: customers, subscribers, stopped, available-usernames
```

---

## 14. Difference vs old `wewifi_server` / draft API service

| Topic | Old / draft | New UI contract |
|-------|-------------|-----------------|
| Stop subscriber | Delete row + copy to `stopped_subscribers` | Keep row, `isSuspended`, clear `usernameId`, release pool |
| Customers table | N/A | All records including stopped |
| Create | Could create with username | **Only** customer without username |
| Import/export | On list page | **Settings** only |

---

## 15. After stop — customer still owes money (workflow)

The **subscriber profile** (`/subscribers/:lineId`) is only for an **active** subscription. After **stop**, staff work on the **customer file** only:

| Step | Where | Action |
|------|--------|--------|
| 1 | **Customers** → open row (or **Stopped** → «ملف الزبون») | `/customers/:lineId` |
| 2 | **Balance & payments** (only if `balance < 0`) | `POST /customers/:lineId/payments` — **تسجيل دفعة**; hide this UI when debt is cleared |
| 3 | **Customer details** | `PUT /customers/:lineId` — edit name, phone, notes, facility (same form as before stop) |
| 4 | Debt cleared (`balance >= 0`) | No payment section; optional `POST /customers/:lineId/assign-username` — new subscription |

**Do not** use `/subscribers/:lineId` for a stopped account — UI redirects to customer file.

### 15.1 Record payment (proposed)

**`POST /api/v1/customers/:lineId/payments`**

**Permission:** `subscribers.update`

**Body:**

```json
{
  "amount": 200,
  "paymentMethod": "cash",
  "notes": "دفعة جزئية"
}
```

**Server:**

- Insert invoice/payment row.
- Increase `subscribers.balance` by `amount` (balance negative = owes; payment moves toward zero).
- Return updated `Subscriber` with new `balance`.

**Frontend:** `CustomerBalanceSection` on `CustomerProfilePage` (all customers; especially stopped).

### 15.2 Edit profile after stop

**`PUT /api/v1/customers/:lineId`** — unchanged; works while `isSuspended = true`.

---

## 16. Questions for product (optional)

1. On stop, if username is still in **cooldown** before returning to pool, is it immediate or after disconnect?
2. Can a **stopped** customer assign a **new** username only when `balance >= 0`? (UI assumes yes.)
3. Is `packageLine` still required or only `speedId`?

---

*Document version: 2026-05-31 — matches `network-management-front` routes `/customers`, `/subscribers`, `/expiring`, `/stopped`.*
