# CLAUDE.md — WARP Monorepo Root

This file guides Claude Code when working in the WARP monorepo root.
For OPS-specific guidance see `ops/CLAUDE.md`.

## Build and Development Commands

- **Package manager:** `yarn` only (npm blocked by engine config)
- `yarn dev:web` — Next.js web app (apps/web)
- `yarn dev:hasura` — Hasura console
- `yarn codegen` — regenerate GraphQL types from `.gql` files
- `yarn lint` — ESLint across all packages
- `yarn format` — Prettier format
- `yarn build` — full monorepo build

## Architecture

Turborepo monorepo with Yarn Workspaces. Two main products:

1. **WARP** (root) — Next.js 14 Pages Router ESG/GHG assessment platform
2. **OPS** (`ops/`) — Next.js 15 App Router multi-tenant data operations portal

### WARP Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | Next.js 14 Pages Router | `apps/web/pages/` |
| Auth | NextAuth v4 + custom JWT (HS256) | `HASURA_GRAPHQL_JWT_SECRET` env var |
| GraphQL | Hasura v2 | Admin secret in server SDK, JWT in browser |
| UI | React 18, custom components | |
| ESG engine | JSONata formula engine | `apps/web/pages/api/calculate-score/` |
| File storage | AWS S3 | `packages/server/services/aws-s3.service.ts` |
| Email | Nodemailer | `packages/server/services/notification.service.ts` |
| AI | RARA API (document rating/validation) | `apps/web/pages/api/rara/` |

### Directory Layout

| Path | Purpose |
|------|---------|
| `apps/web/pages/api/` | API routes (Pages Router convention) |
| `apps/web/pages/api/AI/` | AI curation and processing endpoints |
| `apps/web/pages/api/calculate-score/` | ESG/GHG score calculation engine |
| `apps/web/pages/api/awss3/` | S3 upload/download routes |
| `apps/web/pages/api/v1/platform/` | Platform company/user management |
| `apps/web/pages/api/rara/` | RARA document validation/rating |
| `apps/web/pages/embed/` | Embeddable form and AI components |
| `apps/web/pages/form/` | Assessment form pages |
| `packages/server/guards/` | API route guards (error, method, auth, webhook) |
| `packages/server/services/` | AWS S3, notification, user, company services |
| `packages/graphql/` | Generated GraphQL types + server SDK |
| `packages/shared/utils/` | Auth session parsing, DOM sanitiser, custom errors |
| `packages/client/libs/` | Browser-side rate limiter |
| `docs/` | Feature documentation (ai-features, document-repository, esg-post-deal-form) |

### API Route Pattern (WARP)

```typescript
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";

const handler: NextApiHandler = async (req, res) => { ... };

export default ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(handler, "POST"),
    { limitInterval: 1, maxRequestCount: 60, progressiveDelay: true }
  )
);
```

For routes requiring user auth, verify JWT manually:
```typescript
import jwt from "jsonwebtoken";
const token = (req.headers.authorization ?? "").replace("Bearer ", "");
const claims = jwt.verify(token, process.env.HASURA_GRAPHQL_JWT_SECRET!);
```

### Auth

- JWT algorithm: HS256
- Secret env var: `HASURA_GRAPHQL_JWT_SECRET`
- Hasura claims key: `https://hasura.io/jwt/claims`
- Claims include: `x-hasura-user-id`, `x-hasura-default-role`, `x-hasura-allowed-roles`, `x-hasura-company-id`
- Always use `jwt.verify()` — never `jwt.decode()` (no signature check)

### Import Aliases

- `@warp/server` → `packages/server`
- `@warp/client` → `packages/client`
- `@warp/graphql` → `packages/graphql`
- `@warp/shared` → `packages/shared`

### Critical Invariants

- **ESG score calculation** (`apps/web/pages/api/calculate-score/index.ts`): `recommendationWithFormfieldData` must be a local variable inside `calculateScore()`, never module-level. Shared module state corrupts scores across concurrent requests.
- **dangerouslySetInnerHTML**: Always wrap with `domSanitiseValue()` from `@warp/shared/utils/dom-purifier/dom-purify.client.util`.
- **postMessage**: Never use `"*"` as origin — use `NEXT_PUBLIC_PARENT_ORIGIN` env var via `platform-window-message.service.ts`.
- **Hasura webhook guard** (`packages/server/guards/api-hasura-webhook-guard.ts`): Secret sourced from `HASURA_WEBHOOK_SECRET` env var; compared with `crypto.timingSafeEqual`.
- **RARA routes**: URL and auth key must come from DB (`GlobalMaster` table) — never from request body (SSRF vector).
