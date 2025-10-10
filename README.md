<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Stayli — Short-term rentals manager (NestJS + Prisma + Handlebars)

Stayli is a simple, self-hostable web app to manage short-term rentals. It aims to be open-source and easy to deploy on your own server (e.g. TrueNAS SCALE), so you stay in control of your data and avoid paid SaaS lock-in.

## Vision and scope

- Audience: non-technical users first (designed for simplicity and clarity).
- Goal: a clean CRUD experience for the core entities of rental operations.
- Core features (roadmap):
  1. Properties — manage apartments/rooms to rent
  2. Clients — manage tenants/guests
  3. Bookings — link a client to a property over a period
  4. Invoices — generate invoices from bookings

The app ships with server-rendered pages (Handlebars) and a tiny amount of progressive JS for actions like deletions.

## Tech stack

- Backend: NestJS (TypeScript)
- Database: PostgreSQL
- ORM/Client: Prisma
- Views: Handlebars (hbs)
- Packaging/Infra: Docker

## Project status

- Infrastructure (Nest, Docker, PostgreSQL, Prisma): ready
- Properties CRUD: implemented end-to-end
- Clients, Bookings, Invoices: implemented as basic CRUDs and iterating
- Home page: `/` with quick links to all modules

## Repository structure

- `src/views/` — Handlebars templates
- `src/**` — Nest modules (controllers, services)
- `prisma/schema.prisma` — Prisma schema
- `.env` — Docker environment (DB host = `db`)
- `.env.local` — Local environment (app on host, DB on `localhost`)

## Environments

- `.env` (Docker):
  - `DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public"`
- `.env.local` (local):
  - `DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"`
  - `PORT=3001` (avoid conflicts with 3000; adjust if needed)

## Quick start — Local (host app + Docker DB)

1. Create and fill env files
   - Copy `.env.example` to `.env` and set a strong `POSTGRES_PASSWORD`
   - Ensure `.env.local` matches credentials and points to `localhost`

2. Start PostgreSQL via Docker

```powershell
docker-compose up -d db
```

3. Install dependencies and generate Prisma client

```powershell
yarn install
yarn prisma:generate:local
```

4. Apply database migrations

```powershell
yarn prisma:migrate:deploy:local
```

5. Start the app in watch mode (port 3001 by default)

```powershell
yarn dev
```

6. Open the app

```
http://localhost:3001/
```

Home page provides quick links:

- Bookings: `/bookings`, create: `/bookings/create`
- Clients: `/clients`, create: `/clients/create`
- Properties: `/properties`, create: `/properties/create`
- Invoices: `/invoices`, create: `/invoices/create`

## Full Docker (app + DB)

1. Copy `.env.example` to `.env` and set `POSTGRES_PASSWORD`

```powershell
Copy-Item .env.example .env
# edit .env to set a real password
```

2. Bring up the full stack

```powershell
docker-compose up --build -d
```

3. Open the app

```
http://localhost:3000/
```

Notes:

- The image builds the project, waits for DB (`wait-for-db.sh`), applies migrations, then starts the app.
- Follow logs: `docker-compose logs -f app`

## Useful Yarn scripts

- Local dev (host): `yarn start:dev:local`
- Dev in Docker image: `yarn start:dev`
- Build: `yarn build`
- Lint: `yarn lint`
- Tests: `yarn test` / `yarn test:e2e`
- Prisma (local):
  - `yarn prisma:generate:local`
  - `yarn prisma:migrate:deploy:local`
  - `yarn prisma:migrate:dev:local`

## Troubleshooting

- Prisma P1001 (cannot reach DB):
  - Local: ensure the DB container is running (`docker-compose ps`) and `.env.local` points to `localhost:5432` with correct credentials.
  - Docker: ensure `DATABASE_URL` targets `db:5432` (default in `.env`).
- Port already in use (EADDRINUSE):
  - Change `PORT` in `.env.local` (e.g. 3002) or free the port.
- View not found (Handlebars):
  - Views live under `src/views`. The app auto-detects the correct path depending on runtime (source vs dist).

## Why this project?

Stayli aims to be a free, sovereign alternative to rental management SaaS. It’s designed to be approachable for non-technical users and easy to self-host, while using a modern, maintainable stack under the hood.
