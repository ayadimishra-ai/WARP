# Snowkap — Documentation Index

> Two platforms. One ESG stack.
> Last updated: 2026-06-18

---

## Platform Overview

| Platform | Role | Stack |
|---|---|---|
| **OPs** | GHG emissions calculator — data collection, emission calculation, KPI dashboards | Next.js 15, TypeScript, Hasura (GraphQL), Drizzle ORM, PostgreSQL, ClickHouse, Redis |
| **WARP** | ESG reporting platform — form builder, submission workflow, scoring, audit | Next.js (Pages Router), TypeScript, Hasura (GraphQL), PostgreSQL, Turborepo monorepo |

Both platforms are embedded inside client portals via iframe and share the same Hasura/PostgreSQL infrastructure pattern. Data flows from OPs (GHG calculations) into WARP (ESG disclosures) via the `POST /api/v1/webhook/data-flow` endpoint on OPs.

---

## How the Two Platforms Connect

```
Client Platform (3rd party)
  │
  ├── iframe → OPs (/[organizationId]/embed/v1/[accessToken]/...)
  │     │   GHG data entry, emission calculation, KPI dashboard
  │     │
  │     └── POST /api/v1/webhook/data-flow
  │           → Pushes Scope 1/2/3 emissions + ESG metrics to WARP
  │
  └── iframe → WARP (/embed/[page]?accessToken=JWT)
        │   ESG form collection, submission workflow, scoring, disclosure
        │
        └── Webhook sync → alphams.snowkap.com
              → External microservice for Company + User lifecycle events
```

**OPs → WARP data keys pushed via webhook:**
- `EM_SCOPE1`, `EM_SCOPE2`, `EM_SCOPE3` — GHG Protocol scope emissions
- `HR_EMPLOYEE_TURNOVER` — HR metrics
- `GRIEVANCES` — grievance records
- `GOVERNANCE_BOARD_COPMPOSITION` — board composition [QA: typo in key name]
- `HEALTH_AND_SAFETY` — H&S data
- `RENEWABLE_ELECTRICITY_CONSUMPTION` — energy mix

---

## OPs Documentation

> Source: `/tmp/ops_master/uigw-snowkap_op_nextjs-b2c7537df4a4/`
> Branch: `master`

| Document | What it covers |
|---|---|
| [`docs/ops/ARCHITECTURE.md`](ops/ARCHITECTURE.md) | System purpose, full tech stack, multi-tenancy model, auth flow, dual-DB pattern, data flow, key patterns |
| [`docs/ops/FILE-INDEX.md`](ops/FILE-INDEX.md) | Every source file with one-line purpose, grouped by: Config, Pages, API Routes, Embed Form Routes, Components, Utils, SQL Queries, Store, Server Actions, Admin Libs |
| [`docs/ops/api-routes.md`](ops/api-routes.md) | Every `route.ts` documented: HTTP method, request shape, response shape, downstream calls, QA issues |
| [`docs/ops/pages.md`](ops/pages.md) | Every `page.tsx` documented: what it renders, data fetched, key components used, postMessage events |
| [`docs/ops/data-model.md`](ops/data-model.md) | All PostgreSQL KPI views explained: financial year logic, source tables, output columns, usage context |
| [`docs/ops/utils.md`](ops/utils.md) | All utility files: exports, behaviour, server vs. client split |
| [`docs/ops/config.md`](ops/config.md) | Dockerfile, next.config, ESLint, Prettier, Husky hooks, codegen, env management — all key settings explained |

### OPs Quick Reference

- **Auth header:** `x-sk-op-authorization: Bearer <JWT>`
- **Roles:** `OrganizationAdmin`, `LocationExecutive`
- **Primary DB:** Hasura GraphQL (RLS via JWT `x-hasura-org-id`)
- **Secondary DB:** Drizzle ORM (manual org_id filter required)
- **Environments:** `live` / `beta` / `demo` (controlled by `APP_ENV`)
- **Secrets:** AWS Secrets Manager (no `.env` in production)
- **Tests:** None — [QA: zero test coverage]

---

## WARP Documentation

> Source: `/tmp/warp_live/uigw-snowkap_warp-911d40f4a302/`
> Branch: `live_migration`

| Document | What it covers |
|---|---|
| [`docs/warp/WARP-DOCUMENTATION.md`](warp/WARP-DOCUMENTATION.md) | Complete WARP technical reference: monorepo architecture, full database schema, RBAC permission matrix, event triggers, computed fields, end-to-end data flows, frontend architecture patterns, environment variables, Docker & deployment |

### WARP Quick Reference

- **Auth:** NextAuth.js + JWT via `?accessToken=` query param (embedded iframe)
- **Roles:** `Platform`, `Creator`, `Inviter`, `Approver`, `Invitee`, `Analytics`
- **DB:** PostgreSQL 12 via Hasura GraphQL Engine v2.10 (AWS App Runner)
- **Monorepo:** Turborepo + Yarn workspaces (`apps/web`, `apps/hasura`, `packages/*`)
- **Webhook sync:** `alphams.snowkap.com` for Company + User lifecycle events
- **File storage:** AWS S3 (metadata in Postgres, files in S3)
- **Secrets:** AWS Secrets Manager (`snowkap-warp-beta`, `ap-south-1`)

