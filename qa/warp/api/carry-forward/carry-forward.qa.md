# QA: Carry-Forward API Routes (3 files)

**Files covered:**
- `carry-forward-assessment-data/index.ts`
- `carry-forward-assessment-data-userwise/index.ts`
- `carry-forward-suggestions.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `carry-forward-assessment-data/index.ts` + `carry-forward-assessment-data-userwise/index.ts`

### [CRITICAL-1] No authentication (both files)

Neither route verifies a JWT or session. Any caller can POST to carry forward any assessment data between arbitrary submissions.

---

### [HIGH-1] `PUT` accepted by method guard but never handled — request hangs indefinitely (both files)

```typescript
if (req.method !== "POST" && req.method !== "PUT") {
  return res.status(405); // reject all non-POST, non-PUT
}
// ...
if (req.method === "POST") {
  // handle POST
}
// PUT falls through — no response sent
```

A `PUT` request passes the method guard, skips the POST block, and exits the `try` without sending any response. The request hangs indefinitely until the client or server times it out.

**Fix:** Either remove `PUT` from the allowed list or add a PUT handler block.

---

### [MEDIUM-1] Missing body returns HTTP 405 instead of 400 (both files)

```typescript
if (!req.body) {
  res.status(405).send({ error: { message: "Request body is required." } });
}
```

A missing body is a client error (400 Bad Request), not a method error (405 Method Not Allowed).

---

### [MEDIUM-2] `error || "Internal Server Error"` — full Error object to client (both files)

```typescript
res.status(500).json({ error: error || "Internal Server Error" });
```

When `error` is an `Error` object (truthy), the full object is serialized and sent to the client. Use `error?.message`.

---

### [LOW-1] `carry-forward-assessment-data-userwise` increases body size limit to 5 MB without documentation

`bodyParser: { sizeLimit: "5mb" }` is set without any comment explaining why a larger limit is needed.

---

## `carry-forward-suggestions.ts`

### [CRITICAL-2] `jwt.decode()` not `jwt.verify()` — token signature not verified

**Line 21:**
```typescript
const decodedToken: any = jwt.decode(accessToken);
session = parseHasuraClaims(decodedToken, accessToken);
```

Same critical pattern as `submit-form.ts`, `calculate-score/index.ts`, `generate-background-report.ts`, and `progress-report-score.ts`: the token signature is never verified. An attacker can craft a JWT with arbitrary claims.

---

### [HIGH-2] Auth failure returns HTTP 500 instead of 401

**Lines 24–29:**
```typescript
if (!session) {
  return res.status(500).json({ error: { message: "Unauthorized" } });
}
```

Unauthenticated requests return 500, masking auth failures as server errors.

---

### [HIGH-3] No rate limiting

`carry-forward-suggestions.ts` does not use `withEmailOrIpRateLimitWithProgressiveDelay`. Any caller (after auth is fixed) can trigger unlimited background suggestion-processing jobs.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | carry-forward-assessment-data (both) | No authentication |
| CRITICAL-2 | Critical | carry-forward-suggestions.ts | `jwt.decode()` not `jwt.verify()` |
| HIGH-1 | High | carry-forward-assessment-data (both) | PUT accepted but never handled — request hangs |
| HIGH-2 | High | carry-forward-suggestions.ts | Auth failure returns 500 instead of 401 |
| HIGH-3 | High | carry-forward-suggestions.ts | No rate limiting |
| MEDIUM-1 | Medium | carry-forward-assessment-data (both) | Missing body returns 405 instead of 400 |
| MEDIUM-2 | Medium | carry-forward-assessment-data (both) | Full Error object sent to client |
| LOW-1 | Low | carry-forward-assessment-data-userwise | 5 MB body limit undocumented |
