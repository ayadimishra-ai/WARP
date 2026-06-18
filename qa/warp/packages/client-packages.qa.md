# QA: packages/client and packages/shared

**Files covered:**
- `packages/client/libs/api-request.ts`
- `packages/client/libs/progressive-delay-rate-limit.ts`
- `packages/client/services/platform-window-message.service.ts` (covered separately)
- `packages/shared/utils/auth-session.util.ts`
- `packages/shared/utils/dom-purifier/dom-purify.client.util.ts`

**Status:** HIGH issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `packages/client/libs/progressive-delay-rate-limit.ts`

### [HIGH-1] IP spoofing via untrusted forwarded headers

The rate limiter reads the client IP from `x-forwarded-for`, `cf-connecting-ip`, `true-client-ip`, and similar headers in cascade. These headers can be set by any HTTP client. An attacker can send requests with forged IPs to bypass rate limits entirely:

```typescript
// Attacker sends: x-forwarded-for: 1.2.3.4
// Then next request: x-forwarded-for: 1.2.3.5
// Each request appears to come from a new IP — rate limit never triggers
```

**Fix:** Only trust forwarded headers from known, trusted proxy IP ranges. If deploying behind Cloudflare, use the Cloudflare IP range allowlist before trusting `cf-connecting-ip`.

### [MEDIUM-1] Rate limit key defaults to `"localhost"` string

When no IP can be extracted from the request, the key defaults to `"localhost"`. If the proxy chain is misconfigured and no forwarded IP headers arrive, all requests share the `"localhost"` key — all traffic is rate-limited as one entity.

**Fix:** Reject the request or use a conservative rate limit when the IP cannot be determined, rather than a shared default key.

### [LOW-1] Silent catch on email extraction

A try/catch around email extraction from the request body swallows errors silently. If body parsing fails, the rate limit falls back to IP-only — no logging.

---

## `packages/client/libs/api-request.ts`

### [MEDIUM-1] Silent auth bypass on session retrieval error

```typescript
try {
  const userSession = getLocalStorageSession(localStorage);
  if (!!userSession?.accessToken) {
    config.headers["Authorization"] = `Bearer ${userSession.accessToken}`;
  }
} catch (e) {
  console.log("WARP:", "api-request", e);
}
```

If `getLocalStorageSession` throws (e.g., corrupted localStorage, SSR context), the request proceeds without an Authorization header. The server receives an unauthenticated request. Whether this causes a real exploit depends on the server's auth guard, but the silent failure masks the root cause.

**Fix:** Propagate the error rather than silently continuing — if the session can't be read, the request should fail or the user should be redirected to login.

### [LOW-1] `x-ai-services-authorization` header set unconditionally

```typescript
config.headers["x-ai-services-authorization"] =
  process.env["AI_SERVICES_AUTHORIZATION"] ?? "";
```

If `AI_SERVICES_AUTHORIZATION` is not set, the header is sent as an empty string on every request. This leaks to any API endpoint that logs request headers that AI services auth is expected but missing.

---

## `packages/shared/utils/auth-session.util.ts`

### [MEDIUM-1] `parseHasuraClaims` uses unverified token for session

```typescript
export const parseHasuraClaims = (decodedToken: any, accessToken: string) => {
  const hasuraClaims = decodedToken?.["https://hasura.io/jwt/claims"];
  // ... builds session from claims
};
```

`decodedToken` is passed in by callers — most callers use `jwt.decode()` (no signature verification). The claims are trusted at face value. This function is used throughout the codebase.

The actual security gate is Hasura's JWT validation on every GraphQL query. However, for server-side API routes that use these claims directly (outside of Hasura), a crafted JWT would succeed.

**Status:** The codebase-wide fix (replacing jwt.decode with jwt.verify in server-side routes) addresses this. For client-side React components, jwt.decode for display is acceptable since Hasura validates queries.

### [LOW-1] localStorage session stored without encryption

User session including email and access token are stored in localStorage as plaintext JSON. XSS on any page of the origin can read these values.

**Mitigation:** HttpOnly cookies for the access token would prevent this. The platform currently uses localStorage by design for the embed iframe flow — this is a known architectural trade-off.

### [LOW-2] Null value detection fails in localStorage reader

```typescript
const data = localStorage.getItem(key);
return data === "null" ? null : JSON.parse(data ?? "null");
```

The check `data === "null"` compares to the string `"null"`. `JSON.parse("null")` returns `null` (JavaScript null), so both paths produce the same result. The check is redundant but harmless.

---

## `packages/shared/utils/dom-purifier/dom-purify.client.util.ts`

### [LOW-1] DOMPurify used on non-HTML values (numbers, booleans)

The sanitizer is invoked on numeric and boolean values through `sanitiseValuesByTypeOfData`. DOMPurify is designed for HTML strings — running it on numbers is harmless but misleading. Numbers are converted to string, sanitized, then parsed back.

### [LOW-2] No depth limit on recursive object sanitization

Objects are recursively sanitized without a depth limit. A deeply nested input (e.g., from malicious API response) could cause a stack overflow. Practical risk is low since inputs come from Hasura-controlled queries.

---

## `pages/embed/form/invitation/[invitationId]/Query/invitationQuery.tsx`

### [HIGH-1] `window.parent?.postMessage(message, "*")` — wildcard target origin

**Line 495:** The invitationQuery page has its own local wildcard postMessage call instead of using the platform-window-message service. This is not covered by the central service fix.

**Fix:** Replace with `import { postParentMessage } from "@warp/client/services/platform-window-message.service"` and use `postParentMessage(message)`.

### [LOW-1] Access token in URL query parameter

`const { accessToken } = query` — token arrives via `?accessToken=` URL parameter. Appears in browser history, proxy logs, and Referer headers.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| HIGH-1 | High | progressive-delay-rate-limit.ts | IP spoofing via untrusted forwarded headers |
| HIGH-2 | High | invitationQuery.tsx | Wildcard postMessage line 495 (local definition) |
| MEDIUM-1 | Medium | progressive-delay-rate-limit.ts | "localhost" fallback key |
| MEDIUM-2 | Medium | api-request.ts | Silent auth bypass on session read error |
| MEDIUM-3 | Medium | auth-session.util.ts | parseHasuraClaims uses unverified token |
| LOW-1 | Low | api-request.ts | Empty x-ai-services-authorization header |
| LOW-2 | Low | auth-session.util.ts | localStorage session stored as plaintext |
| LOW-3 | Low | dom-purify.client.util.ts | No depth limit on recursive sanitization |
