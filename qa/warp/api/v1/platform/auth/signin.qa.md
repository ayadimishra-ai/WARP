# QA: `apps/web/pages/api/v1/platform/auth/signin.ts`

**Status:** CRITICAL + HIGH issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] JWT signed with literal `"undefined"` when env var is missing

**Lines 20, 281**

```typescript
const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
// ...
const accessToken = jwt.sign(jwtClaims, String(HASURA_GRAPHQL_JWT_SECRET), {
  algorithm: "HS256",
  expiresIn: "24h",
});
```

If `HASURA_GRAPHQL_JWT_SECRET` is not set, `process.env["HASURA_GRAPHQL_JWT_SECRET"]` is `undefined`. `String(undefined)` produces the literal string `"undefined"`. The JWT is then signed with `"undefined"` as the secret — a predictable, publicly-known value. Any attacker who knows this can forge valid JWTs for any user/platform on this Hasura instance.

**Fix:** Fail fast at module load time:

```typescript
const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) {
  throw new Error("HASURA_GRAPHQL_JWT_SECRET environment variable is required");
}
```

---

### [HIGH-1] Header presence check is permanently bypassed

**Lines 118–127**

```typescript
const sharedKey = String(req.headers["x-warp-shared-key"]);
const secretKey = String(req.headers["x-warp-shared-secret"]);
const validHeaders = sharedKey && secretKey;

if (!validHeaders)
  throw CustomError({ statusCode: 400, message: "Required headers are missing" });
```

`req.headers[...]` returns `string | string[] | undefined`. Wrapping with `String()` turns `undefined` into the string `"undefined"`, which is truthy. So `validHeaders` is always truthy regardless of whether the headers were actually sent — the guard never fires.

The practical impact is limited because the DB lookup (`sdk.getPlatformAndUserDetailsToGenerateToken`) still fails without a real key. But the guard creates a false sense of security and masks malformed requests as 401 rather than 400.

**Fix:**

```typescript
const sharedKey = req.headers["x-warp-shared-key"];
const secretKey = req.headers["x-warp-shared-secret"];
if (!sharedKey || !secretKey || typeof sharedKey !== "string" || typeof secretKey !== "string") {
  throw CustomError({ statusCode: 400, message: "Required headers are missing" });
}
```

---

### [HIGH-2] Email encrypted after `requestBody` is captured — encryption has no effect on DB query

**Lines 129–138**

```typescript
const requestBody = await PlatformAuthSigninHandlerBodySchema.validate(req.body);
req.body.userEmail = await choosemethod(req.body.userEmail, "encrypt");
const platformIdAndUserDetails = await sdk.getPlatformAndUserDetailsToGenerateToken({
  sharedKey,
  secretKey,
  ...requestBody,  // ← uses plain email, not the encrypted one
});
```

`requestBody` is created from `req.body` before the encryption on line 132. The spread `...requestBody` passes the original plain-text email to the Hasura SDK query. The encryption on line 132 modifies `req.body.userEmail` but has no effect because `requestBody` is a snapshot already taken. The email stored in the DB is therefore matched against the plain-text value.

This may be intentional (email in DB is stored plain-text), but then the encryption call on line 132 is dead code. Or the DB stores encrypted email and the lookup will never match. Either way, the logic is contradictory and must be clarified.

**Fix:** Clarify intent. If email is stored plain in the DB, remove the encryption call. If stored encrypted, the validation and SDK call must both use the encrypted value.

---

### [MEDIUM-1] `role.roleName` passed twice to `buildHasuraClaims`

**Lines 271–279**

```typescript
const jwtClaims = buildHasuraClaims(
  platform.id,
  user.id,
  user.companyId,
  user.email,
  role.roleName as any,   // arg 5
  userAIDetails,
  role.roleName           // arg 7 — same value passed again
);
```

`role.roleName` appears at positions 5 and 7. If the function has different semantics for these parameters (e.g., arg 5 = role type, arg 7 = default role), passing the same value both times may be correct — but the `as any` cast hides a potential type mismatch. Verify `buildHasuraClaims` function signature.

---

### [MEDIUM-2] `addOPSToIQCurationFromSubscriptions` takes `sdk` as `any` param shadowing module import

**Lines 72–115**

```typescript
const addOPSToIQCurationFromSubscriptions = async (
  aiPlanDetails: any[],
  aiSubscriptions: any[],
  sdk: any    // ← shadows module-level sdk import
): Promise<void> => {
```

The module already imports `sdk` at the top level. Passing it as a parameter typed `any` and shadowing the import is confusing and defeats type checking. Use the module-level `sdk` directly inside the function.

---

### [MEDIUM-3] Pervasive `any[]` typing in AI utility functions

**Lines 28–30, 30, 73–75**

```typescript
const generateUserAIDetails = (aiSubscriptions: any[], forms: any[])
const aiPlanDetails: any[] = [];
```

All AI-related data is typed as `any[]`, nullifying TypeScript's safety guarantees. The generated `@warp/graphql` SDK has proper types for `AISubscriptions`, `Form`, etc.

---

### [MEDIUM-4] Large block of commented-out legacy code

**Lines 193–269**

~80 lines of commented-out legacy code under `#region Legacy code`. Should be deleted — it's preserved in git history.

---

### [LOW-1] `console.log` statements in the signin path

**Lines 83, 107, 109**

`console.log("[OPSToIQCuration] ...")` statements fire on every signin for eligible users. Leaks internal form IDs and plan names to server logs. Should use a structured logger or be removed.

---

### [LOW-2] Only first UserRole used — multi-role users silently truncated

**Line 232**

```typescript
const role = user?.UserRoles[0];
```

If a user has multiple roles, all roles after the first are ignored. This may be intentional (WARP's model appears to be one-role-per-user-per-company), but there is no assertion or error if `UserRoles.length > 1`. A silent data truncation.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | 20, 281 | JWT signed with `"undefined"` if env var missing |
| HIGH-1 | High | 118–127 | Header guard permanently bypassed by `String(undefined)` |
| HIGH-2 | High | 129–138 | Email encryption after snapshot — has no effect on DB query |
| MEDIUM-1 | Medium | 271–279 | `role.roleName` passed twice to `buildHasuraClaims` |
| MEDIUM-2 | Medium | 72–75 | `sdk` param shadows module import, typed as `any` |
| MEDIUM-3 | Medium | 28–30 | Pervasive `any[]` in AI utility functions |
| MEDIUM-4 | Medium | 193–269 | ~80 lines of commented-out dead code |
| LOW-1 | Low | 83, 107, 109 | `console.log` in signin path leaks form IDs |
| LOW-2 | Low | 232 | First UserRole only; multi-role silently truncated |

---

## Fixed File

See `signin.fixed.ts` in this directory.
