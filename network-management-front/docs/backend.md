# Backend API — Pages built in UI (Finance, Customers, Subscribers, Expiring, Stopped)

> **For:** Mohanad / `network-management-api`  
> **From:** `network-management-front` (implemented with mocks; ready to wire)  
> **Base URL:** `/api/v1`  
> **Auth:** `Authorization: Bearer <JWT>` on all routes below (`protect`).  
> **Writes:** `restrictTo("admin")` unless your roles module says otherwise.

**Related doc (field types, DB notes):** [`CUSTOMERS_SUBSCRIBERS_API.md`](./CUSTOMERS_SUBSCRIBERS_API.md)

---

## Quick map — UI page → HTTP requests

| UI route | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| **Finance** `/finance` | `GET` | `/finance/stats` | KPIs + charts data |
| | `GET` | `/finance/debtors` | ديون متراكمة — who owes money |
| **Customers** `/customers` | `GET` | `/customers` | Registry list (all kinds) |
| | `POST` | `/customers/bulk-delete` | Delete selected |
| | `DELETE` | `/customers/all` | Delete all (admin) |
| **Add customer** `/customers/new` | `POST` | `/customers` | Create customer (no username) |
| **Customer profile** `/customers/:lineId` | `GET` | `/customers/:lineId` | Profile |
| | `PUT` | `/customers/:lineId` | Update profile |
| | `GET` | `/customers/:lineId/invoices` | Invoice history |
| | `POST` | `/customers/:lineId/payments` | تسجيل دفعة (if `balance < 0`) |
| | `POST` | `/customers/:lineId/assign-username` | Assign from pool / restore stopped |
| | `DELETE` | `/customers/:lineId` | Delete one |
| **Subscribers** `/subscribers` | `GET` | `/subscribers` | Has username, not stopped (includes **expiring**) |
| | `POST` | `/subscribers/bulk-delete` | Delete selected |
| | `DELETE` | `/subscribers/all` | Delete all (admin) |
| **Subscriber profile** `/subscribers/:lineId` | `GET` | `/subscribers/:lineId` | Profile + stats |
| | `PUT` | `/subscribers/:lineId` | Update profile fields |
| | `GET` | `/subscribers/:lineId/invoices` | Invoices tab |
| | `POST` | `/subscribers/:lineId/invoices` | إضافة فاتورة |
| | `POST` | `/subscribers/:lineId/stop` | إيقاف → Stopped |
| | `POST` | `/subscribers/:lineId/change-username` | Change username (pool only) |
| | `GET` | `/subscribers/:lineId/username-history` | Username tab |
| | `GET` | `/subscribers/:lineId/speed-history` | Username tab |
| | `DELETE` | `/subscribers/:lineId` | Delete (alias of customer delete) |
| **Expiring** `/expiring` | `GET` | `/subscribers/expiring` | Expired + expiring within 7 days |
| **Stopped** `/stopped` | `GET` | `/subscribers/stopped` | موقوفون list |
| **Shared (modals)** | `GET` | `/available-usernames/pool` | Pick username for assign / change *(or existing usernames module)* |

---

## Global conventions

### Response envelope (prefer this across new routes)

```json
{
  "status": "success",
  "data": { }
}
```

```json
{
  "status": "error",
  "message": "Human-readable message"
}
```

Legacy `wewifi_server` uses `success: true` — either is fine if consistent per module.

### Pagination (list endpoints)

| Query | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `50` | Page size |

```json
{
  "status": "success",
  "data": {
    "items": [],
    "total": 120,
    "page": 1,
    "limit": 50
  }
}
```

### Shared person record (`Subscriber` / customer)

One table (`subscribers`). UI splits by **lifecycle** — see [`CUSTOMERS_SUBSCRIBERS_API.md` §1–2](./CUSTOMERS_SUBSCRIBERS_API.md) for full JSON fields.

### Which pages show each record

| State | Customers | Subscribers | Expiring | Stopped |
|-------|:---------:|:-----------:|:--------:|:-------:|
| Customer only (no username) | ✓ | — | — | — |
| **Expiring** (username, cycle ended or ≤7 days) | ✓ | ✓ | ✓ | — |
| **Active** (username, not expiring window) | ✓ | ✓ | — | — |
| **Stopped** (موقوف, no username) | ✓ | — | — | ✓ |

