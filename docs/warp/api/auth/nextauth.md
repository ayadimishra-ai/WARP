# QA: `apps/web/pages/api/auth/[...nextauth].ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] Hardcoded backdoor credentials in production auth

**Lines 23–38**

```typescript
if (
  credentials?.email === "admin@warp.com" &&
  credentials?.password === "1234"
) {
  const user: IUser = {
    id: "test-user-id",
    name: credentials?.email,
    email: credentials?.email,
    roles: ["user"],
  };
  return user;
}
```

A hardcoded email/password pair (`admin@warp.com` / `1234`) grants any caller a valid NextAuth session. This bypasses all real authentication and is almost certainly a development stub that was never removed. Any user who discovers this can impersonate an admin-named account.

**Fix:** Remove the hardcoded credential check entirely. The production auth path is `POST /api/v1/platform/auth/signin` using JWT `accessToken`. The `emailPasswordLoginProvider` authorize function should return `null` (effectively disabling the provider) until a real implementation is added.

---

### [HIGH-1] `NEXTAUTH_SECRET` missing at startup is silently tolerated

**Line 6**

```typescript
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
```

If `NEXTAUTH_SECRET` is undefined, NextAuth falls back to a randomly generated secret on each server start. This invalidates all existing sessions on every restart and produces silent, confusing authentication failures in production.

**Fix:** Add a fail-fast check:

```typescript
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}
```

---

### [HIGH-2] Progressive delay disabled on the auth endpoint

**Lines 174–181**

```typescript
export default withEmailOrIpRateLimitWithProgressiveDelay(
  NextAuth(nextAuthoptions),
  {
    limitInterval: 1,
    maxRequestCount: 30,
    progressiveDelay: false,   // ← wrong on an auth endpoint
  }
);
```

`progressiveDelay: false` means repeated failed login attempts are not penalised with increasing wait times. Auth endpoints are the primary target for brute-force attacks — progressive delay must be enabled.

**Fix:** Change to `progressiveDelay: true`.

---

### [MEDIUM-1] ~100 lines of commented-out dead code

**Lines 43–172**

Two large blocks of commented-out code remain: an alternative JWT encode/decode implementation and an alternative `NextAuth()` export. Neither is used. Dead code increases cognitive load and can mislead future developers into thinking these are intended alternatives.

**Fix:** Delete lines 43–172.

---

### [MEDIUM-2] `req` parameter declared but unused in `authorize`

**Line 20**

```typescript
authorize: (credentials, req) => {
```

`req` is declared but never referenced. With `no-unused-vars` disabled in ESLint this is invisible. Minor but contributes to noise.

**Fix:** Remove `req` from the parameter list.

---

### [LOW-1] 30-day non-sliding session token

**Line 41**

```typescript
const tokenMaxAge = 30 * 24 * 60 * 60;
```

JWT sessions issued at login are valid for 30 days with no sliding window. A stolen token remains valid for up to 30 days with no way to invalidate it short of rotating `NEXTAUTH_SECRET` (which invalidates everyone). Consider shorter `maxAge` or implementing token rotation.

**Note:** This is a design trade-off, not a bug. Flag for product/security review.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | 23–38 | Hardcoded backdoor credentials (`admin@warp.com` / `1234`) |
| HIGH-1 | High | 6 | Missing `NEXTAUTH_SECRET` fail-fast check |
| HIGH-2 | High | 179 | `progressiveDelay: false` on auth endpoint |
| MEDIUM-1 | Medium | 43–172 | ~100 lines of commented-out dead code |
| MEDIUM-2 | Medium | 20 | Unused `req` parameter in `authorize` |
| LOW-1 | Low | 41 | 30-day non-sliding session; no revocation mechanism |

---

## Fixed File

See `nextauth.fixed.ts` in this directory.