### WARP Database Tables (summary)

| Table | Purpose |
|---|---|
| `Platform` | Tenant — each client integration |
| `Company` | Company enrolled in WARP (self-referential: parent/child hierarchy) |
| `User` | Person within a Company |
| `Role` / `UserRole` | RBAC role definitions and assignments |
| `Form` | ESG assessment form template |
| `FormDetails` | Extended form metadata (framework, focus area, time estimate) |
| `Section` | Hierarchical grouping of questions within a form |
| `Question` | Individual assessment question |
| `FormField` | How a question is presented in a specific form (type, display rules, validation) |
| `CompanyForm` | Which forms are assigned to which companies |
| `FormInvitation` | Invitation from Inviter company to Invitee company |
| `FormSubmission` | Active submission in response to an invitation |
| `Answer` | Single answer to a single question within a submission |
| `AnswerFile` | S3 file attachment linked to an answer |
| `FormResult` | Pre-computed score per question/section |
| `EmailTemplate` | Per-platform/company email templates |
| `EmailConfiguration` | SMTP config per platform |
| `GlobalMaster` | Platform-scoped key/value reference data |
| `GroupForm` | Groups multiple forms into an assessment bundle |

---

## Cross-Cutting QA Issues

Issues flagged across both platforms during documentation. All marked `[QA]` in their respective docs.

| # | Platform | Issue | Location |
|---|---|---|---|
| 1 | OPs | No test framework — zero automated tests | All files |
| 2 | OPs | `refresh-token` and `revoke-token` routes are stubs (non-functional) | `app/api/v1/auth/` |
| 3 | OPs | Hardcoded webhook auth token `sk-op-test-token-123456` | `app/api/v1/webhook/data-flow/route.ts` |
| 4 | OPs | CORS `Access-Control-Allow-Origin: *` on all API routes | `next.config.ts` |
| 5 | OPs | Wildcard CORS open on all `/api/*` routes | `next.config.ts` |
| 6 | OPs | KPI SQL views hardcode organisation UUID — not multi-tenant | All `utils/queries/kpi_queries/*.sql` |
| 7 | OPs | Dockerfile uses Node 18; Volta pins Node 20 | `Dockerfile`, `package.json` |
| 8 | OPs | `commit-msg` hook calls `npm run commitlint` but npm is blocked | `.husky/commit-msg` |
| 9 | OPs | `no-unused-vars` ESLint rule disabled — dead code not flagged | `.eslintrc.json` |
| 10 | OPs | Column name typo: `total_clectricity_consumption` | `view_total_electricity_consumption.sql` |
| 11 | OPs | View name typo: `reneweable` | `view_electricity_consumption_renewable_vs_non_reneweable.sql` |
| 12 | OPs | Filename typo: `comapre.util.ts` | `utils/comapre.util.ts` |
| 13 | OPs | GHG dashboard root `page.tsx` body is empty (all code commented out) | `ghg-dashboard/page.tsx` |
| 14 | OPs | Test file in production app directory | `ghg-dashboard/(emission-by-scope)/test.tsx` |
| 15 | OPs | GHG forms progress bar hardcoded at "3% Completed" | `ghg-forms/page.tsx` |
| 16 | OPs | `PUT /master-data/users/form` does not use `apiAuthGuard` | `master-data/users/form/route.ts` |
| 17 | OPs | Drizzle queries require manual org_id filter — no RLS | `utils/database/db-context.ts` |
| 18 | OPs | In-memory rate limiter resets on server restart | `lib/rate-limiter/` |
| 19 | OPs | Webhook key typo: `GOVERNANCE_BOARD_COPMPOSITION` | `app/api/v1/webhook/data-flow/route.ts` |
| 20 | WARP | `compnayId` typo existed in migration 7 (renamed in migration 9) | `migrations/default/1663741190565_*` |
| 21 | WARP | Auth header hardcoded in event trigger webhooks | `public_Company.yaml`, `public_User.yaml` |
| 22 | WARP | No allow_list, API limits, or cron triggers configured | `metadata/allow_list.yaml` etc. |
| 23 | WARP | `EmailConfiguration` and `GroupForm` have no role permissions | `public_EmailConfiguration.yaml`, `public_GroupForm.yaml` |

---

## Development Setup

### OPs

```bash
cd uigw-snowkap_op_nextjs
yarn install
yarn pre:secrets        # loads AWS Secrets Manager → process.env
yarn dev                # starts Next.js dev server (APP_ENV=live)
yarn codegen            # regenerate GraphQL types after .gql changes
yarn lint               # ESLint
yarn build              # production build (also runs on pre-push)
```

### WARP

```bash
# Start Hasura + Postgres locally
cd apps/hasura
docker-compose up

# Start web app
cd ../..
yarn dev:web            # Next.js on :3000
yarn dev:hasura         # Hasura console on :9695
yarn codegen            # regenerate GraphQL types

# Standard schema change workflow:
# 1. yarn dev:hasura  → make changes in Hasura console
# 2. Migrations auto-created in apps/hasura/migrations/
# 3. yarn codegen  → update TypeScript types
# 4. Update frontend code
```
