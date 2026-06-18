# QA: All Email API Routes (12 files)

**Files covered:**
- `email-invitation.ts`
- `Reviewer-email-invitation.ts`
- `assessmentapproved-email1.ts`
- `assessmentreopen-email.ts`
- `reviewer-aaproved-email.ts` ← typo in filename
- `reviewer-declined-email.ts`
- `reviewer-resubmit-email.ts`
- `khaitan-email-invitation.ts`
- `new-user-created-email.ts`
- `commentsubmission-email.ts`
- `reviewer-pending-emails-cron.ts`
- `sending-email-from-db.ts`

**Status:** CRITICAL issues found across all  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issues (all 12 files)

### [CRITICAL-1] No authentication on any email-sending endpoint

None of the 12 email routes verifies a JWT or session. Any unauthenticated caller can trigger any email type (invitation, approval, reopen, reviewer, cron batch) to any recipient by supplying:
- `invitationId` / `companyId` / `formId` / `platformId` — all guessable or obtainable IDs

An attacker can send spam or phishing-style emails from the platform's own SMTP configuration to any address stored in the database by calling these endpoints with different IDs.

**Severity: CRITICAL for all 12 files.**

---

### [HIGH-1] No HTTP method restriction on most routes

`commentsubmission-email.ts`, `sending-email-from-db.ts`, and several others export `handler` directly without `ApiMethodGuard`. Accepts `GET`, `DELETE`, `PUT`, etc. — GET request with no body will crash inside the handler.

---

### [HIGH-2] `response.response.indexOf("OK")` crashes on null/empty response

Several routes call `.indexOf()` without optional chaining:

```typescript
// assessmentreopen-email.ts, new-user-created-email.ts, commentsubmission-email.ts
if (response.response.indexOf("OK") !== -1)   // crashes if response is null/undefined
if (response.indexOf("OK") !== -1)            // crashes if response is null (commentsubmission)
```

If the notification service returns `null`, `undefined`, or an empty object, these calls throw `TypeError: Cannot read properties of null/undefined` — resulting in an unhandled 500 with no email sent and no error logged. Compare with `Reviewer-email-invitation.ts` which correctly uses `response?.response?.indexOf("OK")`.

---

### [HIGH-3] `reviewer-pending-emails-cron.ts` — `sharedKey` passed via `String(undefined)` bypass

**Lines 6–7**

```typescript
const sharedKey = String(req.headers["x-warp-shared-key"]);
await sendReviewerPendingEmailsCron(sharedKey);
```

Same `String(undefined) = "undefined"` issue as `signin.ts`. If the header is absent, `sharedKey` becomes the string `"undefined"`. The comment says "Assuming sendReviewerPendingEmailsCron handles its own validation" — but that is unverified and the guard at this layer is broken.

---

## File-Specific Issues

### `commentsubmission-email.ts` — No rate limiting

This route uses `export default handler` directly — no `withEmailOrIpRateLimitWithProgressiveDelay` wrapper. Every other email route applies rate limiting; this one does not. An attacker can call it at unlimited frequency.

---

### `sending-email-from-db.ts` — No rate limiting, no method guard, raw error in 500

Same: `export default handler` — no rate limiting, no method guard. Plus `res.status(500).json({ error: error || "Internal Server Error" })` leaks the error object.

---

### `reviewer-aaproved-email.ts` — Filename typo

`reviewer-aaproved-email.ts` — "aaproved" should be "approved". This matches the QA flag already documented in the WARP docs. The URL exposed to callers is `/api/reviewer-aaproved-email` — renaming the file would be a breaking change if callers use hardcoded URLs.

---

### `Reviewer-email-invitation.ts` — Rate limit 200 vs 60 on other routes

`maxRequestCount: 200` vs 60 on other routes — inconsistently high. No justification for the difference.

---

### `khaitan-email-invitation.ts` — Client-specific logic in shared route layer

This route contains a client name (`khaitan`) baked into the API route filename and function name. Client-specific email variations should be data-driven (email template configuration), not hardcoded as separate route files.

---

## Summary Table

| Issue | Severity | Files Affected |
|---|---|---|
| No authentication | Critical | All 12 |
| No HTTP method restriction | High | commentsubmission, sending-email-from-db, and others |
| `.indexOf("OK")` without null guard — crash on null response | High | assessmentreopen, new-user-created, commentsubmission |
| `sharedKey = String(undefined)` bypass | High | reviewer-pending-emails-cron |
| No rate limiting | Medium | commentsubmission-email, sending-email-from-db |
| Raw error in 500 response | Medium | sending-email-from-db |
| Filename typo `aaproved` | Low | reviewer-aaproved-email.ts |
| Hardcoded client name in route | Low | khaitan-email-invitation.ts |
| Inconsistent rate limit (200 vs 60) | Low | Reviewer-email-invitation.ts |
