# Network Management API — Structure and Conventions

This document describes the organization of the backend application and the conventions used when adding or modifying modules.

## 1. Project overview

The backend is the API layer of the monorepo project. It handles:

- authentication and authorization
- subscription and customer management
- finance and invoices
- speeds and username allocation
- router and VPN integration
- messaging and support flow
- statistics and activity logging
- database persistence and seeding

## 2. Top-level structure

```text
network-management-api/
├── .env
├── .env.example
├── .gitignore
├── .prettierrc
├── Dockerfile
├── cred.ovpn
├── package.json
├── tsconfig.json
├── README.md
├── STRUCTURE.md
├── dist/
├── node_modules/
├── src/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── modules/
│   ├── templates/
│   ├── types/
│   ├── utils/
│   ├── drizzle.config.ts
│   ├── index.ts
│   └── ...
└── package-lock.json
```

## 3. Source structure

```text
src/
├── config/
│   ├── cloudinary.ts
│   ├── db.ts
│   ├── mikrotikEnabled.ts
│   └── multer.ts
├── db/
│   ├── migrations/
│   ├── schema/
│   ├── scripts/
│   └── seed/
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── logger.middleware.ts
│   └── ...
├── modules/
│   ├── activityLogs/
│   ├── auth/
│   ├── customers/
│   ├── finance/
│   ├── invoices/
│   ├── mikrotik/
│   ├── routers/
│   ├── sms/
│   ├── speeds/
│   ├── statistics/
│   ├── subscribers/
│   ├── support/
│   ├── usernames/
│   ├── users/
│   └── vpn/
├── templates/
│   ├── contactForm.pug
│   ├── resetPassword.pug
│   └── verifyEmail.pug
├── types/
│   ├── environment.d.ts
│   ├── node-openvpn.d.ts
│   └── request.d.ts
├── utils/
│   ├── activityLogDetails.util.ts
│   ├── appError.ts
│   ├── authCookie.util.ts
│   ├── disconnectDate.util.ts
│   ├── email.ts
│   ├── excelCell.util.ts
│   ├── jwt.util.ts
│   ├── multer.util.ts
│   ├── responses.util.ts
│   ├── routerPort.util.ts
│   └── zod.util.ts
├── drizzle.config.ts
├── index.ts
└── ...
```

## 4. Main application boot

The server starts from `src/index.ts`.

It is responsible for:

- loading environment variables
- initializing the DB connection
- enabling optional VPN support
- starting background usage sync jobs
- mounting all API routes
- registering global error handling
- exposing the health endpoint on `/health`

## 5. Module pattern

The backend follows a domain-based folder structure under `src/modules/`.

Each feature module typically includes a route file and supporting logic, such as:

- controller
- service
- validation or schema
- helper utilities
- route definitions

Example module layout:

```text
src/modules/auth/
├── auth.controller.ts
├── auth.route.ts
├── auth.service.ts
├── auth.util.ts
├── auth.validation.ts
└── ...
```

While the exact file names vary by feature, the pattern is consistent: feature-specific logic should stay inside the feature module rather than being spread across the app root.

## 6. HTTP layer

Routes are mounted centrally in `src/index.ts`.

Current top-level route groups include:

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

This is a good reference point when adding new endpoints or feature modules.

## 7. Database and ORM

This project uses PostgreSQL with Drizzle ORM.

Key database files:

- `src/config/db.ts` — DB initialization and access
- `src/db/schema/` — schema definitions
- `src/db/migrations/` — generated migrations
- `src/db/seed/` — seed scripts

When making database changes:

1. update the schema
2. generate migration files via Drizzle
3. run migrations or push the schema as needed
4. update any dependent service logic or API contract

## 8. Middleware and request lifecycle

Middleware lives under `src/middleware/` and handles cross-cutting concerns such as:

- auth and route protection
- error handling
- request logging / activity tracking
- security and response shaping

Important middleware includes:

- `auth.middleware.ts`
- `error.middleware.ts`
- `logger.middleware.ts`

## 9. Utilities and shared support code

The `src/utils/` folder contains shared helper logic used across features, including:

- JWT token helpers
- response formatting
- email sending
- Excel formatting helpers
- auth cookie handling
- router-related utilities
- activity log detail generation

Keep helpers generic and reusable. Feature-specific logic should live inside the relevant module rather than inside shared utilities unless it is truly cross-cutting.

## 10. Configuration and environment

The application relies on environment variables for runtime behavior, including:

- database connection
- JWT configuration
- email / SMS settings
- router / VPN support
- file upload configuration

The API also includes environment-sensitive behavior for:

- VPN state
- MikroTik integration
- usage sync tasks
- external service APIs

## 11. Conventions for working in the backend

### Keep modules domain-based

Group work by business domain rather than by generic type. For example:

- `customers`
- `subscribers`
- `finance`
- `sms`
- `vpn`

This is better than scattering operations across root-level files.

### Keep controllers thin

Controllers should route requests and delegate logic. The real business logic belongs in service modules or utilities.

### Keep service logic reusable

If logic is used across multiple routes, move it to a service or utility rather than duplicating it inside route handlers.

### Keep validation explicit

Use strict validation for payloads and route data with the project’s validation tooling.

### Keep errors consistent

Use the shared error middleware and response helpers so the API returns consistent error payloads and statuses.

## 12. Important operational behavior

This server is not a “simple CRUD API.” It also integrates with external systems:

- PostgreSQL database
- OpenVPN manager
- MikroTik devices
- SMS provider APIs
- email delivery tools
- Cloudinary uploads

That means when debugging, check both application-level errors and downstream infrastructure integrations.

## 13. Final rule

The backend should remain organized around feature domains and shared infrastructure. The most important structural separation is:

- `config` = runtime configuration and connection setup
- `modules` = business feature implementation
- `db` = data access and migrations
- `middleware` = cross-cutting HTTP concerns
- `utils` = reusable helpers

This separation keeps the API maintainable as the project grows.
