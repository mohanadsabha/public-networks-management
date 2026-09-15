# Monorepo Structure and Conventions

This repository contains the full stack for the network management system.

## Projects

| Path                                                 | Purpose                            |
| ---------------------------------------------------- | ---------------------------------- |
| [network-management-front](network-management-front) | React + TypeScript admin dashboard |
| [network-management-api](network-management-api)     | Express + TypeScript backend API   |
| [docker-compose.yml](docker-compose.yml)             | Local multi-container setup        |

## Application flow

```text
Browser
  ↓
Frontend (network-management-front)
  ↓
Vite proxy / API requests
  ↓
Backend (network-management-api)
  ↓
PostgreSQL + Drizzle ORM
```

## Frontend app

The frontend is a Vite React app focused on admin operations and network management workflows.

Main areas include:

- dashboard and statistics
- customers and subscribers
- finance and invoices
- speed and username management
- online users and usage tracking
- SMS and support
- router, settings, and VPN administration
- logs and permission-based access

The frontend is documented in [network-management-front/README.md](network-management-front/README.md) and [network-management-front/STRUCTURE.md](network-management-front/STRUCTURE.md).

## Backend app

The backend exposes the REST API used by the frontend and handles business logic, database access, and external system integrations.

Key responsibilities include:

- authentication and session management
- subscriber and customer endpoints
- finance and invoice APIs
- router and MikroTik integration
- VPN management
- SMS support and email flows
- PostgreSQL persistence via Drizzle ORM

The backend is documented in [network-management-api/README.md](network-management-api/README.md) and [network-management-api/STRUCTURE.md](network-management-api/STRUCTURE.md).

## Root-level conventions

The repo uses a clear separation between the two application layers:

- frontend = presentation, routing, UI interactions, permissions, charts, dashboards
- backend = API contracts, persistence, business logic, integrations, auth, and infrastructure

This keeps the system easier to reason about when working across the stack.

## Local startup

You can run the whole stack with Docker from the repo root:

```bash
docker compose up --build
```

Or run the frontend and backend separately in development mode.

## Default ports

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

## Working rules

- Keep frontend and backend docs aligned with the actual code
- Prefer feature-based organization within each app
- Keep API contracts and frontend expectations consistent
- Avoid editing backend logic from the frontend folder and vice versa

## Important note

The root README and structure files are intentionally a high-level monorepo summary. The more detailed implementation guidelines live in each service folder's docs.