**Stopped** never appears on Subscribers or Expiring. **Expiring** stays on Subscribers and Customers **and** has its own Expiring list.

| `lifecycle` (computed) | Meaning |
|------------------------|---------|
| `customer` | No username |
| `active` | Username, not stopped, not in expiring window |
| `expiring` | Username, not stopped, disconnect ≤7 days or past |
| `stopped` | `isSuspended`, username cleared |

**Balance:** negative = owes company (`balance < 0`). UI shows **تسجيل دفعة** until `balance >= 0`.

### Payment method (required on invoice + payment forms)

| Value | Arabic label |
|-------|----------------|
| `cash` | نقدي |
| `transfer` | تحويل |
| `credit` | رصيد |

---

## 1. Finance — `/finance`

**Permission:** `finance.view` (or `dashboard.view`)

### 1.1 `GET /api/v1/finance/stats`

Powers KPI cards and charts. Port logic from legacy `GET /api/subscribers/financial-stats` (`wewifi_server`).

**Query (optional):**

| Param | Type | Description |
|-------|------|-------------|
| `month` | `YYYY-MM` | Report month (default: current month) |

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "monthly": { "revenue": 395.0, "count": 3 },
    "weekly": { "revenue": 160.0, "count": 1 },
    "newThisMonth": { "revenue": 530.0, "count": 4 },
    "allTimePaid": { "revenue": 12000.0, "count": 85 },
    "debt": { "revenue": 320.0, "count": 5 },
    "revenueBySpeed": [
      { "label": "8 Mbps", "speed": 8, "revenue": 160.0, "count": 2 }
    ],
    "monthlyTrend": [
      { "month": "2026-04", "revenue": 200.0, "count": 2 },
      { "month": "2026-05", "revenue": 395.0, "count": 3 }
    ],
    "topSubscribers": [
      {
        "lineId": "W08-205",
        "fullName": "ليلى منصور",
        "username": "0598765432PP",
        "monthlyPrice": 160,
        "speedMbps": 8,
        "totalPaid": 320,
        "invoiceCount": 2
      }
    ],
    "byMethod": [
      { "method": "cash", "total": 235.0, "count": 2 },
      { "method": "transfer", "total": 160.0, "count": 1 }
    ]
  }
}
```

**Field rules:**

| Field | SQL / logic |
|-------|-------------|
| `monthly` | `SUM(paid_amount)` where `paid_at` in selected month, status `paid` or `partial` |
| `weekly` | Same; week starts **Saturday** (legacy) |
| `newThisMonth` | Invoices **created** this month: `SUM(amount)`, `COUNT(*)` |
| `allTimePaid` | All paid/partial invoices |
| `debt` | `SUM(amount - paid_amount)` where status in `debt`, `partial`, `unpaid` |
| `revenueBySpeed` | Paid invoices → subscriber → speed tier (this month or all-time — product choice; UI uses month context in subtitle) |
| `monthlyTrend` | Last **12** months paid revenue; fill missing months with `0` |
| `topSubscribers` | Top **10** by `SUM(paid_amount)` |
| `byMethod` | `GROUP BY payment_method` on paid invoices |

**Note:** UI does **not** show stopped count or average invoice on Finance page anymore.

---

### 1.2 `GET /api/v1/finance/debtors`

Powers **ديون متراكمة** table (customers who owe money).

**Query (optional):**

| Param | Type |
|-------|------|
| `search` | string — name, `lineId`, phone, username |
| `page`, `limit` | pagination |

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "totalOwed": 275.0,
    "count": 3,
    "items": [
      {
        "id": 5,
        "lineId": "W32-017",
        "fullName": "يوسف درويش",
        "phone": "0599444555",
        "balance": "-200.00",
        "amountOwed": 200.0,
        "kind": "stopped",
        "speedMbps": 32,
        "facilityType": "منزل"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 50
  }
}
```

**Rules:**

