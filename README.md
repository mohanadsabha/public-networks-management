# Public Networks Management

This monorepo contains the full stack for the network management platform used to manage subscribers, customers, speeds, finance, routing, support, and monitoring.

## Repository structure

```text
public-networks-management/
├── docker-compose.yml
├── README.md
├── STRUCTURE.md
├── package-lock.json
├── network-management-front/
│   ├── README.md
│   ├── STRUCTURE.md
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── ...
├── network-management-api/
│   ├── README.md
│   ├── STRUCTURE.md
│   ├── package.json
│   ├── src/
│   └── ...
└── .gitignore
```

## Projects in this repo

### Frontend

Location: `network-management-front/`

- React + TypeScript + Vite
- Admin dashboard for ISP / Wi-Fi operations
- Role-aware access, statistics, subscriber tools, settings, finance, support, and more

### Backend

Location: `network-management-api/`

- Express + TypeScript API server
- PostgreSQL with Drizzle ORM
- Auth, billing, routers, SMS, VPN, subscriber logic, and monitoring features

## Local development

From the repo root:

```bash
docker compose up --build
```

This launches the app stack defined in `docker-compose.yml`.

For manual development, run each app individually:

```bash
cd network-management-front
npm install
npm run dev
```

```bash
cd network-management-api
npm install
npm run dev
```

## Default URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Backend health check: http://localhost:3000/health

## Environment notes

- Frontend uses `VITE_` environment variables
- Backend uses its own `.env` config for database, JWT, email, SMS, and service integrations
- The Vite frontend proxies API requests to the backend via `/api`

## Docs

- Frontend docs: [network-management-front/README.md](network-management-front/README.md)
- Frontend structure: [network-management-front/STRUCTURE.md](network-management-front/STRUCTURE.md)
- Backend docs: [network-management-api/README.md](network-management-api/README.md)
- Backend structure: [network-management-api/STRUCTURE.md](network-management-api/STRUCTURE.md)

## Project intent

This repo is a full-stack management platform for a network provider. It is designed around operational workflows such as:

- customer and subscriber lifecycle management
- pricing and invoice tracking
- service speed and username allocation
- router and VPN supervision
- monitoring and statistics
- admin and viewer access control
- support and messaging workflows

For implementation details and conventions, see [STRUCTURE.md](./STRUCTURE.md).
