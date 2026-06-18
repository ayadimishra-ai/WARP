# WARP + OPS Monorepo

GHG inventory and ESG reporting platform.

> **All source code and fixes are on branch `claude/magical-rubin-dwqjhr`.**
> The `main` branch is empty — switch branches to see the code.

---

## Repository Structure

```
/                        ← WARP monorepo root (Turborepo + Yarn Workspaces)
├── apps/
│   ├── web/             ← Next.js 14 Pages Router — ESG/GHG assessment platform
│   └── hasura/          ← Hasura metadata and migrations
├── packages/
│   ├── client/          ← Browser-side hooks, rate limiter, services
│   ├── graphql/         ← Generated GraphQL types, hooks, server SDK
│   ├── server/          ← API guards, AWS S3 service, notification service
│   ├── shared/          ← Cross-package types, utils, validation schemas
│   ├── secrets/         ← AWS Secrets Manager loader
│   ├── configs/         ← Shared ESLint / Tailwind / TS configs
│   └── tsconfig/        ← Shared TypeScript base configs
├── ops/                 ← OPS Next.js 15 App Router — multi-tenant data ops portal
│   ├── app/             ← App Router pages and API routes
│   ├── lib/             ← Server-side business logic
│   ├── graphql/         ← OPS GraphQL queries and generated SDK
│   ├── shared/          ← OPS-specific shared types and constants
│   ├── utils/           ← OPS utilities (env, drizzle, jwt, logger)
│   ├── docs/            ← OPS feature specs (monthly-activity-summary, etc.)
│   └── CLAUDE.md        ← Claude Code guidance for the OPS codebase
├── docs/                ← WARP feature documentation (original source)
│   ├── ai-features/
│   ├── document-repository/
│   └── esg-post-deal-form/
├── workflows/           ← CI/CD workflow definitions
└── CLAUDE.md            ← Claude Code guidance for the WARP monorepo root
```

---

## WARP — Quick Start

```bash
# Install (yarn only — npm is blocked)
yarn install

# Dev
yarn dev:web        # Next.js web app
yarn dev:hasura     # Hasura console

# Codegen (after changing .gql files)
yarn codegen

# Lint / Format
yarn lint
yarn format

# Build
yarn build
```

## OPS — Quick Start

```bash
cd ops
yarn install
yarn dev        # Turbopack dev server (APP_ENV=live)
yarn build
yarn lint
yarn codegen    # regenerate GraphQL types
```

---

## Security Fixes Applied (this branch)

All critical bugs found during QA were fixed directly in the source files. See `docs/warp/CHANGELOG.md` for the complete per-file change log and `docs/warp/qa-security-fixes.md` for full status of every audited file.

| Area | Fix |
|------|-----|
| ESG score calculation | Module-level shared state removed — was corrupting scores across concurrent users |
| AI routes (wildcard CORS) | `Access-Control-Allow-Origin: *` removed from 5 AI route handlers |
| AI routes (JSON.parse) | `JSON.parse(req.body)` → `req.body`; Next.js already parses JSON bodies |
| JWT verification (6 files) | `jwt.decode()` → `jwt.verify()` with `HASURA_GRAPHQL_JWT_SECRET` across all RARA + submit routes |
| Auth backdoor | Hardcoded `admin@warp.com / 1234` login removed from NextAuth |
| S3 download/upload auth | No-auth S3 download and upload routes now require valid JWT (401 if missing) |
| Hardcoded secret in RARA | `internalSharedKey = "uvmscw..."` literal → `process.env["WARP_INTERNAL_SHARED_KEY"]` |
| Secrets disclosure | `test/secrets-check.ts` was fully public; now requires `x-warp-shared-key` header |
| Cron auth bypass | `String(undefined)` shared-key pattern fixed in `sending-email-from-db`, `reviewer-pending-emails-cron`, `migrate-existing-invitations-stats` |
| Developer endpoint exposed | `migrate-existing-invitations-stats` had zero auth and no size limit; now guarded + capped at 100 items |
| HTTP status codes | 500 used for 400 (client errors) and 401 (unauthorized) conditions across 12+ routes |
| Interim answers | `ApiMethodGuard("GET")` on POST route → `"POST"` |
| Questionnaire render | Missing `return` in JSX branch — form never displayed |
| Global data storage | `typeof !== undefined` (always true) → `!== "undefined"` |
| Email routes | `response?.indexOf("OK")` crash on null → safe `.includes()` check |
| Recommendation emails | No method guard — accepted GET/DELETE/etc; now POST-only; success check fixed |
| XSS | `dangerouslySetInnerHTML` raw HTML → `domSanitiseValue()` wrapper |
| postMessage | Wildcard `"*"` origin → `NEXT_PUBLIC_PARENT_ORIGIN` env var |
| Webhook secret | Hardcoded hex key → `HASURA_WEBHOOK_SECRET` env var + timing-safe compare |
| RARA SSRF | Client-controlled URL/key removed — fetched from DB instead |
| OPS middleware | `NextResponse.next()` without `return` — all routes were bypassing auth |
| OPS webhook token | Hardcoded `"sk-op-test-token-123456"` → `DATA_FLOW_WEBHOOK_SECRET` env var |
| OPS cron auth | `String(undefined)` bypass → timing-safe `crypto.timingSafeEqual` |
| AWS credentials | Hardcoded keys removed from `organization-configs.server.ts` |
| Error serialization | `{ error: error \|\| "..." }` serializes Error objects to `{}` → fixed to `error?.message` across 8 routes |
| Silent no-response | PUT accepted but never handled in 3 routes (saveAnswers, carry-forward x2) — now POST-only |
| Null-safe body access | `req.body[0].field` → `req.body?.[0]?.field` in 2 routes to prevent TypeError crashes |
| Auth failure status | 500 returned for unauthorized access → 401 in all fixed RARA routes |
| Sensitive header logging | `req.headers.authorization` logged at INFO level in `document-processing-completed` — removed |