- `items`: all rows where `balance < 0` (active, stopped, or customer-only).
- `amountOwed = ABS(balance)`.
- Sort: most owed first (`balance` ascending).
- `kind`: `customer` \| `subscriber` \| `stopped` (computed — same as Customers registry).

**UI action:** row link → `GET /customers/:lineId` → `POST …/payments`.

---

## 2. Customers — `/customers`

**Permissions:** `subscribers.view` | `subscribers.create` | `subscribers.update` | `subscribers.delete`

### 2.1 `GET /api/v1/customers`

Registry — **everyone**, including stopped (may still owe money).

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Name, phone, lineId, username, notes |
| `kind` | `all` \| `customer` \| `subscriber` \| `stopped` | Lifecycle filter |
| `speedMbps` or `speedId` | number | Speed filter |
| `page`, `limit` | number | Pagination |

**Response:** paginated list of person records (see shared shape in CUSTOMERS doc).

**UI:** `CustomersPage`, `CustomersTable`

---

### 2.2 `POST /api/v1/customers`

Create **customer only** — no username.

**Permission:** `subscribers.create`

**Request body:**

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

**Server:**

- Generate unique `lineId` (e.g. `W04-088`).
- `usernameId = null`, `isSuspended = false`, `balance = 0`.

**Response:** `201` + full record, `lifecycle: "customer"`.

**UI:** `AddCustomerPage`

---

### 2.3 `GET /api/v1/customers/:lineId`

**Permission:** `subscribers.view`

**Response:** single person record (stopped included).

**UI:** `CustomerProfilePage`

---

### 2.4 `PUT /api/v1/customers/:lineId`

Update profile. Allowed for **stopped** customers.

**Permission:** `subscribers.update`

**Request body (partial OK):**

```json
{
  "fullName": "نور صالح",
  "facilityType": "منزل",
  "phone": "0599333444",
  "packageLine": 8,
  "speedId": 2,
  "notes": "ملاحظة"
}
```

**UI:** `CustomerProfileForm`

---

### 2.5 `DELETE /api/v1/customers/:lineId`

**Permission:** `subscribers.delete`

**Rules:** Prefer reject if active subscription unless admin forces stop first.

**UI:** `CustomersPage` delete row dialog

---

### 2.6 `POST /api/v1/customers/bulk-delete`

**Permission:** `subscribers.delete`

**Request body:**

```json
{
  "ids": [1, 2, 5]
}
```

**UI:** `CustomersPage` bulk delete

---

### 2.7 `DELETE /api/v1/customers/all`

**Permission:** `subscribers.delete` (admin only)

**UI:** `CustomersPage` delete all

---

### 2.8 `GET /api/v1/customers/:lineId/invoices`

