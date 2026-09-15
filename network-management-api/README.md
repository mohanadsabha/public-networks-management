# Network Management API

This is the backend service for the public networks management monorepo.

It provides the REST API used by the frontend dashboard and supports subscriber, customer, finance, router, VPN, SMS, user, statistics, and system management features.

## Repository context

The project is split into:

- `network-management-api/` — Express + TypeScript backend
- `network-management-front/` — Vite React client
- `docker-compose.yml` — local stack orchestration for frontend, backend, and Postgres

## Tech stack

- Node.js + TypeScript
- Express 5
- PostgreSQL + Drizzle ORM
- JWT auth with cookies
- bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email delivery
- Cloudinary for media handling
- OpenVPN / MikroTik / router management integrations
- Zod validation
- Winston logging

## Quick start

From the repo root:

```bash
cd network-management-api
npm install
npm run dev
```

The API listens on:

```text
http://localhost:3000
```

## Useful scripts

```bash
npm run dev                # start in watch mode with tsx
npm run build              # compile TypeScript
npm run start              # migrate, push schema, seed, then run built server
npm run migrate            # run Drizzle migrations
npm run migrate:generate   # generate migration files
npm run migrate:push       # push schema to database
npm run seed               # run seeders
npm run samples:excel      # generate Excel sample data
npm run sms:test           # test SMS connectivity
```

## Environment configuration

Create a local `.env` file based on the project setup used by the repo. At minimum, the backend expects its database and feature configuration values.

Typical environment values include:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/public_networks
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:5173
```

The repo also includes a `.env.example` for SMS configuration:

```env
TWEETSMS_USER=
TWEETSMS_PASSWORD=
TWEETSMS_API_KEY=
SMS_SENDER=WeNet
```

## Health check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## API structure

The app mounts the following route groups under `/api/v1`:

```text
/api/v1/auth
/api/v1/users
/api/v1/speeds
/api/v1/support
/api/v1/subscribers
/api/v1/customers
/api/v1/sms
/api/v1/activity-logs
/api/v1/invoices
/api/v1/mikrotik
/api/v1/statistics
/api/v1/finance
/api/v1/routers
/api/v1/vpn
```

## Authentication and security

The API uses:

- JWT-based auth
- cookie-based session handling
- CORS and Helmet security middleware
- compression and request sanitization
- route protection middleware for authenticated endpoints

Auth flows include:

- login
- logout
- me / session restore
- forgot password
- reset password
- change password

## Core app behavior

The server boot process does several important things:

- initializes the database connection
- starts optional VPN management if enabled
- starts background usage sync jobs
- mounts all API routes
- registers a global error handler
- exposes a health endpoint

## Database layer

The project uses Postgres with Drizzle ORM.

Relevant database folders:

- `src/db/schema/` — table definitions
- `src/db/migrations/` — generated migrations
- `src/db/seed/` — seed scripts
- `src/db/scripts/` — one-off tooling tasks

## Module layout

The backend is organized by domain modules under `src/modules/`:

- `auth/`
- `users/`
- `speeds/`
- `support/`
- `subscribers/`
- `customers/`
- `sms/`
- `activityLogs/`
- `invoices/`
- `mikrotik/`
- `statistics/`
- `finance/`
- `routers/`
- `vpn/`

Each module usually contains route/controller/service logic in a consistent Express-style pattern.

## Notes

- The app includes optional VPN and MikroTik integrations, so some features depend on external infrastructure.
- Usage sync and router-related processes are started automatically on boot.
- The backend should be treated as the source of truth for API contracts and persistence.

For structure and contribution conventions, see [STRUCTURE.md](./STRUCTURE.md).
