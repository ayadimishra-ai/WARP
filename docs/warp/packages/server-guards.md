# QA: packages/server/guards

**Files covered:**
- `packages/server/guards/api-error.guard.ts`
- `packages/server/guards/api-method.guard.ts`
- `packages/server/guards/api-hasura-webhook-guard.ts`
- `packages/server/guards/embedded-auth-guard.ts`

**Status:** CRITICAL issue found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `api-hasura-webhook-guard.ts`

### [CRITICAL-1] Hardcoded webhook authentication key in source code

**Lines 4–5:**
```typescript
const AUTH_KEY =
  "0137ceae819f42f37940acfbbb54db1aaf2162ee973581e695f9ec4f13389d56";
```

The Hasura webhook secret is committed to the repository in plaintext. Anyone with repository read access — developers, CI systems, contributors — has the key. This key authenticates all incoming Hasura webhook calls (event triggers, action handlers).

**Fix:** Move to `process.env.HASURA_WEBHOOK_SECRET` and throw on startup if the env var is missing.

### [HIGH-1] Timing-unsafe string comparison on webhook secret

**Line 13:**
```typescript
if (req.headers["authorization"] !== AUTH_KEY) {
```

Simple string equality is vulnerable to timing attacks. An attacker sending millions of slightly-varying keys can measure response time differences to infer the correct key character by character.

**Fix:** Use `crypto.timingSafeEqual(Buffer.from(incoming), Buffer.from(AUTH_KEY))`.

---

## `embedded-auth-guard.ts`

### [MEDIUM-1] `jwt.decode()` before `jwt.verify()` — unnecessary and misleading

**Lines 31–33:**
```typescript
const accessToken = String(context.query.accessToken);
const decodedToken: any = jwt.decode(accessToken);
if (!!decodedToken) { ... }
```

The guard decodes the token first (no signature verification) to extract `platformId`, queries the DB, then finally calls `jwt.verify()` at line 52. While the guard ultimately **does verify** the signature before accepting the session (correct result), the pattern is unnecessary: `jwt.verify()` itself decodes and returns the payload. The initial `jwt.decode()` allows any crafted JWT to trigger a DB lookup for the embedded platform ID.

**Fix:** Attempt `jwt.verify()` first; if it succeeds, use the decoded payload to look up the platform.

### [MEDIUM-2] Access token in URL query parameter

**Line 31:** `context.query.accessToken` — the token arrives via `?accessToken=<token>` in the URL. This appears in browser history, web server access logs, upstream proxy logs, and HTTP Referer headers on navigation.

**Fix:** Accept the token via a `POST` body or a cookie rather than a query parameter. If GET must be used for embed compatibility, ensure the token is short-lived (< 5 minutes).

### [LOW-1] Returns `{ session: null }` on auth failure instead of redirect

**Lines 69–71:**
```typescript
return {
  props: { session: null },
};
```

All pages using `embeddedAuthGuard` must individually handle `session: null` to avoid rendering sensitive content to unauthenticated users. A redirect to a login/error page would be safer as a default.

---

## `api-method.guard.ts`

### [LOW-1] `console.log` on every request

**Line 21:**
```typescript
console.log({ method, req: req.method, isValid });
```

Logs every API method check to stdout/server logs. In production this is log pollution and may obscure real errors.

**Fix:** Remove the console.log.

---

## `api-error.guard.ts`

### [LOW-1] Full error details returned to HTTP client

**Lines 34–41:** The error response includes all enumerable properties of the caught error object via `Object.getOwnPropertyNames(error)`. If the error contains internal paths, DB queries, or config values in its message or properties, they are returned to the HTTP client.

**Fix:** In production, return only `message` and `code` to the client; keep full details in server-side logs/S3 only.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | api-hasura-webhook-guard.ts | Hardcoded webhook secret in source code |
| HIGH-1 | High | api-hasura-webhook-guard.ts | Timing-unsafe string comparison for auth key |
| MEDIUM-1 | Medium | embedded-auth-guard.ts | jwt.decode() before jwt.verify() — unnecessary decode step |
| MEDIUM-2 | Medium | embedded-auth-guard.ts | Access token in URL query parameter |
| LOW-1 | Low | embedded-auth-guard.ts | Returns session: null instead of redirect on auth failure |
| LOW-2 | Low | api-method.guard.ts | console.log on every request |
| LOW-3 | Low | api-error.guard.ts | Full error object returned to HTTP client |
