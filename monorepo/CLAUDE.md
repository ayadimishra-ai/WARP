# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

**pnpm workspace** (no Turborepo/Nx) with two apps:
- `apps/web` — Next.js 15 frontend (main application)
- `apps/hasura` — Hasura GraphQL backend (metadata + migrations only)

**Package manager**: pnpm 10.11.0 | **Node**: 20.10.0 (pinned via Volta)

## Commands

All commands run from the repo root unless noted.

```bash
# Development
pnpm dev                    # All workspaces in parallel (Next.js uses --turbopack)
pnpm --filter @snowkap/web dev  # Web app only

# Build & Lint
pnpm build                  # All workspaces
pnpm lint                   # All workspaces in parallel

# Within apps/web only
pnpm codegen                # Regenerate GraphQL types from local Hasura (runs prettier after)

# Database (run from apps/web)
pnpm dev:db                 # Drizzle Kit — manage schema migrations

# Hasura (run from apps/hasura)
pnpm hasura:dev             # Hasura CLI with repo-root `.env.local`
pnpm hasura:alpha           # Hasura CLI with repo-root `.env.alpha`
```

**⚠️ `APP_ENV=live` gotcha**: every web-app script (`dev`, `build`, `start`, `lint`, `dev:db`, `codegen`) hard-codes `APP_ENV=live` via `cross-env`, so the live AWS secret + `.env.live` are loaded by default. There are no `dev:local` / `dev:beta` / `dev:demo` / `alpha:codegen` scripts — to target another environment, invoke directly, e.g. `cross-env APP_ENV=local next dev --turbopack` from `apps/web/`.

There are no tests currently configured.

### Commit Hooks

Husky + commitlint enforce **Conventional Commits** on every commit (`@commitlint/config-conventional`). Commit messages that don't match the convention will be rejected by the `commit-msg` hook. Configured via `prepare` / `commitlint` scripts in `apps/web/package.json`.

## Architecture

### Environment & Secrets

**AWS Secrets Manager is the single source of truth** — not `.env` files. All server config is fetched from a JSON secret named `snowkap-monorepo-live` (region: `ap-south-1`). The `APP_ENV` variable (set to `local`, `alpha`, `beta`, `demo`, or `live`) selects which `.env.*` file is loaded alongside the secret.

- `src/lib/env/env.server.ts` — server-side env (calls AWS on boot, cached)
- `src/lib/env/env.client.ts` — browser-safe env (must be passed from server components)
- `src/lib/util/secrete/secrets-manager.service.ts` — AWS SM abstraction

Never import `env.server.ts` from client components.

### Data Layer

Multiple data clients coexist; pick the right one for the job:

- **Hasura** (`apps/hasura/`) — PostgreSQL GraphQL API. Metadata in `metadata/`, migrations in `migrations/`. Primary data gateway.
- **Apollo Client** (`src/lib/apollo/`) — client-side GraphQL against Hasura. React 19 compatible setup.
- **graphql-request** — server-side GraphQL calls against Hasura (used in API routes / server components). Types generated to `src/graphql/server/generated.ts`.
- **GraphQL Codegen** — near-operation-file preset. Running `pnpm codegen` generates `.generated.tsx` hooks alongside `.gql` files, plus `src/graphql/types.ts` and `src/graphql/server/generated.ts`. **Always re-run codegen after modifying `.gql` files.**
- **Drizzle ORM** (`src/lib/db/`) — direct PostgreSQL access for ops that bypass Hasura. Two schemas: `schema.ts` (app) and `auth-schema.ts` (Better-Auth managed). Canonical for direct SQL access.
- **Prisma** — present in devDependencies but legacy; prefer Drizzle for new work.
- **Raw `pg` / `postgres`** — used by select scripts / edge paths; do not introduce new usages unless Drizzle is unsuitable.
- **ClickHouse** (`@clickhouse/client`) — analytics queries only.
- **Caching** — Upstash Redis (serverless), Valkey/iovalkey (self-hosted), and `keyv` wrappers are all present. Check existing modules before adding a new cache client.

### Authentication

**Better-Auth** (`src/lib/auth.ts`) with Drizzle adapter is the active auth system:
- Email + password strategy
- JWT plugin: 1-hour expiry, payload includes `sub`, `email`, `name`
- Cross-domain cookies enabled for production (HTTPS only)

**Note**: `next-auth` 4.24 is still listed in `apps/web/package.json` dependencies but is legacy and not the active auth path. Do not mix `next-auth` into new code — route everything through Better-Auth.

**Middleware** (`src/middleware.ts`):
- Protects all routes except an explicit public paths list
- Verifies JWTs by calling `/api/internal/verify-token` with a shared internal token
- Sets CORS headers on `/api/*`

### Source Layout (`apps/web/src/`)

