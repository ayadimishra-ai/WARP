---
description: "Use when editing apps/web Next.js, React, GraphQL, middleware, auth, API routes, or feature modules. Covers environment traps, codegen, file placement, and active architecture choices."
applyTo: "apps/web/**"
---

# Web App Instructions

- `apps/web` scripts hard-code `APP_ENV=live`. If you need `local`, `alpha`, `beta`, or `demo`, run the underlying command directly from `apps/web`, for example `cross-env APP_ENV=local next dev --turbopack`.
- After any `.gql` change, run `pnpm --dir apps/web codegen`. Do not hand-edit `.generated.tsx`, `src/graphql/types.ts`, or `src/graphql/server/generated.ts`.
- Prefer `src/modules/<feature>/` for feature logic. Use `src/app/` for routing, layouts, and route handlers; do not add new application routes under `src/pages/`.
- GraphQL is the default data path for business data. Use generated Apollo hooks on the client and the server SDK from `src/graphql/server/generated.ts` on the server. Use Drizzle for auth tables or direct SQL cases that bypass Hasura.
- Better-Auth is the active auth system. Do not add new work through `next-auth` even though it still exists in dependencies.
- New unauthenticated routes must be added to `src/middleware.ts` `publicPaths`, or middleware will block them.
- Never import `src/lib/env/env.server.ts` into client components. Pass browser-safe values through server components or `env.client.ts`.
- API routes live under `src/app/api/<segment>/route.ts`. Follow the existing one-directory-per-endpoint layout.
- When validating web changes, prefer the narrowest relevant check: `pnpm --dir apps/web lint`, `pnpm --dir apps/web build`, or `pnpm --dir apps/web codegen`.