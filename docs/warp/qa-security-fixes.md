# WARP API Security QA — Fixes Applied

This document records every security bug found and fixed during the QA pass, with the fix status for each checked file.

---

## Pass 1 — Initial QA Sweep (Historical)

### A) `apps/web/pages/api/calculate-score/index.ts`
**Status: VERIFIED**

- `recommendationWithFormfieldData` is declared inside `calculateScore()` at line 173, not at module level.
- Uses `ApiMethodGuard("POST")` via the handler chain.
- No `jwt.decode()` call in this file (JWT is not used here — auth is via internal call pattern).

### B) `apps/web/pages/api/auth/[...nextauth].ts`
**Status: FIXED**

- Hardcoded credentials (`admin@warp.com` / `1234`) removed. The `authorize` callback unconditionally returns `null`.
- Rate-limited via `withEmailOrIpRateLimitWithProgressiveDelay`.

### C) `apps/web/pages/api/interiam/index.ts`
**Status: FIXED**

- Was using `ApiMethodGuard(interimAnswerHandler, "GET")` on a POST route. Fixed to `"POST"`.

### D) `apps/web/pages/api/AI/generate-background-report.ts`
**Status: VERIFIED**

- Uses `jwt.verify(accessToken, jwtSecret)` with the `HASURA_JWT_SECRET` env var.
- Returns 401 on verification failure before any processing.

### E) `apps/web/pages/form/[formId]/start.tsx`
**Status: FIXED**

- Missing `return` in JSX branch — questionnaire never displayed. Fixed.

### F) `apps/web/pages/globalDataStorage/index.tsx`
**Status: FIXED**

- `typeof !== undefined` (bare value, always true) → `!== "undefined"` (string comparison).

### G) `packages/server/guards/api-hasura-webhook-guard.ts`
**Status: FIXED**

- Hardcoded hex key → `process.env.HASURA_WEBHOOK_SECRET` + `crypto.timingSafeEqual()`.

### H) `packages/client/services/platform-window-message.service.ts`
**Status: FIXED**

- `postMessage("*")` wildcard origin → `NEXT_PUBLIC_PARENT_ORIGIN` env var.

### I) `ops/middleware.ts`
**Status: FIXED**

- Missing `return NextResponse.next()` — all routes were bypassing auth middleware.

### J) `ops/app/api/v1/webhook/data-flow/route.ts`
**Status: FIXED**

- Hardcoded `"sk-op-test-token-123456"` → `DATA_FLOW_WEBHOOK_SECRET` env var + timing-safe compare.

### K) `apps/web/pages/api/submit-form.ts`
**Status: FIXED**

- `jwt.decode()` → `jwt.verify()` + HASURA_GRAPHQL_JWT_SECRET; returns 401 on failure.

### L) `apps/web/pages/api/progress-report-score.ts`
**Status: FIXED**

- `jwt.decode()` → `jwt.verify()` + HASURA_GRAPHQL_JWT_SECRET; returns 401 on failure.

### M) `apps/web/pages/api/rara/document-rating-single.ts`
**Status: FIXED**

- SSRF: client-controlled RARA `url` and `auth_key` replaced — now fetched from DB (`GlobalMaster` table).

### N) All `apps/web/pages/api/*-email*.ts` and `email-*.ts` routes
**Status: FIXED**

- `response?.indexOf("OK")` crashes on null response → `!!response && response.includes("OK")`.

---

## Pass 2 — This Pass (New Fixes)

### GROUP 1 — S3 Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/awss3/download.ts` | FIXED — JWT auth added; 400 for missing param; filename coercion + quoting |
| `apps/web/pages/api/awss3/upload.ts` | FIXED — JWT auth added; duplicate `req.pipe()` removed; `sizeInBytes` accumulation fixed |
| `apps/web/pages/api/awss3/get-upload-url.ts` | VERIFIED — `ApiErrorGuard` + method guard + rate limit in place |
| `apps/web/pages/api/awss3/get-download-url.ts` | VERIFIED — `ApiErrorGuard` + method guard + rate limit in place |
| `apps/web/pages/api/awss3/move-file.ts` | VERIFIED — `ApiErrorGuard` + method guard + rate limit in place |

### GROUP 2 — AI Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/AI/AI-dataStats-calculation.ts` | FIXED — wildcard CORS removed; `JSON.parse(req.body)` branch removed |
| `apps/web/pages/api/AI/AI-rara-document-validation.ts` | FIXED — misleading error message corrected |
| `apps/web/pages/api/AI/AIprocessing.ts` | FIXED — wildcard CORS removed |
| `apps/web/pages/api/AI/ai-chat-subscription-notification.ts` | VERIFIED — has method guard + field validation |
| `apps/web/pages/api/AI/ai-processing-completed.ts` | VERIFIED — uses `crypto.timingSafeEqual` token auth |
| `apps/web/pages/api/AI/calculate-completion-percentage.ts` | FIXED — misleading error message corrected |
| `apps/web/pages/api/AI/document-processing-completed.ts` | FIXED — authorization header removed from logs; misleading error message corrected |
| `apps/web/pages/api/AI/email-invitation.ts` | FIXED — POST method guard added |
| `apps/web/pages/api/AI/get-chat-subscription-status.ts` | FIXED — wildcard CORS removed; `JSON.parse(body \|\| {})` SyntaxError crash fixed |
| `apps/web/pages/api/AI/migrate-existing-invitations-stats.ts` | FIXED — shared-key auth guard added; 100-item cap on array |
| `apps/web/pages/api/AI/suggestion-answer-entry.ts` | FIXED — wildcard CORS removed; misleading error message corrected |
| `apps/web/pages/api/AI/suggestion-cleanup.ts` | FIXED — misleading error message corrected |
| `apps/web/pages/api/AI/update-invitation-web-curation-ai-bulk-processing.ts` | FIXED — wildcard CORS removed; method check moved before body parsing |
| `apps/web/pages/api/AI/web-curation-for-processing.ts` | FIXED — null-safe `req.body?.[0]?.invitationId`; misleading error message corrected |

