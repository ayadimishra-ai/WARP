# QA: Bulk Email & Additional Email Routes (7 files)

**Files covered:**
- `answer-on-assigned-question-bulk-email.ts`
- `assigned-question-bulk-email-invitation.ts`
- `comments-on-question-bulk-email.ts`
- `commentsubmissionuser2-email.ts`
- `question-assign-email-invitation.ts`
- `question-response-email-invitation.ts`
- `email-invitation.ts` (root-level)

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Group 1: Cron-style bulk email routes (answer-on-assigned-question, assigned-question, comments-on-question)

### [CRITICAL-1] `String(req.headers["x-warp-shared-key"])` — auth bypass via `String(undefined)`

All three routes use:
```typescript
const sharedKey = String(req.headers["x-warp-shared-key"]);
await someEmailService(..., sharedKey);
```

If the header is absent, `String(undefined)` = `"undefined"` (a non-empty string). The `"undefined"` literal is forwarded to the email service as the shared key. Any caller without the header can trigger bulk email campaigns by relying on this bypass.

Same critical anti-pattern as `signin.ts` and `reviewer-pending-emails-cron.ts`.

**Fix:**
```typescript
const sharedKey = req.headers["x-warp-shared-key"];
if (!sharedKey || typeof sharedKey !== "string") {
  return res.status(401).json({ error: "Missing or invalid shared key" });
}
```

---

### [HIGH-1] No HTTP method restriction (all three)

All three export `handler` directly with no `ApiMethodGuard`. Any HTTP method is accepted.

---

### [HIGH-2] No rate limiting (all three)

None of these cron-style routes use `withEmailOrIpRateLimitWithProgressiveDelay`. A caller can trigger bulk email campaigns at unlimited frequency.

---

### [MEDIUM-1] Commented-out hardcoded date ranges in source (answer-on-assigned, assigned-question, comments-on-question)

```typescript
// const dateWithStartTime = new Date("2023-09-24T18:30:00.001Z");
// const dateWithEndTime = new Date("2023-09-25T18T18:29:59.999Z");
```

Stale debug/testing dates committed and never cleaned up.

---

## Group 2: Single-email routes (commentsubmissionuser2, question-assign, question-response)

### [CRITICAL-2] No authentication (all three)

No JWT or session check. Any caller can trigger emails to any recipient by supplying a valid-looking `id` / `companyId` / `formId` / `userId`.

---

### [HIGH-3] `response.indexOf("OK")` without optional chaining — crashes on null response

```typescript
if (response.indexOf("OK") !== -1) { ... }
```

All three routes call `.indexOf()` without optional chaining. If the notification service returns `null`, `undefined`, or an empty object, this throws `TypeError: Cannot read properties of null/undefined`. The same defect was found in the earlier email routes QA (`assessmentreopen-email.ts`, `new-user-created-email.ts`).

**Fix:** Use `response?.indexOf("OK") !== -1` or validate `typeof response === "string"` first.

---

### [HIGH-4] No HTTP method restriction, no rate limiting (all three)

Exported directly without `ApiMethodGuard` or `withEmailOrIpRateLimitWithProgressiveDelay`.

---

## `email-invitation.ts` (root-level)

### [CRITICAL-3] No authentication

---

### [HIGH-5] `response?.response?.indexOf("OK") !== -1` — returns HTTP 200 on null/undefined response

```typescript
if (response?.response?.indexOf("OK") !== -1) {
  res.status(200).send({ data: response, error: null });
} else {
  res.status(400).send({ data: null, error: "Failed to send email" });
}
```

When `response?.response` is `null` or `undefined` (service failure), optional chaining returns `undefined`. `undefined !== -1` evaluates to `true`, so HTTP 200 is returned even though the email was not sent. The 400 branch is unreachable on service failure.

The 400 branch would only fire if `response.response.indexOf("OK")` returns exactly `-1` — but on failure the response itself is null, so 200 is always returned.

**Fix:** Check positively for "OK":
```typescript
if (typeof response?.response === "string" && response.response.includes("OK")) {
  res.status(200).send(...);
} else {
  res.status(400).send(...);
}
```

---

### [HIGH-6] No HTTP method restriction

Exported via `withEmailOrIpRateLimitWithProgressiveDelay` but no `ApiMethodGuard`.

---

## Summary Table

| ID | Severity | Files Affected | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | answer-on-assigned, assigned-question, comments-on-question | `String(undefined)` auth bypass |
| CRITICAL-2 | Critical | commentsubmissionuser2, question-assign, question-response | No authentication |
| CRITICAL-3 | Critical | email-invitation.ts (root) | No authentication |
| HIGH-1 | High | 3 bulk email routes | No HTTP method restriction |
| HIGH-2 | High | 3 bulk email routes | No rate limiting |
| HIGH-3 | High | commentsubmissionuser2, question-assign, question-response | `response.indexOf("OK")` crashes on null |
| HIGH-4 | High | commentsubmissionuser2, question-assign, question-response | No method guard, no rate limiting |
| HIGH-5 | High | email-invitation.ts (root) | Returns 200 on null response due to inverted check |
| HIGH-6 | High | email-invitation.ts (root) | No HTTP method restriction |
| MEDIUM-1 | Medium | 3 bulk email routes | Commented-out hardcoded date ranges |
