# QA: `apps/web/pages/api/saveAnswers/index.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — any caller can write answers

No JWT verification, no session check, no guard. Any unauthenticated HTTP client can `POST /api/saveAnswers` with an arbitrary body and write answer records to the database. This is the primary data-entry endpoint for the entire form-fill flow.

**Fix:** Add JWT verification via `parseHasuraClaims` (same pattern as other secured routes).

---

### [HIGH-1] `PUT` declared as allowed but never handled

**Lines 10, 37**

```typescript
if (req.method !== "POST" && req.method !== "PUT") { ... } // PUT allowed
// ...
if (req.method === "POST") { ... }                         // only POST handled
```

`PUT` requests pass the method guard but fall through every `if` branch and return no response — the request hangs indefinitely. Either remove `PUT` from the allowed methods list, or implement the `PUT` handler.

---

### [HIGH-2] Missing body guard uses wrong status code

**Lines 23–33**

```typescript
if (!req.body) {
  res.status(405).send({ ... });
}
```

An empty body is a client error (400 Bad Request), not a method error (405 Method Not Allowed). Uses the wrong status code.

**Fix:** `res.status(400)`

---

### [MEDIUM-1] Not using shared API guards (`ApiErrorGuard`, `ApiMethodGuard`)

The file uses a manual try/catch and manual method check instead of the project's standard `ApiErrorGuard` + `ApiMethodGuard` HOF wrappers used by every other route in `v1/`. This is inconsistent and means any future change to the guard pattern won't automatically apply here.

---

### [MEDIUM-2] Error response leaks the raw error object

**Line 51**

```typescript
res.status(500).json({ error: error || "Internal Server Error" });
```

`error` is the full JavaScript `Error` object. In some JSON serialization contexts this exposes `.stack`, `.message`, and internal details to the caller. Should be `error?.message || "Internal Server Error"`.

---

### [MEDIUM-3] Comment says "Create User service" — copy-paste artifact

**Line 35**

```typescript
// Call Create User service with body parameter
```

Incorrect comment copied from a different route. Should be removed.

---

### [LOW-1] `body` intermediate variable is unnecessary

**Line 36**

```typescript
const body = req.body;
const responseData = await saveAnswers(body);
```

`saveAnswers(req.body)` is equivalent. The intermediate `body` variable adds no clarity.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication on answer write endpoint |
| HIGH-1 | High | 10, 37 | `PUT` declared allowed but never handled — hangs |
| HIGH-2 | High | 24 | Empty body returns 405 instead of 400 |
| MEDIUM-1 | Medium | whole file | Not using shared `ApiErrorGuard`/`ApiMethodGuard` |
| MEDIUM-2 | Medium | 51 | Raw error object in 500 response |
| MEDIUM-3 | Medium | 35 | Stale "Create User" comment |
| LOW-1 | Low | 36 | Unnecessary `body` intermediate variable |

---

## Fixed File

See `saveAnswers.fixed.ts` in this directory.