The web app mixes several organizational styles — important to know which goes where:
- `app/` — Next.js App Router (routes, layouts, API routes under `app/api/`). All active routing lives here, including the WARP module at `app/warp/` and its API at `app/api/warp/`.
- `pages/` — Pages Router is effectively retired: only `_app.tsx`, `_document.tsx`, and `api/rate-limit-status.ts` remain. Do not add new routes here.
- `modules/` — feature-scoped modules (business logic, feature-level components)
- `components/` — shared / generic React components
- `lib/` — cross-cutting infrastructure (auth, db, apollo, env, secrets, util)
- `graphql/` — `.gql` operations + generated types (do not edit `.generated.tsx` / `generated.ts`)
- `server/`, `constants/`, `theme/`, `types/`, `util/` — supporting directories

When adding a feature, prefer `modules/<feature>/` over scattering files across `components/` + App Router folders.

### WARP module — UI parity with old WARP is the priority

The WARP module under `apps/web/src/modules/warp/` was migrated from a legacy repo (`ReferenceOnly/snowkap_warp/` or `../snowkap_warp`) that used **Mantine v5**. The monorepo is on **Mantine v8**. When fixing UI inside WARP, **match the old WARP visual design** rather than adopt the new Mantine v8 defaults — prefer restoring the look over "modernizing" to current component defaults.

**Silent v5 → v8 prop renames to watch for** (these do NOT error at runtime, they just render nothing / wrong):

| v5 prop (silently ignored in v8) | v8 equivalent |
|---|---|
| `Group spacing=` / `Stack spacing=` | `gap=` |
| `Group position="right"` | `justify="flex-end"` |
| `Text weight=` | `fw=` |
| `Text color=` (hex, theme color) | `c=` |
| `Text size={number}` | `fz={number}` |
| `Text transform=` | `tt=` |
| `Button leftIcon=` / `rightIcon=` | `leftSection=` / `rightSection=` |
| `Button styles.leftIcon` | `styles.section` |
| `Menu.Item icon=` | `leftSection=` |
| `Autocomplete icon=` | `leftSection=` |
| `Autocomplete onItemSubmit={(e) => e.value}` | `onOptionSubmit={(value: string) => value}` (signature changed too) |
| `Select nothingFound=` | `nothingFoundMessage=` |
| `Pagination page=` | `value=` |
| `Pagination classNames.item` | `classNames.control` |
| `Title color=` | `c=` |

**Compat setup already in place:**
- `createStyles` still works but must be imported from `@mantine/emotion` (not `@mantine/core`)
- `MantineEmotionProvider` + `emotionTransform` are wired in `apps/web/src/app/warp/WarpClientShell.tsx` so `styles={{...}}`, `sx={{...}}`, and global emotion styles continue to work
- Cross-version shims (e.g. `MediaQuery`, `DateRangePicker`, `Global`, `NotificationsProvider`) live in `apps/web/src/modules/warp/packages/client/compat/mantine-v8-compat.tsx` — reuse these rather than reinventing

**Before changing component APIs**, check `../snowkap_warp/packages/client/` or the `ReferenceOnly/` mirror to confirm the intended v5 behavior. Copy the styling; adapt only the prop surface.

### API Routes (`src/app/api/`)

~25+ custom REST endpoints alongside the GraphQL layer. Naming pattern: each route has its own directory with `route.ts`. Key route groups:
- `/api/auth/[...all]` — Better-Auth catch-all
- `/api/internal/verify-token` — JWT verification (middleware→internal only)
- `/api/common/*` — user, encryption, menus
- `/api/registration/*`, `/api/signIn/*`, `/api/forgot-password/*`, `/api/reset-password/*`

### Security

Three layers of rate limiting:
1. IP-based (`rate-limit-by-email-or-ip.ts`) — 5 req/min, in-memory with 10-min cleanup
2. Email-based progressive delay (`progressive-delay-rate-limit.ts`) — exponential backoff (VAPT compliant)
3. Express-rate-limit middleware on individual routes

IP detection falls back through: `x-real-ip` → `x-forwarded-for` → `cf-connecting-ip` → `true-client-ip` → `x-client-ip`.

## Key Conventions

- **Path alias**: `@/*` maps to `apps/web/src/*`
- **Prettier**: 2-space indent, double quotes, trailing commas off, semicolons on
- **ESLint**: `no-unused-vars` and `no-explicit-any` disabled for generated files; prefix unused vars with `_`
- **CORS**: Wildcard origin allowed on all `/api/*` routes (configured in `next.config.ts`)
- **Module system**: Root package is ESM (`"type": "module"`); web app uses standard Next.js bundler resolution
- **Commits**: Conventional Commits enforced by commitlint + Husky

## Repository Layout

- `apps/web` — Next.js 15 app (main application)
- `apps/hasura` — Hasura metadata + migrations
- `packages/*` — workspace glob is declared in `pnpm-workspace.yaml` but currently empty; no shared packages yet
- `specs/` — feature specifications / design docs (e.g. `feat-generate-powerbi-dashboard-embed-url`). Consult before implementing scoped features.

## Tech Stack Quick Reference

| Concern | Library |
|---|---|
| UI | Mantine 8, Tailwind 4, Emotion |
| Forms | React Hook Form + Zod |
| Auth | Better-Auth 1.2.7 |
| JWT | jose |
| Caching | Upstash Redis, Valkey (iovalkey) |
| Email | Nodemailer |
| Icons | Tabler Icons |
