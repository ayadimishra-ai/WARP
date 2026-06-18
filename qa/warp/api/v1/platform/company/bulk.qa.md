# QA: `apps/web/pages/api/v1/platform/company/bulk.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — public bulk company+user insert

No JWT or session check. Any caller can `POST /api/v1/platform/company/bulk` with an arbitrary body and bulk-insert companies and users into any platform. This is one of the most destructive unauthenticated endpoints — a single request can insert thousands of records.

---

### [CRITICAL-2] Body validation commented out — completely unvalidated input

**Line 8**

```typescript
// if (!req.body) throw CustomError({ statusCode: 400, message: "Bad request" });
```

The only body validation is commented out. `req.body` is passed directly to `bulkInsertCompanyWithUsers()` with zero validation. Malformed input, null values, or unexpected shapes will propagate directly to the service layer and database.

**Fix:** Uncomment and expand — add a Yup schema for the expected input shape.

---

### [MEDIUM-1] No batch size limit

`req.body` is passed wholesale to `bulkInsertCompanyWithUsers()`. No upper bound on the number of companies/users per request. Enables unbounded DB writes in a single API call.

---

### [LOW-1] Extra blank lines

**Lines 13–14** — remove.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication |
| CRITICAL-2 | Critical | 8 | Body validation commented out — unvalidated input |
| MEDIUM-1 | Medium | 10 | No batch size limit |
| LOW-1 | Low | 13–14 | Extra blank lines |
