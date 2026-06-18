# OPs GHG Calculator — Configuration Reference

---

## `package.json`

**Name:** `snowkap-op` | **Version:** `0.1.0` | **Private:** true

### Engine constraints
```json
{ "node": ">=16.0.0", "yarn": ">=1.22.0" }
```
npm is blocked. All commands must use `yarn`.

### Scripts

| Script | Command | When used |
|---|---|---|
| `dev` | `next dev --turbopack` (APP_ENV=live) | Local development (live env) |
| `dev:beta` | Next dev (APP_ENV=beta) | Local development (beta env) |
| `dev:demo` | Next dev (APP_ENV=demo) | Local development (demo env) |
| `build` | `next build` | Production build; also runs as pre-push hook |
| `start` | `next start` | Production server |
| `lint` | ESLint | Runs as pre-commit hook |
| `prettier` | Prettier | Manual formatting |
| `codegen` | GraphQL codegen (live) | Regenerate typed GraphQL hooks |
| `codegen:beta` / `codegen:demo` / `codegen:live` | GraphQL codegen per env | Per-environment codegen |
| `pre:secrets` | `scripts/load-secrets.mjs` | Load AWS Secrets Manager into env |

### Volta (Node version pin)
```json
{ "node": "20.19.5" }
```
**[QA]** Dockerfile uses `node:18` but Volta pins `node:20`. Mismatch between container and local dev environments.

---

## `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Adds node-loader for .node native modules
    config.module.rules.push({ test: /\.node$/, use: [{ loader: "node-loader" }] });
    return config;
  },
  async headers() {
    return [{
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" },          // [QA: wildcard CORS]
        { key: "Access-Control-Allow-Methods", value: "GET, DELETE, PATCH, POST, PUT, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "... X-Sk-Op-Authorization" },
      ],
    }];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }   // strips console.log in prod, keeps console.error
      : false,
  },
  // env: loadTargetEnv(process.env.APP_ENV!)  ← commented out
};
```

**Key behaviours:**
- CORS is open (`*`) on all `/api/*` routes — review before any public-facing deployment **[QA]**
- `removeConsole` active in production (only `error` kept)
- `node-loader` needed for native `.node` binary modules (likely `canvas` or `better-sqlite3`)
- The `loadTargetEnv` call is commented out — environment loading is handled at runtime via `scripts/load-secrets.mjs`

---

## `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals", "next", "eslint:recommended"],
  "globals": { "React": "readonly" },
  "rules": {
    "no-unused-vars": "off",
    "no-unused-args": "off",
    "no-extra-boolean-cast": "off",
    "no-empty": "off"
  }
}
```

**[QA]** `no-unused-vars` is disabled — unused variables won't surface in lint. This can mask dead code during development.

---

## `.prettierrc`

```json
{ "trailingComma": "es5", "tabWidth": 2, "semi": true, "singleQuote": false }
```

Standard config: 2-space indent, semicolons, double quotes, trailing commas in ES5 positions.

---

## `.nvmrc`

Specifies the Node version for nvm users. Should match Volta pin (`20.19.5`).

---

## `.yarnrc.yml`

Yarn Berry configuration. Sets `nodeLinker` and other Yarn package manager settings. Ensures consistent dependency resolution across environments.

---

## `Dockerfile`

```dockerfile
FROM node:18
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN yarn install
RUN yarn run build
EXPOSE 3000
CMD "yarn" "run" "start"
```

**[QA]** Node 18 in Dockerfile vs. Node 20 pinned via Volta. Potential compatibility issues if any dependency is Node 20-specific.

**[QA]** No `.dockerignore` visible — `node_modules` may be copied before `yarn install`, wasting layer cache.

**[QA]** No non-root user — container runs as root by default. Security hardening recommended.

No multi-stage build — the image includes all dev dependencies, increasing final image size.

---

## `.husky/` — Git Hooks

| Hook | Command | Trigger |
|---|---|---|
| `commit-msg` | `npm run commitlint` | Validates commit message against Conventional Commits spec on every `git commit` |
| `pre-commit` | `yarn lint` | Runs ESLint on staged files before commit completes |
| `pre-push` | `yarn build` | Full production build must succeed before push is allowed |

**Conventional Commit types enforced:** `feat`, `fix`, `chore`, `refactor`, `style`, `perf`, `docs`, `test`, `build`, `ci`, `revert`

**[QA]** `commit-msg` hook calls `npm run commitlint` but the project blocks npm (engine config). Should be `yarn commitlint`. May fail in environments where only yarn is available.

---

## `codegen.ts`

GraphQL Code Generator configuration. Generates TypeScript types and SDK from `.gql` files.

**Strategy:** near-operation-file preset — generated files appear next to their `.gql` source as `*.generated.tsx`

**Environments:** Separate configs for `live`, `beta`, `demo` — each points to that environment's Hasura endpoint

**Outputs:**
- Per-operation typed documents (browser Apollo hooks)
- Shared server SDK (`graphql/shared/sdk.ts`) via `graphql-request`
- Global type definitions in `graphql/shared/types.ts`

**Rule:** Never edit `*.generated.tsx` files directly. Re-run `yarn codegen` after any `.gql` change.

---

## `scripts/load-secrets.mjs`

Runs at application startup (before `next start` or `next dev`) to load secrets from AWS Secrets Manager into `process.env`.

- Targets the secret named for the current `APP_ENV` (e.g. `snowkap-op-live`)
- Parses the JSON secret and merges all key/value pairs into `process.env`
- Must run before `getServerEnv()` is called — `getServerEnv()` assumes all variables are already in environment

**[QA]** No test framework configured. There are no unit or integration tests anywhere in the codebase. The only automated quality gate is ESLint (pre-commit) and a successful production build (pre-push).

---

## `tailwind.config.ts`

TailwindCSS configuration. Scopes purging to `app/`, `components/`, `features/`, `lib/`, `shared/`. Uses `@mantine/core` PostCSS preset to ensure Mantine and Tailwind class utilities coexist without conflicts.

---

## `tsconfig.json`

TypeScript strict mode. Path alias `~/` maps to the project root. `moduleResolution: "bundler"` for Next.js 15 compatibility. Target: `ES2017`.

---

## `.vscode/settings.json` & `.vscode/launch.json`

VS Code workspace settings for consistent developer experience. `launch.json` configures a Node.js debug attach profile for the Next.js server process.

---

## `Get-UniqueFiles.ps1`

PowerShell script for Windows developers. Lists unique files across the project (likely used for audit or context gathering). Not part of the application runtime.
