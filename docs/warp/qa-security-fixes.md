# WARP API Security QA — Fixes Applied

This document records every security bug found and fixed during the QA pass, with the fix status for each checked file.

---

## Step 1 — Checklist Files (verified or fixed)

### A) `apps/web/pages/api/calculate-score/index.ts`
**Status: VERIFIED**

- `recommendationWithFormfieldData` is declared inside `calculateScore()` at line 173, not at module level.
- Uses `ApiMethodGuard("POST")` via the handler chain.
- No `jwt.decode()` call in this file (JWT is not used here — auth is via internal call pattern).

### B) `apps/web/pages/api/auth/[...nextauth].ts`
**Status: VERIFIED**

- Hardcoded credentials (`admin@warp.com` / `1234`) are removed. The `authorize` callback unconditionally returns `null`.
- Rate-limited via `withEmailOrIpRateLimitWithProgressiveDelay`.

### C) `apps/web/pages/api/interiam/index.ts`
**Status: VERIFIED**

- Uses `ApiMethodGuard(interimAnswerHandler, "POST")` — correct HTTP method guard.

### D) `apps/web/pages/api/AI/generate-background-report.ts`
**Status: VERIFIED**

- Uses `jwt.verify(accessToken, jwtSecret)` with the `HASURA_JWT_SECRET` env var.
- Returns 401 on verification failure before any processing.

### E) `apps/web/pages/form/[formId]/start.tsx`
**Status: VERIFIED**

- Line 22: `if (questionnaire) return <Box>{JSON.stringify(questionnaire, null, 2)}</Box>;`
- The `return` keyword is present; the original bug (missing `return`) has been fixed.

### F) `apps/web/pages/globalDataStorage/index.tsx`
**Status: VERIFIED**

- Line 36: `if (typeof globalMasterData !== "undefined")` — uses string `"undefined"` (correct).
- Original bug was `!== undefined` (bare value), which always evaluated `true` since `typeof` returns a string.

### G) `packages/server/guards/api-hasura-webhook-guard.ts`
**Status: VERIFIED**

- Uses `process.env.HASURA_WEBHOOK_SECRET` (env var, not hardcoded).
- Uses `crypto.timingSafeEqual()` for constant-time comparison to prevent timing attacks.

### H) `packages/client/services/platform-window-message.service.ts`
**Status: VERIFIED**

- `postParentMessage` uses `getParentOrigin()` which reads `process.env.NEXT_PUBLIC_PARENT_ORIGIN || window.location.origin`.
- Original bug was `window.parent?.postMessage(message, "*")` — wildcard origin.

### I) `ops/middleware.ts`
**Status: VERIFIED**

- Line 14: `return NextResponse.next();` — `return` keyword is present.
- Original bug: missing `return`, so the middleware returned `undefined` for non-OPTIONS requests, breaking all API routes.

### J) `ops/app/api/v1/webhook/data-flow/route.ts`
**Status: VERIFIED**

- Uses `env.DATA_FLOW_WEBHOOK_SECRET` (from `getServerEnv()` — AWS Secrets Manager backed).
- Uses `crypto.timingSafeEqual()` for constant-time token comparison.

---

## Step 2 — Additional Files Fixed During QA Sweep

### `apps/web/pages/api/submit-form.ts`
**Status: FIXED NOW**

**Bug**: Used `jwt.decode()` (no signature verification) instead of `jwt.verify()`.
A forged token with any arbitrary payload would have passed the session check.

**Fix applied**:
- Replaced `jwt.decode(accessToken)` with `jwt.verify(accessToken, jwtSecret)` using `HASURA_JWT_SECRET`.
- Added try/catch returning HTTP 401 on verification failure.
- Changed unauthorized response from HTTP 500 to HTTP 401.
- Strips `Bearer ` prefix from the Authorization header before verification.

### `apps/web/pages/api/progress-report-score.ts`
**Status: FIXED NOW**

**Bug**: Used `jwt.decode()` (no signature verification) instead of `jwt.verify()`.
Same vulnerability as `submit-form.ts` — forged tokens accepted.

**Fix applied**:
- Replaced `jwt.decode(accessToken)` with `jwt.verify(accessToken, jwtSecret)` using `HASURA_JWT_SECRET`.
- Added try/catch returning HTTP 401 on verification failure.
- Strips `Bearer ` prefix before verification.

---

## Files Not Yet QA'd (no prior doc entry)

The following API files have not been audited in a previous QA pass. Most are email-sending endpoints with no auth guard (they rely on being called only from server-side code); a few warrant a separate pass:

| File | Risk Level | Notes |
|---|---|---|
| `apps/web/pages/api/saveAnswers/index.ts` | Medium | No JWT guard; accepts POST/PUT. Relies on Hasura row-level security downstream. |
| `apps/web/pages/api/carry-forward-assessment-data/index.ts` | Medium | No auth guard; rate-limited. |
| `apps/web/pages/api/carry-forward-assessment-data-userwise/index.ts` | Medium | No auth guard; rate-limited. |
| `apps/web/pages/api/carry-forward-suggestions.ts` | Medium | Needs review. |
| `apps/web/pages/api/v1/internal/post-form-submission.ts` | High | Internal orchestrator — verify it is not publicly callable. |
| `apps/web/pages/api/webhooks/document-expiry-notifications.ts` | Low | Uses `secret` field from request body (not header); timing-safe comparison not used but short-circuit is present via env var. Acceptable for cron-only webhook. |
| All `email-*.ts` routes | Low | No auth; rely on not being publicly routed. Acceptable for internal-only email triggers. |

---

## Summary

| # | File | Result |
|---|---|---|
| A | `apps/web/pages/api/calculate-score/index.ts` | VERIFIED |
| B | `apps/web/pages/api/auth/[...nextauth].ts` | VERIFIED |
| C | `apps/web/pages/api/interiam/index.ts` | VERIFIED |
| D | `apps/web/pages/api/AI/generate-background-report.ts` | VERIFIED |
| E | `apps/web/pages/form/[formId]/start.tsx` | VERIFIED |
| F | `apps/web/pages/globalDataStorage/index.tsx` | VERIFIED |
| G | `packages/server/guards/api-hasura-webhook-guard.ts` | VERIFIED |
| H | `packages/client/services/platform-window-message.service.ts` | VERIFIED |
| I | `ops/middleware.ts` | VERIFIED |
| J | `ops/app/api/v1/webhook/data-flow/route.ts` | VERIFIED |
| — | `apps/web/pages/api/submit-form.ts` | FIXED NOW |
| — | `apps/web/pages/api/progress-report-score.ts` | FIXED NOW |
