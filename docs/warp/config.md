# WARP Configuration

## Root-Level Configuration Files

### `package.json` (root)

**Package name**: `warp` (private monorepo root — not published)
**Package manager**: Yarn 1.22.19 (classic)
**Node requirement**: `>=18.0.0` (Volta-pinned to 18.20.0)

**Key scripts**:

| Script | Command | Purpose |
|---|---|---|
| `dev:hasura` | `turbo run dev --scope="@warp/hasura"` | Start Hasura console for local dev |
| `dev:hasura:docker` | `turbo run dev:docker --scope="@warp/hasura"` | Start Hasura via Docker |
| `dev:web` | `turbo run dev --scope="@warp/web"` | Start Next.js dev server |
| `codegen` | `turbo run codegen --scope="@warp/graphql"` | Run GraphQL code generation |
| `lint` | `turbo run lint` | Lint all packages |
| `format` | `prettier --write "**/*.{ts,tsx,md}"` | Format all TypeScript and Markdown |
| `build` | `turbo run build` | Build all apps and packages |
| `start:docker` | `turbo run start:docker` | Start Docker services |

**Root-level dependencies** (unusual — normally dependencies belong in workspaces):
- `@mantine/dropzone` `@mantine/rte` — Mantine UI components
- `draft-js` `draft-js-export-html` — Rich text editor
- `quill` — Alternative rich text editor
- `react-table` v7 — Legacy table library
- `react-icons` — Icon library
- `uuid` — UUID generation
- `zod` — Schema validation
- `dompurify` `he` — HTML sanitization and entity decoding
- `busboy` — Multipart form parsing

[QA] Having dependencies at the monorepo root is non-standard. These should be moved to the packages that actually consume them. Root-level deps are available to all workspaces but don't declare intent clearly.

**ResolutionS**: Forces `@types/react` to `^18.0.0` and `@types/react-dom` to `^18.0.0` across all workspaces.

---

### `turbo.json`

Turborepo pipeline configuration.

**Global environment variables** (all tasks inherit these — changes to any of these invalidate the build cache):

