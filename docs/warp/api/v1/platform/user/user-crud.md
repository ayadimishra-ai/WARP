# QA: `v1/platform/user/index.ts` + `v1/platform/user/[userId].ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Pattern

These two files are copy-paste variants of the company CRUD routes. All issues are identical in kind. See also `company-crud.qa.md`.

---

## Issues Found

### [CRITICAL-1] No authentication on user create/update/delete

No JWT, no session, no guard. Any unauthenticated HTTP client can:
- `POST /api/v1/platform/user` → create any user in any company
- `PUT /api/v1/platform/user` → update any user
- `DELETE /api/v1/platform/user/[userId]` → delete any user by ID

---

### [HIGH-1] `userId` from URL params not validated as string

**`[userId].ts` lines 25–27, 42**

```typescript
const userDetail = await sdk.getUserDetailById({ id: req.query.userId });
// ...
const responseData = await deleteUser(req.query.userId);
```

`req.query.userId` is `string | string[]`. Array not handled.

---

### [HIGH-2] 409 Conflict for "user not found" — wrong status code

**`[userId].ts` line 29** — should be `404 Not Found`.

---

### [HIGH-3] Missing body returns 405 instead of 400

**`index.ts` lines 23–32** — same as company routes.

---

### [MEDIUM-1] Raw error object in 500 response

**Both files** — `error || "Internal Server Error"` should be `error?.message || ...`.

---

### [MEDIUM-2] Garbled error message in method guard

**`[userId].ts` line 18**

```typescript
message: `${req.method} not Request allowed.`,
```

Should be: `"${req.method} method not allowed."` (copy-paste error).

---

### [MEDIUM-3] Redundant `if (req.method === "DELETE")` check

**`[userId].ts` line 41** — always true after line 12 guard.

---

### [MEDIUM-4] Not using shared `ApiErrorGuard` / `ApiMethodGuard`

---

## Summary Table

| ID | Severity | File(s) | Line(s) | Issue |
|---|---|---|---|---|
| CRITICAL-1 | Critical | both | whole file | No authentication |
| HIGH-1 | High | [userId].ts | 25, 42 | `req.query.userId` not guarded against `string[]` |
| HIGH-2 | High | [userId].ts | 29 | 409 for "not found" (should be 404) |
| HIGH-3 | High | index.ts | 23–32 | Missing body returns 405 instead of 400 |
| MEDIUM-1 | Medium | both | 55/58 | Raw error object in 500 response |
| MEDIUM-2 | Medium | [userId].ts | 18 | Garbled error message string |
| MEDIUM-3 | Medium | [userId].ts | 41 | Redundant DELETE check |
| MEDIUM-4 | Medium | both | — | Not using shared guards |
