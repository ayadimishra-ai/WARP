# QA: `apps/web/pages/api/v1/ops/check-company-eligibility.ts`

**Status:** Medium issues — better-written route  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Overview

One of the better-implemented routes in the codebase: uses `ApiErrorGuard` + `ApiMethodGuard`, validates required params, checks env vars at runtime, uses `AbortController` for timeout, and handles upstream errors gracefully. Issues below are improvements.

---

## Issues Found

### [HIGH-1] No authentication — leaks OPS company data to any caller

No JWT or session check. Any unauthenticated caller who provides a `companyId` query param receives `opsCompanyId`, `opsCompanyName`, and `isActive` from the OPS system. While the data returned when `eligible: false` is minimal, a `true` response leaks internal OPS IDs and company names.

---

### [HIGH-2] `AI_SERVICES_AUTHORIZATION` token used as auth header — may be a shared secret exposed to frontend

**Line 27, 57**

```typescript
const authToken = process.env.AI_SERVICES_AUTHORIZATION;
// ...
'authorization': authToken,
```

The env var name `AI_SERVICES_AUTHORIZATION` suggests this may be a shared bearer token for calling AI/OPS microservices. Using it as a proxy from a Next.js API route means this token is only one server-compromise away from leaking. Verify this token is server-only and never accessible from the client bundle.

---

### [MEDIUM-1] Catch block catches its own `CustomError` throws and returns 200

**Lines 96–105**

```typescript
} catch (error: any) {
  if (error?.statusCode >= 500) throw error;
  // ...
  return res.status(200).json({
    data: { eligible: false },
    error: "Failed to check company eligibility",
  });
}
```

The outer `try/catch` at line 24 wraps the inner try/finally (line 51). If the AbortController fires (60s timeout), the `fetch` rejects with an `AbortError`, which is caught here and silently returns `eligible: false`. Callers have no way to distinguish "company not in OPS" from "OPS request timed out". Add a distinct error code for timeout scenarios.

---

### [MEDIUM-2] `console.error` used for diagnostics without structured context

**Lines 30, 38, 67, 100**

`console.error` in API routes surfaces in server logs but lacks request context (company ID, trace ID). Should use the shared `logger` from `@warp/shared/utils/logger.util`.

---

### [LOW-1] Redundant null checks on `opsCompanyId`

**Lines 81–83**

```typescript
opsCompanyId !== null &&
opsCompanyId !== undefined &&
opsCompanyId !== ""
```

`opsCompanyId` was already assigned `result?.data?.OPSCompanyId ?? null` — the `?? null` coalesces `undefined` to `null`, making the `!== undefined` check redundant. Simplify to: `Boolean(result?.success && opsCompanyId)`.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| HIGH-1 | High | whole file | No authentication — leaks OPS company data |
| HIGH-2 | High | 27, 57 | `AI_SERVICES_AUTHORIZATION` used as pass-through proxy header |
| MEDIUM-1 | Medium | 96–105 | Timeout silently becomes `eligible: false` — undetectable |
| MEDIUM-2 | Medium | 30, 38, 67, 100 | `console.error` without structured context |
| LOW-1 | Low | 81–83 | Redundant null/undefined checks on `opsCompanyId` |
