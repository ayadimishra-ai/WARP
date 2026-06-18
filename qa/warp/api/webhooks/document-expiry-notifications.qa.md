# QA: `apps/web/pages/api/webhooks/document-expiry-notifications.ts`

**Status:** Medium issues — best-written route reviewed so far  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Overview

This is a well-structured webhook handler with proper method validation, secret authentication, and input validation. Issues below are improvements, not critical failures.

---

## Issues Found

### [HIGH-1] Secret compared with `!==` — timing attack vector

**Line 29**

```typescript
if (!secret || secret !== WEBHOOK_SECRET) { ... }
```

String comparison with `!==` short-circuits on the first differing character, making the comparison time-dependent on how similar the submitted secret is to the real secret. An attacker can use timing measurements to enumerate the correct secret byte-by-byte.

**Fix:** Use `crypto.timingSafeEqual`:

```typescript
import crypto from "crypto";

const submittedBuffer = Buffer.from(secret);
const expectedBuffer = Buffer.from(WEBHOOK_SECRET!);
const match =
  submittedBuffer.length === expectedBuffer.length &&
  crypto.timingSafeEqual(submittedBuffer, expectedBuffer);
if (!match) return res.status(401).json({ error: "Unauthorized" });
```

---

### [HIGH-2] Partial email failure causes 500 — scheduler will retry all (including already-sent)

**Lines 86–99**

```typescript
if (failureCount > 0) {
  return res.status(500).json({ ... });
}
```

If 9/10 emails succeed and 1 fails, returning 500 tells the external scheduler the whole batch failed. On retry, all 9 successful recipients receive duplicate emails. Should return 200 (or 207 Multi-Status) with the failure details in the body, letting the scheduler decide whether to alert or retry.

---

### [MEDIUM-1] Missing `WEBHOOK_SECRET` not caught at startup

**Line 15**

```typescript
const WEBHOOK_SECRET = process.env.DOCUMENT_EXPIRY_NOTIFICATION_WEBHOOK_SECRET;
```

If the env var is missing, `WEBHOOK_SECRET` is `undefined`. `secret !== undefined` is always `true` for any string, so every request is rejected — silently. The misconfiguration is hard to diagnose. Add a startup check with a clear error message.

---

### [MEDIUM-2] Internal error message leaked in 500 response

**Line 119**

```typescript
message: error instanceof Error ? error.message : "Unknown error",
```

Service-internal error details from AWS SES/Nodemailer or DB queries can surface to the webhook caller. Log internally, return a generic message.

---

### [LOW-1] Not using shared `ApiErrorGuard` / `ApiMethodGuard`

Manual `req.method` check and manual `try/catch` rather than the project's standard HOF guards. Inconsistent with all `v1/` routes.

---

### [LOW-2] Verbose `console.log` instead of structured logger

Lines 30, 62–63, 81–82, 87–89 — should use `logger` from `@warp/shared/utils/logger.util`.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| HIGH-1 | High | 29 | Secret compared with `!==` — timing attack vector |
| HIGH-2 | High | 86–99 | Partial failure returns 500 — causes duplicate emails on retry |
| MEDIUM-1 | Medium | 15 | Missing `WEBHOOK_SECRET` not caught at startup |
| MEDIUM-2 | Medium | 119 | Internal error message in 500 response |
| LOW-1 | Low | — | Not using shared `ApiErrorGuard`/`ApiMethodGuard` |
| LOW-2 | Low | 30, 62+ | `console.log` instead of structured logger |