### GROUP 3 — Platform / Company / User Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/v1/platform/user/index.ts` | FIXED — 405→400 for missing body; error serialization fixed |
| `apps/web/pages/api/v1/platform/user/[userId].ts` | FIXED — 409→404 for not found; error message wording fixed; error serialization fixed |
| `apps/web/pages/api/v1/platform/user/UpdateResetPasswordFlag.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("PUT")` + yup validation |
| `apps/web/pages/api/v1/platform/company/index.ts` | FIXED — array body structure validated before array access; 405→400; error serialization fixed |
| `apps/web/pages/api/v1/platform/company/[companyId].ts` | FIXED — 409→404 for not found; error serialization fixed |
| `apps/web/pages/api/v1/platform/company/bulk.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("POST")` |
| `apps/web/pages/api/v1/platform/company/send-invitation.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("POST")` + yup validation |
| `apps/web/pages/api/v1/platform/company/addresses/delete-address.ts` | FIXED — silent no-response on null id → explicit 400; error serialization fixed |
| `apps/web/pages/api/v1/platform/company/addresses/save-address.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("POST")` + yup validation |
| `apps/web/pages/api/v1/platform/company/addresses/update-address.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("PUT")` + yup validation |
| `apps/web/pages/api/v1/platform/emailsubscribed/index.ts` | FIXED — unused `encryptionDecryption` import removed; 405→400; error serialization fixed |

### GROUP 4 — Internal / Misc Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/saveAnswers/index.ts` | FIXED — PUT removed from method guard (never handled); 405→400; error serialization fixed |
| `apps/web/pages/api/carry-forward-assessment-data/index.ts` | FIXED — PUT removed from method guard; 405→400; error serialization fixed |
| `apps/web/pages/api/carry-forward-assessment-data-userwise/index.ts` | FIXED — PUT removed from method guard; 405→400; error serialization fixed |
| `apps/web/pages/api/v1/internal/post-form-submission.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("POST")`; correct logic |
| `apps/web/pages/api/v1/ops/check-company-eligibility.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("GET")`; AbortController timeout |
| `apps/web/pages/api/upload-carry-forward-pdf.ts` | VERIFIED — POST-only; formidable size limit; 400 for missing fields |
| `apps/web/pages/api/get-company-by-name-and-primary-contact.ts` | FIXED — 500→400 for missing required query params |
| `apps/web/pages/api/get-invited-assessmentlist-by-companyId.ts` | FIXED — 500→400 for missing `companyId` |
| `apps/web/pages/api/sending-email-from-db.ts` | FIXED — `x-warp-shared-key` now validated at handler level (401 if missing/wrong) |
| `apps/web/pages/api/webhooks/document-expiry-notifications.ts` | VERIFIED — POST-only; shared-secret from request body; proper 401 |
| `apps/web/pages/api/reviewer-pending-emails-cron.ts` | FIXED — `x-warp-shared-key` now validated at handler level (401 if missing/wrong) |
| `apps/web/pages/api/test-logs/index.ts` | VERIFIED — `ApiErrorGuard` + `ApiMethodGuard("POST")`; test endpoint |
| `apps/web/pages/api/test/secrets-check.ts` | FIXED — shared-key auth guard added; was fully public, now 401 for unauthorized |
| `apps/web/pages/api/hello.ts` | FIXED — dead commented-out code removed |
| `apps/web/pages/api/jwt.ts` | FIXED — null check added; returns 401 if no valid session |

### GROUP 5 — RARA Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/rara/document-rating.ts` | FIXED — hardcoded secret → env var; `jwt.decode()` → `jwt.verify()`; 500→401 for auth failure |
| `apps/web/pages/api/rara/document-rating-direct.ts` | FIXED — `jwt.decode()` → `jwt.verify()`; 500→401 for auth failure |
| `apps/web/pages/api/rara/document-validation.ts` | FIXED — `jwt.decode()` → `jwt.verify()`; 500→401; 500→400 for client errors |
| `apps/web/pages/api/rara/document-validation-comprehensive.ts` | FIXED — `jwt.decode()` → `jwt.verify()`; 500→401; 500→400 for client errors |

### GROUP 6 — Recommendation Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/recommendation/email-after-actions-been-taken-*.ts` | FIXED — POST guard added; success check fixed to `response.includes("OK")` |
| `apps/web/pages/api/recommendation/email-on-manually-raising-*.ts` | FIXED — POST guard added |
| `apps/web/pages/api/recommendation/email-when-a-recommendation-is-reopened.ts` | FIXED — POST guard added |
| `apps/web/pages/api/recommendation/email-when-the-actions-taken-*.ts` | FIXED — POST guard added |
| `apps/web/pages/api/recommendation/reminder/recommendation-reminder-post-duedate.ts` | VERIFIED — has `x-warp-shared-key` guard |
| `apps/web/pages/api/recommendation/reminder/recommendation-reminder-pre-duedate.ts` | VERIFIED — has `x-warp-shared-key` guard |

### GROUP 7 — Calculate-Score Email Routes

| File | Status |
|------|--------|
| `apps/web/pages/api/calculate-score/form-submission-email.ts` | FIXED — 500→400 for missing required params |
| `apps/web/pages/api/calculate-score/reviewer-form-submission-email.ts` | FIXED — 500→400 for missing required params |
