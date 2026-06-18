# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- **Package manager:** `yarn` only (npm is blocked by engine config)
- `yarn dev` — dev server with Turbopack (APP_ENV=live)
- `yarn dev:beta` / `yarn dev:demo` — dev server for other environments
- `yarn build` — production build (also runs as pre-push hook)
- `yarn lint` — ESLint (runs as pre-commit hook)
- `yarn prettier` — format with Prettier
- `yarn codegen` — regenerate GraphQL types from `.gql` files
- `yarn codegen:beta` / `yarn codegen:demo` / `yarn codegen:live` — codegen per environment
- No test framework is configured

## Commit Convention

Conventional Commits enforced via commitlint (husky `commit-msg` hook). Types: `feat`, `fix`, `chore`, `refactor`, `style`, `perf`, `docs`, `test`, `build`, `ci`, `revert`.

## Architecture

Next.js 15 App Router with multi-tenant routing via `[organizationId]` URL segment. React 19, TypeScript strict mode.

### Tech Stack

| Layer     | Tech                                                   | Notes                                                     |
| --------- | ------------------------------------------------------ | --------------------------------------------------------- |
| UI        | Mantine v8, TailwindCSS                                | Custom form wrappers in `components/forms/FormComponent/` |
| Forms     | react-hook-form + zod                                  | Always `"use client"`, `zodResolver`, `mode: "onChange"`  |
| Tables    | mantine-react-table                                    | Column defs via `useMemo<MRT_ColumnDef<T>[]>()`           |
| Charts    | amcharts5                                              | GHG dashboard visualizations                              |
| State     | Zustand + react-hook-form                              | No Redux/Recoil                                           |
| GraphQL   | Apollo Client (browser) + graphql-request SDK (server) | Hasura backend                                            |
| Direct DB | Drizzle ORM                                            | For non-Hasura tables only                                |
| Auth      | Custom JWT (HS256)                                     | Header: `x-sk-op-authorization`, Hasura claims embedded   |
| Secrets   | AWS Secrets Manager                                    | No `.env` files in production                             |

### Dual Database Pattern

1. **Hasura GraphQL** (primary) — Apollo Client on browser, `getGraphQlServerSDK()` with admin secret on server. Row-level security enforced via JWT claims (`x-hasura-org-id`).
2. **Drizzle ORM** (secondary) — direct Postgres for select tables (Organizations, SupplierInvitations, EmailTemplates, GlobalConfigs). Schema in `utils/drizzle/schema.ts`, singleton via `GetOPSDBContext()`.

### GraphQL Workflow

1. Write `.gql` files in `graphql/queries/`, `graphql/mutations/`, or `graphql/subscriptions/`
2. Run `yarn codegen` to generate typed hooks and SDK
3. **Never edit** `*.generated.tsx` files — they are codegen output
4. Near-operation-file preset: generated files appear next to their `.gql` source
5. Global types generated in `graphql/shared/types.ts`, server SDK in `graphql/shared/sdk.ts`

### API Route Pattern

All API routes follow a guard-wrapping pattern:

```typescript
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
  })
);
```

- `apiExceptionGuard` (`lib/guards/`) — catches errors, formats Zod validation errors
- `withEmailOrIpRateLimitWithProgressiveDelay` (`lib/rate-limiter/`) — in-memory rate limiting (resets on server restart)
- `apiAuthGuard` (`lib/guards/`) — validates JWT from `x-sk-op-authorization` header, provides `TUserSession`

### Auth Flow

1. Client POSTs to `/api/v1/auth/access-token` with `organization_id` + `user_email`
2. Server generates JWT with Hasura claims (`x-hasura-org-id`, `x-hasura-user-id`, `x-hasura-default-role`)
3. Client stores token in `localStorage.access_token`
4. Apollo Client injects Bearer token via auth link; server SDK uses admin secret instead

### Multi-Tenancy

- `organizationId` is a URL path segment (`app/[organizationId]/...`)
- Also embedded in JWT as `x-hasura-org-id` for Hasura RLS enforcement
- Drizzle queries must manually filter by org_id (no automatic scoping)

### Environment Management

- `APP_ENV` controls environment: `live`, `beta`, `demo`
- Server env: `getServerEnv()` from `utils/env/env.server.ts` (Zod-validated, loaded from AWS Secrets Manager)
- Client env: `clientEnv` from `utils/env/env.client.ts` (public vars only)
- Secrets loaded at startup via `scripts/load-secrets.mjs` into `process.env`

### Directory Layout

| Path                          | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `app/[organizationId]/`       | Tenant-scoped pages and API routes         |
| `app/[organizationId]/embed/` | Embeddable widget routes                   |
| `app/admin/`                  | Admin panel (protected)                    |
| `app/actions/`                | Server actions                             |
| `app/api/v1/`                 | REST API endpoints                         |
| `components/forms/`           | Form components by domain                  |
| `components/tables/`          | Table components (mantine-react-table)     |
| `features/`                   | Feature modules (manual data entry, etc.)  |
| `graphql/`                    | `.gql` files + generated hooks/types       |
| `lib/`                        | Server-side business logic by domain       |
| `shared/`                     | Cross-cutting types, constants, validation |
| `hooks/`                      | Custom React hooks                         |
| `utils/`                      | Pure utility functions                     |
| `schemas/`                    | Data validation schemas                    |
| `themes/`                     | Mantine theme configuration                |

### Import Alias

Use `~/` for project root imports (configured in tsconfig). Avoid deep relative paths.

## Pitfalls

### Emission Calculation Engine

Core domain logic in `lib/emission-calculation-engine/`. Separate service files per emission type (fuel consumption, power consumption, transport, waste generation, fugitive, material consumption, capital goods).

