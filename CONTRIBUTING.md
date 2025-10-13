# Contributing to Stayli

Thanks for your interest in contributing to Stayli! This guide explains how to set up the project, make high‑quality changes, and get them reviewed and merged.

## 1. Prerequisites
- Node.js ≥ 20 (recommended) and Yarn (via Corepack)
- Docker (for local Postgres) or access to a Postgres instance
- Git

## 2. Local setup
1. Clone the repo and install dependencies:
   ```bash
   corepack enable
   yarn install
   ```
2. Create `.env.local` and configure variables:
   - `DATABASE_URL` (Postgres connection string)
   - `SESSION_SECRET`
  - Optional (recommended on first run): `ADMIN_EMAIL`, `ADMIN_PASSWORD` (to seed an admin). If omitted, no admin user is created and you won't be able to sign in until you create a user manually (e.g., via Prisma Studio or a script). Re-running `yarn seed` will upsert the admin user and reset its password to the latest values.
3. Start Postgres (e.g., Docker Compose if available) and run Prisma:
   ```bash
   yarn prisma:generate:local
   yarn prisma:migrate:dev:local
   yarn seed
   ```
4. Start the dev server:
   ```bash
   yarn dev
   ```

## 3. Branching strategy
- Never push directly to `master`.
- Create a branch off `master`:
  - Feature: `feature/my-feature`
  - Fix: `fix/bug-name`
  - Chore/Refactor/Docs: `chore/...`, `refactor/...`, `docs/...`

## 4. Coding standards
- TypeScript strict + ESLint + Prettier
- Before committing:
  ```bash
  yarn lint
  yarn build
  yarn test
  ```
- Follow existing conventions (NestJS modules, services, DTOs, validations, Prisma, etc.).
- Add tests when you change behavior.

## 5. Commit messages
- Keep them concise and descriptive:
  - `feat(clients): add search by name/email`
  - `fix(bookings): validate date params`
  - `chore(ci): run tests on PR`

## 6. Opening a Pull Request
- Ensure that:
  - Build/lint/tests pass locally
  - The PR template (.github/PULL_REQUEST_TEMPLATE.md) is filled out
  - Screenshots are provided if UI is affected
  - Prisma migrations are included if the schema changed
- Push your branch and open a PR against `master`.

## 7. CI and branch protection
- CI (GitHub Actions) runs:
  - `yarn lint`
  - `yarn build`
  - `yarn test`
  - Prisma: `prisma generate` then `prisma migrate deploy`
- Enable Branch Protection Rules on `master`:
  - Require pull request before merging
  - Require status checks to pass before merging
  - Require conversation resolution before merging
  - Require approvals (≥ 1)

## 8. Database & Prisma
- Migrations are required for any schema change.
- Local dev:
  ```bash
  yarn prisma:migrate:dev:local
  yarn prisma:generate:local
  ```
- CI/Prod: `prisma migrate deploy`

## 9. Tests
- `yarn test` runs the suite. Add tests for new flows/rules.
- If tests need a DB, use `DATABASE_URL` to point to a test database.

## 10. Support & discussions
- Open an issue to discuss large features before implementing.
- Use labels to categorize (bug, feature, chore, discussion).

Thanks for your contributions ❤️