Invoice history for balance section (read-only table on profile).

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "subscriberLineId": "W04-101",
      "amount": 120,
      "paidAmount": 75,
      "status": "partial",
      "paymentMethod": "cash",
      "notes": null,
      "createdAt": "2026-04-10T00:00:00.000Z",
      "paidAt": "2026-04-12T00:00:00.000Z"
    }
  ]
}
```

`status`: `unpaid` | `partial` | `paid` | `debt`

**UI:** `CustomerBalanceSection` → `SubscriberInvoicesTab` (read-only)

---

### 2.9 `POST /api/v1/customers/:lineId/payments`

**تسجيل دفعة** — UI shows only when `balance < 0`.

**Permission:** `subscribers.update`

**Request body:**

```json
{
  "amount": 120.0,
  "paymentMethod": "cash",
  "notes": "دفعة نقدية"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `amount` | yes | `> 0` |
| `paymentMethod` | yes | `cash` \| `transfer` \| `credit` |
| `notes` | no | |

**Server:**

- `balance += amount` (toward zero).
- Optionally create/update invoice rows; set `paid_at` when fully paid.

**Response:**

```json
{
  "status": "success",
  "data": {
    "balance": "-25.00",
    "lineId": "W04-101"
  }
}
```

**UI:** `CustomerBalanceSection` payment modal

**Post-stop flow:** when `balance >= 0` on stopped customer, UI shows assign username (§2.10).

---

### 2.10 `POST /api/v1/customers/:lineId/assign-username`

Assign username from **pool only** — starts subscription OR **restores stopped** customer.

**Permission:** `subscribers.update`

**When allowed:**

- Customer has **no** username, **or** `isSuspended === true` (stopped).
- `balance >= 0` (no debt).

**Request body:**

```json
{
  "usernameId": 15,
  "password": "wifi205!"
}
```

| Field | Notes |
|-------|-------|
| `usernameId` | FK → available usernames pool row |
| `password` | Optional if stored on pool row; UI sends both from picker |

**Server (transaction):**

1. Validate pool row matches customer `speedId` / package rules.
2. Set `usernameId`, denormalized `username`, `password`.
3. `isSuspended = false`.
4. `firstContactDate = today`, `disconnectionDate = today + 31 days` (or org rule).
5. Remove username from pool / start cooldown on release rules.
6. Insert `username_history` if replacing.

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "lineId": "W32-017",
    "username": "0599444555PP",
    "isSuspended": false,
    "firstContactDate": "2026-05-31",
    "disconnectionDate": "2026-06-30",
    "lifecycle": "active"
  }
}
```

**Errors:**

| HTTP | When |
|------|------|
| `400` | `balance < 0` |
| `400` | Username not in pool / wrong speed |
| `409` | Already active subscriber |

**UI:**

- New customer: assign section on profile.
- Stopped + debt cleared: assign → redirect to `/subscribers/:lineId`.

---

## 3. Subscribers — `/subscribers`

Anyone with a username who is **not stopped** — includes subscriptions in the **expiring** window (they also appear on `/expiring` and `/customers`).

**Not included:** stopped (→ `/stopped` + `/customers` only), customer-only (no username).

### 3.1 `GET /api/v1/subscribers`

**Query:**

| Param | Type |
|-------|------|
| `search` | string |
| `speedMbps` or `speedId` | number |
| `page`, `limit` | number |

**Filter (server):** `username_id IS NOT NULL` AND `is_suspended = false` (includes expiring rows).

**UI:** `SubscribersPage`, `SubscribersTable`

---

### 3.2 `POST /api/v1/subscribers/bulk-delete`

Same as `POST /customers/bulk-delete` (same IDs).

**UI:** `SubscribersPage`

---

### 3.3 `DELETE /api/v1/subscribers/all`

**UI:** `SubscribersPage` delete all

---

### 3.4 `GET /api/v1/subscribers/:lineId`

Full profile for active subscriber.

**Response:** person record + optional embedded:

- `invoices[]`
- `usernameHistory[]`
- `speedHistory[]`

Or use separate GETs below.

**UI:** `SubscriberProfilePage` — stats tab

**Note:** If record is **stopped**, UI redirects to `/customers` or `/stopped` (not on Subscribers). **Expiring** records stay on this profile — no redirect.

---

### 3.5 `PUT /api/v1/subscribers/:lineId`

Same editable fields as `PUT /customers/:lineId`.

**UI:** subscriber profile edit / stats

---

### 3.6 `DELETE /api/v1/subscribers/:lineId`

Alias for `DELETE /customers/:lineId`.

---

### 3.7 `GET /api/v1/subscribers/:lineId/invoices`

Same as customer invoices endpoint (by `lineId`).

**UI:** Invoices tab

---

### 3.8 `POST /api/v1/subscribers/:lineId/invoices`

**إضافة فاتورة**

**Permission:** `subscribers.update`

**Request body:**

```json
{
  "amount": 160.0,
  "paidAmount": 80.0,
  "paymentMethod": "cash",
  "notes": "دفعة جزئية"
}
```

| Field | Required |
|-------|----------|
| `amount` | yes, `> 0` |
| `paidAmount` | no, default `0` |
| `paymentMethod` | **yes** |
| `notes` | no |

**Server:**

- Compute `status`: `unpaid` \| `partial` \| `paid`.
- `balance += paidAmount - amount`.

**Response:** `201` + invoice row + updated `balance`.

**UI:** `InvoiceFormModal` on subscriber profile

---

### 3.9 `POST /api/v1/subscribers/:lineId/stop`

**إيقاف المشترك (موقوف)**

**Permission:** `subscribers.update`

**Request body (optional):**

```json
{
  "reason": "طلب الزبون"
}
```

**Server (transaction):**

1. Require active subscription (`usernameId` set).
2. Release username to **available usernames** pool (cooldown rules).
3. Clear `usernameId`, `username`, `password`.
4. `isSuspended = true`.
5. **Keep row** — balance, invoices, `lineId` unchanged.
6. **Do not delete** the record (legacy `stopSubscriber` deleted — **do not**).

**Response:**

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

**UI:** `ConfirmDialog` → navigate `/stopped`

**After stop:** row disappears from `GET /subscribers` and `GET /subscribers/expiring`; remains on `GET /customers` and `GET /subscribers/stopped`.

---

### 3.10 `POST /api/v1/subscribers/:lineId/change-username`

**Permission:** `subscribers.update`

**Request body:**

```json
{
  "usernameId": 20,
  "password": "newPass99"
}
```

- Must be from pool for subscriber’s speed.
- Close previous segment in `username_history`.
- Reset cycle dates.

**UI:** `PickAvailableUsernameModal` on username tab

---

### 3.11 `GET /api/v1/subscribers/:lineId/username-history`

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "subscriberLineId": "W04-101",
      "oldUsername": "0599000111PP",
      "oldPassword": "old101",
      "usageStartDate": "2026-01-01",
      "usageEndDate": "2026-04-20",
      "changedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

**UI:** `SubscriberUsernameTab`

---

### 3.12 `GET /api/v1/subscribers/:lineId/speed-history`

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "subscriberLineId": "W08-205",
      "oldSpeedMbps": 4,
      "newSpeedMbps": 8,
      "usageStartDate": "2025-12-01",
      "usageEndDate": "2026-02-01",
      "daysUsed": 62,
      "changedAt": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

**UI:** `SubscriberUsernameTab`

---

## 4. Expiring — `/expiring`

Subscriptions with username, not stopped, not owner username, cycle ended **or** ends within **7 days**.

### 4.1 `GET /api/v1/subscribers/expiring`

**Permission:** `expired.view`

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Name, lineId, username, phone |
| `urgency` | see table below | Filter bucket |
| `speedMbps` or `speedId` | number | Optional |
| `page`, `limit` | number | Pagination |

**Urgency filter (`daysLeft` = calendar days until `disconnectionDate`):**

| `urgency` | Rule |
|-----------|------|
| `all` | `daysLeft <= 7` (includes expired) |
| `expired` | `daysLeft < 0` |
| `oneDay` | `daysLeft` is `0` or `1` |
| `twoDays` | `daysLeft === 2` |
| `soon` | `3 <= daysLeft <= 7` |

**Base SQL filter:**

- `username_id IS NOT NULL`
- `is_suspended = false`
- `is_owner_username = false`
- `disconnection_date <= CURRENT_DATE + 7 days`

**Response item:**

```json
{
  "lineId": "W16-221",
  "fullName": "رانيا قاسم",
  "username": "0599666777PP",
  "phone": "0599666777",
  "disconnectionDate": "2026-05-25",
  "daysLeft": -5,
  "urgency": "expired",
  "monthlyPrice": 250,
  "speedMbps": 16,
  "facilityType": "مؤسسة تعليمية"
}
```

**UI:** `ExpiringPage`, `ExpiringTable` → link `/subscribers/:lineId` (same profile as Subscribers list)

---

### 4.2 `POST /api/v1/subscribers/:lineId/renew` *(optional, later)*

Extend cycle after payment. **Permission:** `expired.update`. Not wired in UI yet.

---

## 5. Stopped — `/stopped`

### 5.1 `GET /api/v1/subscribers/stopped`

**Permission:** `disabled.view`

**Query:** `search`, `page`, `limit`

**Filter:** `is_suspended = true` AND `username_id IS NULL`

**Response item:**

```json
{
  "lineId": "W32-017",
  "fullName": "يوسف درويش",
  "phone": "0599444555",
  "balance": "-200.00",
  "facilityType": "منزل",
  "speedMbps": 32,
  "stoppedAt": "2026-05-30T12:00:00.000Z",
  "updatedAt": "2026-05-30T12:00:00.000Z"
}
```

Use `updatedAt` or dedicated `stoppedAt` for “تاريخ الإيقاف” column.

**UI:** `StoppedPage`, `StoppedTable` → link `/customers/:lineId`

---

### 5.2 Restore after stop

No separate “restore” button on Stopped page. Flow:

1. Open customer profile (`GET /customers/:lineId`).
2. If debt: `POST /customers/:lineId/payments` until `balance >= 0`.
3. `POST /customers/:lineId/assign-username` → back to Subscribers.

Optional alias: `POST /api/v1/subscribers/:lineId/restore` — same body as assign-username.

---

## 6. Available usernames pool (assign / change username modals)

UI picks from pool filtered by `speedMbps` + `packageLine` — **no free-text username**.

Use your existing **Available usernames** module, or expose:

### `GET /api/v1/available-usernames/pool`

**Query:**

| Param | Type |
|-------|------|
| `speedId` or `speedMbps` | number |
| `packageLine` | number |
| `excludeUsername` | string | Current username on change-username |

**Response:** list of `{ id, username, password, status }` — only rows assignable (not in cooldown / not expired pool state).

**UI:** `PickAvailableUsernameModal`, `AssignUsernameModal`

---

## 7. Permissions summary

| UI page / action | Permission |
|------------------|------------|
| Finance view | `finance.view` |
| Customers list / profile | `subscribers.view` |
| Add customer | `subscribers.create` |
| Edit / pay / assign | `subscribers.update` |
| Delete customers | `subscribers.delete` |
| Subscribers list / profile | `subscribers.view` |
| Add invoice / stop / change username | `subscribers.update` |
| Expiring list | `expired.view` |
| Stopped list | `disabled.view` |
| Restore (assign after stop) | `subscribers.update` (+ pool access) |

---

## 8. Implementation checklist (Mohanad)

### Finance
- [ ] `GET /finance/stats`
- [ ] `GET /finance/debtors`

### Customers
- [ ] `GET /customers` (kind filter)
- [ ] `POST /customers`
- [ ] `GET /customers/:lineId`
- [ ] `PUT /customers/:lineId`
- [ ] `DELETE /customers/:lineId`
- [ ] `POST /customers/bulk-delete`
- [ ] `DELETE /customers/all`
- [ ] `GET /customers/:lineId/invoices`
- [ ] `POST /customers/:lineId/payments` (required `paymentMethod`)
- [ ] `POST /customers/:lineId/assign-username`

### Subscribers
- [ ] `GET /subscribers` (active only)
- [ ] `GET /subscribers/:lineId`
- [ ] `PUT /subscribers/:lineId`
- [ ] `GET /subscribers/:lineId/invoices`
- [ ] `POST /subscribers/:lineId/invoices`
- [ ] `POST /subscribers/:lineId/stop` (keep row, release username)
- [ ] `POST /subscribers/:lineId/change-username`
- [ ] `GET /subscribers/:lineId/username-history`
- [ ] `GET /subscribers/:lineId/speed-history`
- [ ] Bulk delete / delete all (optional aliases)

### Expiring & Stopped
- [ ] `GET /subscribers/expiring` (`urgency` query)
- [ ] `GET /subscribers/stopped`

### Front wiring (next)

| Service file | Endpoints |
|--------------|-----------|
| `finance.service.ts` | stats, debtors |
| `customers.service.ts` | §2 |
| `subscribers.service.ts` | §3–5 |

---

## 9. Lifecycle diagram

```text
POST /customers          →  customer (no username)     →  Customers only

POST …/assign-username   →  subscriber                 →  Customers + Subscribers

disconnect near/past     →  expiring (same row)        →  Customers + Subscribers + GET /expiring

POST …/stop              →  stopped (username cleared) →  Customers + Stopped ONLY
                           (removed from Subscribers + Expiring)

POST …/payments + assign →  subscriber again           →  Customers + Subscribers
```

---

*Last updated: Finance debtors section, Expiring urgency filters, Stopped restore via customer assign.*
