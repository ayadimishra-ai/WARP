# QA: `v1/platform/company/index.ts` + `v1/platform/company/[companyId].ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Pattern (both files)

These two files are copy-paste variants of the same CRUD pattern. All shared issues apply to both.

---

## Issues Found

### [CRITICAL-1] No authentication on company create/update/delete

Neither file has any JWT verification or session check. Any unauthenticated HTTP client can:
- `POST /api/v1/platform/company` → create a company in any platform
- `PUT /api/v1/platform/company` → update any company
- `DELETE /api/v1/platform/company/[companyId]` → delete any company by ID

These are destructive operations on core tenant data with zero access control.

---

### [CRITICAL-2] `req.body[0].primaryContact.email` without null guard — crash on malformed body

**`index.ts` line 39**

```typescript
req.body[0].primaryContact.email = await choosemethod(
  req.body[0].primaryContact.email,
  "encrypt"
);
```

If `req.body` is not an array, or if `req.body[0]` is missing, or if `primaryContact` is absent, this throws `TypeError: Cannot read properties of undefined`. The catch block uploads this to S3 and returns 500, but the root cause is an unvalidated body shape. Sensitive encryption logic should only run after schema validation.

---

### [HIGH-1] `companyId` from URL params not validated as string

**`[companyId].ts` lines 25–27, 42**

```typescript
const companyDetail = await sdk.getCompanyDetailById({ id: req.query.companyId });
// ...
const responseData = await deleteCompany(req.query.companyId);
```

`req.query.companyId` is typed `string | string[]`. If the URL contains `?companyId=a&companyId=b`, this is an array and the DB query receives an unexpected type. Add: `const id = Array.isArray(req.query.companyId) ? req.query.companyId[0] : req.query.companyId;`

---

### [HIGH-2] 409 Conflict used for "not found" — wrong status code

**`[companyId].ts` line 29**

```typescript
res.status(409).send({ error: { message: "Company Details not exist..." } });
```

`409 Conflict` means the request conflicts with current resource state (e.g., duplicate insert). "Record not found" is `404 Not Found`.

---

### [HIGH-3] Missing body returns 405 instead of 400

**`index.ts` lines 28–37** (same pattern in user/index.ts)

A missing request body is a client error (400 Bad Request), not a method error (405 Method Not Allowed).

---

### [MEDIUM-1] Raw error object in 500 response

**Both files line 65/55**

```typescript
res.status(500).json({ error: error || "Internal Server Error" });
```

`error` is the full `Error` object. Should be `error?.message || "Internal Server Error"`.

---

### [MEDIUM-2] Redundant `if (req.method === "DELETE")` check

**`[companyId].ts` line 41**

Method is already validated to be `"DELETE"` on line 12. The second `if (req.method === "DELETE")` is always true — dead conditional.

---

### [MEDIUM-3] Not using shared `ApiErrorGuard` / `ApiMethodGuard`

Manual method checks and try/catch instead of the project's standard HOF guards.

---

### [LOW-1] Typo in comment: "Compnay Details Delete Section"

**`[companyId].ts` line 40** — "Compnay" → "Company".

---

## Summary Table

| ID | Severity | File(s) | Line(s) | Issue |
|---|---|---|---|---|
| CRITICAL-1 | Critical | both | whole file | No authentication |
| CRITICAL-2 | Critical | index.ts | 39 | `req.body[0].primaryContact.email` without null guard |
| HIGH-1 | High | [companyId].ts | 25, 42 | `req.query.companyId` not guarded against `string[]` |
| HIGH-2 | High | [companyId].ts | 29 | 409 Conflict for "not found" (should be 404) |
| HIGH-3 | High | index.ts | 28–37 | Missing body returns 405 instead of 400 |
| MEDIUM-1 | Medium | both | 65/55 | Raw error object in 500 response |
| MEDIUM-2 | Medium | [companyId].ts | 41 | Redundant `if (req.method === "DELETE")` check |
| MEDIUM-3 | Medium | both | — | Not using shared ApiErrorGuard/ApiMethodGuard |
| LOW-1 | Low | [companyId].ts | 40 | Typo "Compnay" in comment |
