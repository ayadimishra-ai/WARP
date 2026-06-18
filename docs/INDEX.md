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

> Source: `apps/` + `packages/` (monorepo root)

### Architecture & Reference

| Document | What it covers |
|---|---|
| [`docs/warp/ARCHITECTURE.md`](warp/ARCHITECTURE.md) | System architecture overview, auth flow, key patterns |
| [`docs/warp/FILE-INDEX.md`](warp/FILE-INDEX.md) | Every source file with one-line purpose |
| [`docs/warp/WARP-DOCUMENTATION.md`](warp/WARP-DOCUMENTATION.md) | Complete technical reference: monorepo, DB schema, RBAC, event triggers, computed fields, data flows, frontend patterns, env vars, deployment |
| [`docs/warp/apps.md`](warp/apps.md) | `apps/web` and `apps/hasura` layout and purpose |
| [`docs/warp/packages.md`](warp/packages.md) | All `packages/*` — client, server, graphql, shared, secrets |
| [`docs/warp/database-schema.md`](warp/database-schema.md) | Full PostgreSQL schema with table relationships |
| [`docs/warp/hasura-metadata.md`](warp/hasura-metadata.md) | Hasura permissions, event triggers, computed fields |
| [`docs/warp/config.md`](warp/config.md) | next.config, turbo.json, ESLint, Prettier, env management |
| [`docs/warp/workflows.md`](warp/workflows.md) | CI/CD workflows |

### QA Fix Logs — API Routes

| Document | What it covers |
|---|---|
| [`docs/warp/api/AI/AI-routes.md`](warp/api/AI/AI-routes.md) | AI curation endpoints — fixes applied |
| [`docs/warp/api/AI/AI-routes-extended.md`](warp/api/AI/AI-routes-extended.md) | Extended AI route analysis |
| [`docs/warp/api/auth/nextauth.md`](warp/api/auth/nextauth.md) | NextAuth route — backdoor removal, JWT fix |
| [`docs/warp/api/awss3/download.md`](warp/api/awss3/download.md) | S3 download route — no-auth issue |
| [`docs/warp/api/awss3/upload.md`](warp/api/awss3/upload.md) | S3 upload route — no-auth issue |
| [`docs/warp/api/awss3/get-upload-url.md`](warp/api/awss3/get-upload-url.md) | S3 presign upload URL |
| [`docs/warp/api/awss3/get-download-url.md`](warp/api/awss3/get-download-url.md) | S3 presign download URL |
| [`docs/warp/api/awss3/move-file.md`](warp/api/awss3/move-file.md) | S3 move file |
| [`docs/warp/api/calculate-score/index.md`](warp/api/calculate-score/index.md) | ESG score engine — shared-state fix |
| [`docs/warp/api/calculate-score/calculate-score-email-routes.md`](warp/api/calculate-score/calculate-score-email-routes.md) | Score email routes |
| [`docs/warp/api/carry-forward/carry-forward.md`](warp/api/carry-forward/carry-forward.md) | Carry-forward routes — JWT, method guard |
| [`docs/warp/api/email-routes/email-routes.md`](warp/api/email-routes/email-routes.md) | All 12+ email routes — null crash, auth bypass |
| [`docs/warp/api/bulk-email-routes/bulk-email-routes.md`](warp/api/bulk-email-routes/bulk-email-routes.md) | Bulk email routes |
| [`docs/warp/api/rara/rara-routes.md`](warp/api/rara/rara-routes.md) | RARA routes — SSRF fix |
| [`docs/warp/api/recommendation/recommendation-routes.md`](warp/api/recommendation/recommendation-routes.md) | Recommendation routes |
| [`docs/warp/api/saveAnswers/saveAnswers.md`](warp/api/saveAnswers/saveAnswers.md) | Save answers route |
| [`docs/warp/api/submit-form/submit-form.md`](warp/api/submit-form/submit-form.md) | Form submission route |
| [`docs/warp/api/misc-routes/misc-routes.md`](warp/api/misc-routes/misc-routes.md) | interiam, progress-report routes |
| [`docs/warp/api/misc-routes/debug-endpoints.md`](warp/api/misc-routes/debug-endpoints.md) | Debug/test endpoints |
| [`docs/warp/api/misc-routes/progress-report-and-interiam.md`](warp/api/misc-routes/progress-report-and-interiam.md) | Progress report + interiam detail |
| [`docs/warp/api/webhooks/document-expiry-notifications.md`](warp/api/webhooks/document-expiry-notifications.md) | Document expiry webhook |
| [`docs/warp/api/v1/internal/post-form-submission.md`](warp/api/v1/internal/post-form-submission.md) | Internal form submission endpoint |
| [`docs/warp/api/v1/ops/check-company-eligibility.md`](warp/api/v1/ops/check-company-eligibility.md) | OPS→WARP eligibility check |
| [`docs/warp/api/v1/platform/auth/signin.md`](warp/api/v1/platform/auth/signin.md) | Platform sign-in |
| [`docs/warp/api/v1/platform/company/company-crud.md`](warp/api/v1/platform/company/company-crud.md) | Company CRUD |
| [`docs/warp/api/v1/platform/company/bulk.md`](warp/api/v1/platform/company/bulk.md) | Bulk company operations |
| [`docs/warp/api/v1/platform/company/send-invitation.md`](warp/api/v1/platform/company/send-invitation.md) | Send company invitation |
| [`docs/warp/api/v1/platform/user/user-crud.md`](warp/api/v1/platform/user/user-crud.md) | User CRUD |
| [`docs/warp/api/v1/platform/platform-routes.md`](warp/api/v1/platform/platform-routes.md) | Platform routes overview |

### QA Fix Logs — Pages & Packages

| Document | What it covers |
|---|---|
| [`docs/warp/pages/core-pages.md`](warp/pages/core-pages.md) | Core pages QA |
| [`docs/warp/pages/embed-pages.md`](warp/pages/embed-pages.md) | Embed pages QA |
| [`docs/warp/pages/embed-popup-and-common-components.md`](warp/pages/embed-popup-and-common-components.md) | Embed popup + AI chat components — XSS fixes |
| [`docs/warp/pages/form-pages.md`](warp/pages/form-pages.md) | Form pages — missing return fix |
| [`docs/warp/pages/invitation-query-pages.md`](warp/pages/invitation-query-pages.md) | Invitation query pages |
| [`docs/warp/pages/document-repository-page.md`](warp/pages/document-repository-page.md) | Document repository page |
| [`docs/warp/pages/test-temp-learn-pages.md`](warp/pages/test-temp-learn-pages.md) | Test/temp/learn pages |
| [`docs/warp/packages/client-packages.md`](warp/packages/client-packages.md) | Client package QA — postMessage wildcard fix |
| [`docs/warp/packages/server-guards.md`](warp/packages/server-guards.md) | Server guards — webhook secret, timing-safe compare |
| [`docs/warp/packages/notification-service.md`](warp/packages/notification-service.md) | Notification service — debugger removal |

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