### Monthly Activity Summary

**Full spec:** `docs/monthly-activity-summary/README.md` — read before modifying any file in this domain.

**Route:** `/:organizationId/embed/v1/:accessToken/data-log-summary`

**Key files:**

- `lib/monthly-activity-summary/` — service, queries, types, business-rules
- `lib/bulk-upload/bulk-upload-approval.validation.ts` — RULE-008 approval lock
- `app/api/v1/monthly-activity-summary/` — GET summary, GET filters, POST approve
- `app/[orgId]/embed/v1/[token]/data-log-summary/` — UI page + filter components

**Non-negotiable constraints:**

1. **Raw SQL via `GetOPSDBContext()` only** — do not rewrite queries using Hasura GraphQL or Drizzle query builder.
2. **Status NULL / `'pending'` / `'saved'` are all Pending** — all three must appear in every WHERE/COUNT clause; use the `STATUS_COUNTS` constant.
3. **`defaultYear` = latest year with data** — use `queryLatestDataYear()`, never `MAX(tr.year)` or today's calendar year.
4. **`defaultMonth` = latest month with data** — use `queryLatestDataMonth()`, same principle as `defaultYear`.
5. **Approval lock (RULE-008) — bulk upload routes:** enforced centrally inside `getTaskRequestActvityTaskRequestId()` in `excel.service.ts`. Do not add per-route checks in individual bulk upload routes. **Exception:** if an activity's service uses `task-request.service.getOrCreateTaskRequestIfNotExist` instead of `getTaskRequestActvityTaskRequestId` (e.g. the `general` activity), it must call `assertNoApprovalLock()` explicitly before any DB write.
6. **Location IDs from the client must be intersected with `session.mappings`** before any SQL query.
7. **Approve is OrganizationAdmin-only** (RULE-001) — enforced server-side in the approve route; HTTP 403 for all other roles.
8. **All user-supplied SQL inputs** (UUIDs, month names, activity codes, years) must be sanitised through the helpers in `queries.ts` before interpolation. Month names that are all invalid must throw (fail closed), not silently expand to all months.
9. **`ALL_DATA_TABLES_BY_ACTIVITY` must mirror every direct table in `GHG_UNION`** — any table that owns `activity_task_request_id` directly (not via parent JOIN) must appear in this map, even if it has no `status` column (those go here but NOT in `GHG_TABLES_BY_ACTIVITY`).
10. **Approval scope = activity × currently applied filters only** — approving one activity/month/location must never affect other combinations (US-5C).
11. **No Reject in V1, no Unlock** — flow is Pending → Approved only. Unlocking requires a support ticket; do not build unlock UI or API.
12. Add new business rules to `lib/monthly-activity-summary/business-rules.ts` with the next `RULE-NNN` number.
13. **Approval lock (RULE-008) — form/manual-entry routes** (`app/[organizationId]/embed/v1/[accessToken]/data-import/forms/`): these routes are NOT covered by the central bulk-upload check. Every new form route handler must call `assertNoApprovalLock()` (from `~/lib/bulk-upload/bulk-upload-approval.validation.ts`) before any DB write, for all three operations:
    - **INSERT:** call via `getTaskRequestActvityTaskRequestId()` — the lock check is included automatically.
    - **UPDATE:** fetch the existing record from the DB first; call `assertNoApprovalLock(orgAddressId, activityCode, [{ month, year }])` using **DB values, not client input**. If month/year/location is being changed to a new target, also call `getTaskRequestActvityTaskRequestId()` for the new target (which includes the lock check).
    - **DELETE:** fetch the existing record from the DB first; call `assertNoApprovalLock(orgAddressId, activityCode, [{ month, year }])` using **DB values, not client input**.
    - Never trust client-supplied month/year/location for the lock check — always resolve them from the DB record.
    - `assertNoApprovalLock()` throws `CustomError(422, APPROVAL_LOCK_ERROR_CODE)`; `apiExceptionGuard` propagates it to the client automatically — no extra catch block needed.
    - Reference implementation: `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-captive-power/non-renewable-fuel/route.ts`

**Email notifications (US-8, US-9):**

- **Upload event (US-8):** When a Location Executive successfully uploads data, fire-and-forget email to **all** Org Admins of the organisation — one email per location + activity combination. Must not block the upload response. No email on failed uploads.
- **Approval event (US-9):** After admin approves, fire-and-forget email to **all** Location Executives assigned to each approved location + activity. "Approved by" field must name the specific admin who acted. Must not block the approve response.
- Multiple Org Admins → all receive the upload notification (US-H).
- Email service: `lib/monthly-activity-summary/email/monthly-activity-summary-email.service.ts`.

**Scheduled reminders (US-10, US-11):**

- **1st of every month at 9:00 AM IST:** Check all location + activity combinations for missing previous-month data. If missing, email LE (To) + all Org Admins (CC). Skip combinations where data was already uploaded (even if not yet approved).
- **10th of every month at 9:00 AM IST:** Same check, independent job. Skip if data was uploaded between 1st and 10th. If LE is deactivated, send to Org Admin CC only.
- **IST timezone is hardcoded in V1** — multi-region support is out of scope.
- **Skip on scheduler run day:** New locations or activities onboarded on the 1st or 10th are excluded from that day's run; included in all subsequent runs.
- **First month after org onboarding:** No reminder for the current month — reminders begin from the 1st of the following month.
- **No org-level toggle in V1** — reminders are always active for all organisations; a disable toggle is a V2 item.y's run; included in all subsequent runs.
- **First month after org onboarding:** No reminder for the current month — reminders begin from the 1st of the following month.
- **No org-level toggle in V1** — reminders are always active for all organisations; a disable toggle is a V2 item.
