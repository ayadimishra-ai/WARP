# QA: Recommendation API Routes (6 files)

**Files covered:**
- `recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee.ts`
- `recommendation/email-on-manually-raising-the-recommendations.ts`
- `recommendation/email-when-a-recommendation-is-reopened.ts`
- `recommendation/email-when-the-actions-taken-on-the-recommendations-are-approved.ts`
- `recommendation/reminder/recommendation-reminder-post-duedate.ts`
- `recommendation/reminder/recommendation-reminder-pre-duedate.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issues (all 6 files)

### [CRITICAL-1] No authentication on any recommendation email route

None of the 6 routes verifies a JWT or session. Any caller can trigger recommendation action emails or reminder campaigns for any `companyId` / `formId` / `recommendation`.

---

### [HIGH-1] No HTTP method restriction (all 6 files)

All 6 routes export `handler` directly with no `ApiMethodGuard` wrapper. Any HTTP method is accepted; GET requests with no body will crash in service calls.

---

## File-Specific Issues

### `email-on-manually-raising-the-recommendations.ts`, `email-when-a-recommendation-is-reopened.ts`, `email-when-the-actions-taken-on-the-recommendations-are-approved.ts`

#### [HIGH-2] `response?.indexOf("OK") !== -1` — returns HTTP 200 on null response

```typescript
if (response?.indexOf("OK") !== -1) {
  res.status(200).send(...);
} else {
  res.status(400).send(...);
}
```

When `response` is `null` or `undefined`, optional chaining returns `undefined`. `undefined !== -1` evaluates to `true`, so the condition succeeds and HTTP 200 is returned even though the email operation failed. The `else` (400) branch is never reached on service failure.

**Fix:** Check for success explicitly:
```typescript
if (response?.indexOf("OK") !== -1 && response !== undefined) { ... }
// or
if (typeof response === "string" && response.indexOf("OK") !== -1) { ... }
```

---

### `recommendation-reminder-post-duedate.ts` + `recommendation-reminder-pre-duedate.ts`

#### [CRITICAL-2] `String(req.headers["x-warp-shared-key"])` — auth bypass via `String(undefined)`

```typescript
const sharedKey = String(req.headers["x-warp-shared-key"]);
```

If the header is absent, `req.headers["x-warp-shared-key"]` is `undefined`. `String(undefined)` = `"undefined"` (a non-empty truthy string). The `sharedKey` is forwarded to the notification service as `"undefined"` — if the service compares loosely, this may be accepted.

**Fix:**
```typescript
const sharedKey = req.headers["x-warp-shared-key"];
if (!sharedKey || typeof sharedKey !== "string") {
  return res.status(401).json({ error: "Missing or invalid shared key" });
}
```

#### [HIGH-3] No rate limiting on cron/reminder endpoints

Neither reminder route uses `withEmailOrIpRateLimitWithProgressiveDelay`. A caller can trigger the full reminder batch at unlimited frequency.

#### [MEDIUM-1] HTTP 200 with `error` field when service returns `undefined`

```typescript
if (response === undefined) {
  res.status(200).send({ data: null, error: "Sending email" });
}
```

HTTP 200 with `error: "Sending email"` is contradictory. If `response === undefined` indicates in-progress or an error, return a non-200 status (202 or 500 respectively).

#### [MEDIUM-2] `error || "Internal Server Error"` — full Error object to client

```typescript
res.status(500).json({ error: error || "Internal Server Error" });
```

#### [LOW-1] `recommendation-reminder-pre-duedate.ts` has commented-out body check (lines 4–10)

```typescript
//if (req.body.type) {
// ...
// }
```

Validation was previously present but was commented out.

---

## Summary Table

| ID | Severity | Files Affected | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | All 6 | No authentication |
| CRITICAL-2 | Critical | reminder (both) | `String(undefined)` bypass on shared key |
| HIGH-1 | High | All 6 | No HTTP method restriction |
| HIGH-2 | High | 3 email routes | `response?.indexOf("OK") !== -1` returns 200 on null response |
| HIGH-3 | High | reminder (both) | No rate limiting |
| MEDIUM-1 | Medium | reminder (both) | HTTP 200 returned when response is `undefined` |
| MEDIUM-2 | Medium | reminder (both) | Full Error object in 500 response |
| LOW-1 | Low | pre-duedate | Commented-out body validation |
