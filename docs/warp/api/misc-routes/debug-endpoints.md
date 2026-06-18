# QA: Debug/Test Endpoints — `jwt.ts`, `hello.ts`, `test-logs/index.ts`, `test/secrets-check.ts`

**Status:** CRITICAL — all four are development/test artifacts that should not exist in production  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `jwt.ts` — Token disclosure endpoint

### [CRITICAL-1] Public disclosure of any user's session token

```typescript
const token = await getToken({ req });
res.send({ token });
```

Any caller who knows the endpoint URL (`/api/jwt`) receives the full decoded NextAuth session token (including all Hasura claims: `x-hasura-user-id`, `x-hasura-company-id`, `x-hasura-platform-id`, `x-hasura-allowed-roles`). No authentication required to call the endpoint — but the token returned is for the **requesting user's session**.

In practice: if a user's browser tab is logged in, any other origin in the same browser can trigger a CSRF-style fetch to `/api/jwt` and read the token claims. In browser contexts, this combined with a missing or permissive `SameSite` cookie policy becomes a session data leak.

This file's comment says "This is an example of how to read a JSON Web Token" — it is sample code from the Next-Auth documentation that was committed to the production codebase and never removed.

**Fix:** Delete this file.

---

### [HIGH-1] No HTTP method restriction

Accepts all methods (GET, POST, DELETE, etc.) indiscriminately.

---

## `hello.ts` — Dead code endpoint

### [HIGH-2] Entirely commented out — returns `{ failed: true }` on HTTP 200

```typescript
const handler: NextApiHandler = async (req, res) => {
  try {
    // const response: any = await sendCompanyInvitationEmail(...);
    // ...
  } catch (error) {}
  res.status(200).json({ failed: true });
};
```

All logic is commented out. The endpoint always returns HTTP 200 with `{ failed: true }`. This will confuse any caller who hits the endpoint and reads `failed: true` in what appears to be a success response.

**Fix:** Delete this file.

---

## `test-logs/index.ts` — Intentionally broken endpoint

### [CRITICAL-2] Deliberately parses invalid JSON in production — causes real S3 writes

```typescript
const writeLogs = async () => {
  // Intentionally causing an exception
  const result = JSON.parse("{"); // Invalid JSON syntax
};
```

This handler intentionally throws a `SyntaxError` on every invocation, then catches it and writes an error log to S3 (`uploadError("exception-logs", "exception-logs", errorContent)`). Any caller can trigger real S3 write operations and pollute the `exception-logs` bucket with synthetic test errors.

There is no authentication protecting this endpoint.

**Fix:** Delete this file.

---

## `test/secrets-check.ts` — Secret presence disclosure

### [CRITICAL-3] No authentication — exposes secret load status to any caller

```typescript
const secretsStatus = {
  hasNextAuthSecret: !!serverEnv.NEXTAUTH_SECRET && ...,
  hasHasuraAdminSecret: !!serverEnv.HASURA_GRAPHQL_ADMIN_SECRET && ...,
  hasHasuraJWTSecret: !!serverEnv.HASURA_GRAPHQL_JWT_SECRET && ...,
  hasEmailPassword: !!serverEnv.EMAIL_SMTP_PASSWORD && ...,
  hasS3AccessKey: !!serverEnv.S3_BUCKET_ACCESS_KEY && ...,
  hasS3SecretKey: !!serverEnv.S3_BUCKET_ACCESS_KEY_SECRET && ...,
};
res.status(200).json({ secretsStatus, ... });
```

Any unauthenticated caller learns which production secrets are loaded and which are missing. While values are not exposed, the presence/absence map is useful reconnaissance for an attacker:
- `hasHasuraJWTSecret: false` → JWT signing is using a fallback/weak value
- `hasS3SecretKey: false` → S3 operations may be failing or using default credentials

**Fix:** Delete this file or restrict to internal-only access via a shared-key header verified with `crypto.timingSafeEqual`.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | jwt.ts | Publicly discloses session token claims |
| CRITICAL-2 | Critical | test-logs/index.ts | Intentionally broken — causes real S3 writes |
| CRITICAL-3 | Critical | test/secrets-check.ts | No auth — discloses which production secrets are missing |
| HIGH-1 | High | jwt.ts | No HTTP method restriction |
| HIGH-2 | High | hello.ts | Dead code returns `{ failed: true }` on HTTP 200 |