| Variable | Purpose |
|---|---|
| `NEXTAUTH_URL` | NextAuth base URL |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXT_PUBLIC_GRAPHQL_API_URL` | Hasura GraphQL endpoint |
| `HASURA_GRAPHQL_ADMIN_SECRET` | Hasura admin secret for server-to-server calls |
| `HASURA_GRAPHQL_JWT_SECRET` | Hasura JWT verification secret |
| `NEXT_PUBLIC_API_BASE_URL` | WARP web API base URL |
| `NEXT_PUBLIC_AIAPI_BASE_URL` | AI microservice base URL |
| `Email_From` | Default sender email address |
| `EMAIL_SMTP_HOST/PORT/SECURE/USER/PASSWORD` | SMTP config |
| `NODE_ENV` | Environment |
| `S3_BUCKET*` | S3 bucket name, region, access key, secret key, backup bucket |
| `NEXT_PUBLIC_HASURA_GRAPHQL_ADMIN_SECRET` | Client-accessible admin secret [QA: exposing admin secret to client is a security risk] |
| `AI_SERVICES_AUTHORIZATION` | Auth token for AI microservice requests |
| `DOCUMENT_EXPIRY_NOTIFICATION_WEBHOOK_SECRET` | Webhook signature secret |

**Pipeline tasks**:

| Task | Depends on | Outputs | Cache |
|---|---|---|---|
| `build` | `^build` (dependencies must build first) | `dist/**`, `.next/**` | yes (default) |
| `lint` | — | none | yes (default) |
| `dev` | — | — | no (`"cache": false`) |
| `dev:directus` | — | — | no |
| `start:docker` | — | — | no |
| `dev:docker` | — | — | no |
| `dev:hasura` | — | — | no |
| `codegen` | — | — | no |

The `^build` dependency ensures packages are built before the apps that consume them.

---

### `Dockerfile`

```dockerfile
FROM node:20
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn install
WORKDIR /usr/src/app/apps/web
RUN yarn run build
EXPOSE 3000
CMD "yarn" "run" "start"
```

**Notes**:
- Uses Node 20 image (different from Volta-pinned Node 18 — [QA] minor version mismatch)
- Copies the entire monorepo into the image
- Runs `yarn install` at the monorepo root (installs all workspaces)
- Builds only `@warp/web` (changes to `WORKDIR apps/web` before build)
- Runs `yarn start` in `apps/web` (which maps to `next start`)
- Exposes port 3000

**Optimization opportunities** [QA]:
- No `.dockerignore` mentioned — the entire repo (including migrations, docs) gets copied
- `yarn install` at root installs all devDependencies across all workspaces unnecessarily
- No multi-stage build to reduce image size

---

### `apps/web/next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["jsx", "js", "tsx", "ts"],
  transpilePackages: [
    "@warp/client",
    "@warp/server",
    "@warp/graphql",
    "@warp/shared",
    "@warp/secrets",
  ],
  experimental: {
    esmExternals: false,
    instrumentationHook: true, // enables instrumentation.ts
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.fs = false; // prevents fs import errors in browser
    }
    return config;
  },
};
```

**Key decisions**:
- `transpilePackages`: All `@warp/*` packages are transpiled by Next.js (TypeScript source consumed directly — no pre-build step for packages)
- `instrumentationHook: true`: Enables `instrumentation.ts` which loads AWS Secrets Manager at server boot
- `esmExternals: false`: Disables ESM externals optimization (compatibility fix)
- `fs: false` fallback: Prevents `@aws-sdk` or other Node-only modules from breaking browser bundle

---

### `.eslintrc.js` (root)

Not directly inspected, but referenced packages (`eslint-config-custom`) extend:
- `eslint-config-next` (Next.js recommended rules)
- `eslint-config-prettier` (disables style rules that conflict with Prettier)

---

### `apps/hasura/docker-compose.yaml`

Local development Docker Compose stack:

```yaml
services:
  postgres:
    image: postgres:12
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: postgrespassword
  graphql-engine:
    image: hasura/graphql-engine:v2.10.0.cli-migrations-v3
    ports: ["8080:8080"]
    volumes:
      - ./migrations:/hasura-migrations
      - ./metadata:/hasura-metadata
    environment:
      HASURA_GRAPHQL_ADMIN_SECRET: mylocaladminsecretkey
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
```

The `cli-migrations-v3` image tag means Hasura automatically applies migrations and metadata on startup.

---

### `apps/hasura/config.yaml`

```yaml
version: 3
endpoint: https://e9jbguzixb.us-west-2.awsapprunner.com
metadata_directory: metadata
actions:
  kind: synchronous
  handler_webhook_baseurl: http://localhost:3000
```

Points the Hasura CLI at the production App Runner endpoint. The `handler_webhook_baseurl` of `http://localhost:3000` means Hasura Action handlers would be expected at the local dev server. Since there are no Actions defined, this is moot.

---

### `packages/configs/api.config.ts`

```typescript
export const getGraphqlApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  console.log("GraphQL API URL:", url);  // [QA] logs URL on every call in production
  return process.env.NEXT_PUBLIC_GRAPHQL_API_URL
    ?? "https://2bcfdg2um2.ap-south-1.awsapprunner.com/v1/graphql"; // [QA] hardcoded prod fallback
};
```

[QA] The `console.log` fires on every page load and API call that reads the URL. Should be removed or guarded by `NODE_ENV !== 'production'`.

---

## Environment Variables Reference

### Required at runtime

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GRAPHQL_API_URL` | `@warp/configs` | Hasura GraphQL endpoint (client-visible) |
| `HASURA_GRAPHQL_ADMIN_SECRET` | `@warp/configs`, API routes | Server-to-Hasura admin access |
| `HASURA_GRAPHQL_JWT_SECRET` | `apps/web/api/v1/platform/auth/signin.ts` | Signs user JWTs (must match Hasura config) |
| `NEXTAUTH_SECRET` | NextAuth | JWT session secret |
| `NEXTAUTH_URL` | NextAuth | App base URL for callbacks |
| `NEXT_PUBLIC_API_BASE_URL` | `@warp/configs` | WARP API base URL |
| `NEXT_PUBLIC_AIAPI_BASE_URL` | AI routes | AI microservice base URL |
| `S3_BUCKET` | `@warp/server/services/aws-s3.service` | S3 bucket name |
| `S3_BUCKET_REGION` | aws-s3 service | AWS region |
| `S3_BUCKET_ACCESS_KEY` | aws-s3 service | AWS access key |
| `S3_BUCKET_SECRET_ACCESS_KEY` | aws-s3 service | AWS secret key |
| `S3_BUCKET_BACKUP` | aws-s3 service | Backup bucket name |
| `AI_SERVICES_AUTHORIZATION` | AI routes | Bearer token for AI microservice |
| `DOCUMENT_EXPIRY_NOTIFICATION_WEBHOOK_SECRET` | webhook route | Webhook validation secret |

### Email

| Variable | Purpose |
|---|---|
| `Email_From` | Default sender email |
| `EMAIL_SMTP_HOST` | SMTP host |
| `EMAIL_SMTP_PORT` | SMTP port |
| `EMAIL_SMTP_SECURE` | TLS (`"true"` / `"false"`) |
| `EMAIL_SMTP_USER` | SMTP username |
| `EMAIL_SMTP_PASSWORD` | SMTP password |

### OPs integration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_PRO_API_URL` | OPs GHG calculator API URL (used by check-company-eligibility) |

### Optional / AI

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_HASURA_GRAPHQL_ADMIN_SECRET` | [QA] Client-visible admin secret — exposes admin access from browser |
| `NEXT_RUNTIME` | Checked in `instrumentation.ts` (`=== 'nodejs'`) |

### AWS Secrets Manager

All the above variables are loaded from AWS Secrets Manager at server boot via `@warp/secrets/load-environment.ts`. The specific secret name(s) are configured in `packages/secrets/secrets-manager.service.ts`.

---

## Turborepo Caching Behavior

- **Build outputs** (`dist/**`, `.next/**`) are cached and shared across CI runs
- **Dev mode** is never cached (`"cache": false`)
- **Codegen** is not cached — always re-runs
- Cache is invalidated if any `globalEnv` variable changes
- Remote caching is supported (requires Vercel account / `npx turbo link`)
