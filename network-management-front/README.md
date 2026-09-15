# Network Management Frontend

This is the frontend application for the monorepo project hosted at:
https://github.com/mohanadsabha/public-networks-management

It is a React + TypeScript admin dashboard for managing subscribers, customers, finance, speeds, support, settings, and system monitoring for an ISP / Wi-Fi network operation.

## Project overview

The app includes the following functional areas:

- Dashboard and statistics
- Customers and subscribers management
- Online users and usage tracking
- Expiring and stopped subscriptions
- Speed plans and available usernames
- SMS and support workflows
- Finance and invoices
- User, router, VPN, and system settings
- Activity logs and permission-aware admin access

## Tech stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS
- React Router
- TanStack Query
- TanStack Table
- React Hook Form
- Axios
- i18next (Arabic + English)
- Recharts, Sonner, date-fns

## Repository layout

This frontend sits inside the main repo under:

- `network-management-front/` — frontend app
- `network-management-api/` — backend API
- `docker-compose.yml` — local orchestration for frontend, backend, and Postgres

## Prerequisites

- Node.js 18+
- npm
- A running backend on `http://localhost:3000` unless you enable mock auth

## Quick start

From the repo root:

```bash
cd network-management-front
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Useful scripts

```bash
npm run dev      # start Vite dev server
npm run build    # TypeScript + production build
npm run preview  # preview production build locally
npm run lint     # ESLint check
npm run icons    # generate app icons from script
```

## Environment configuration

Create a local `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=/api/v1
VITE_SKIP_AUTH_CHECK=false
VITE_VPN_LIVE=false
VITE_WHATSAPP_GROUP_INVITE_URL=https://chat.whatsapp.com/...
VITE_WHATSAPP_GROUP_NAME=droub b
```

Notes:

- `VITE_API_BASE_URL` is proxied through Vite to the backend at `http://localhost:3000`
- `VITE_SKIP_AUTH_CHECK=true` can be used for mock or dev-only login flows
- `VITE_VPN_LIVE` controls the live VPN API calls on the settings page
- Only variables prefixed with `VITE_` are exposed to the frontend

## App architecture

```text
src/
├── app/                 # app shell, router, route guards
├── components/
│   ├── layout/          # shell layout, nav, header
│   ├── pages/           # feature-specific UI sections
│   └── ui/              # reusable UI primitives / design system
├── hooks/               # TanStack Query hooks and data access logic
├── lib/                 # helpers, i18n, permissions, API utilities
├── locales/             # Arabic and English translation files
├── pages/               # route-level pages
├── providers/           # auth, theme, query provider composition
├── services/            # API service modules
├── styles/              # Tailwind tokens and global CSS
├── store/               # reserved for future state management
├── types/               # shared TypeScript types
├── main.tsx             # app bootstrap
├── vite-env.d.ts        # Vite types
├── app/router.tsx       # route definitions and permission checks
└── app/App.tsx          # app root with router setup
```

## Route and permission model

The project uses route-level protection and permission checks in `src/app/router.tsx`.

Common patterns:

- `GuestRoute` for login / reset flows
- `ProtectedRoute` for logged-in users
- `RequirePermission` for feature access control
- role-aware sections such as admin-only pages and view-only pages

## Frontend conventions

A few conventions are important in this project:

- Keep page files under `src/pages/` thin and route-oriented
- Place feature UI sections under `src/components/pages/<feature>/`
- Keep HTTP requests inside `src/services/`
- Combine services with query/mutation logic in `src/hooks/`
- Prefer the design-system components in `src/components/ui/`
- Use translations from `src/locales/ar.ts` and `src/locales/en.ts`
- Use `@/` path aliases defined in `vite.config.ts`

## Main feature folders

The app is organized by business domain rather than by generic UI type:

- `customers`
- `subscribers`
- `finance`
- `online-users`
- `speeds`
- `available-usernames`
- `sms`
- `settings`
- `users`
- `support`
- `statistics`
- `activity-logs`

## Docker and local stack

The repo root includes a Docker Compose setup that starts the app stack together:

```bash
docker compose up --build
```

This project expects the frontend and backend to work together in the same monorepo environment.

## Notes

- The frontend is intentionally separated from backend logic and should not modify API server code directly
- The app uses cookie-based auth and a Vite proxy for API calls
- Most documentation for backend contracts is stored in the repo docs and server-side code

For the project structure rules and module conventions, see [STRUCTURE.md](./STRUCTURE.md).
