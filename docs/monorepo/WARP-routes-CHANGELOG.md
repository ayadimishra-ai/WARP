# Monorepo WARP API Routes QA — Changes

All route.ts files under `src/app/api/warp/` are thin wrappers over legacy handlers in
`src/server/legacy-warp-api/`. Fixes were applied to the **legacy handlers** (the actual
logic layer), which are shared by both the Pages Router stubs and the App Router route.ts
wrappers via `pagesApiHandler`.

| File (legacy handler path) | Bug | Fix | Severity |
|---|---|---|---|
| `rara/document-rating.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` with `HASURA_GRAPHQL_JWT_SECRET` | CRITICAL |
| `rara/document-rating.ts` | Hardcoded `internalSharedKey` string literal | Removed unused dead variable | HIGH |
| `rara/document-rating.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `rara/document-rating-single.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` with `HASURA_GRAPHQL_JWT_SECRET` inside try/catch | CRITICAL |
| `rara/document-rating-single.ts` | SSRF: `url` and `auth_key` accepted from request body | Removed from body destructure; fetched from `GlobalMaster` DB table via SDK (same as `document-rating-direct.ts`) | CRITICAL |
| `rara/document-rating-single.ts` | Hardcoded `internalSharedKey` string literal (auth check commented out) | Removed hardcoded key; dead code removed | HIGH |
| `rara/document-rating-single.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `rara/document-rating-direct.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `rara/document-rating-direct.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `rara/document-validation.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `rara/document-validation.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `rara/document-validation.ts` | `error \|\| "Internal Server Error"` — Error objects serialize to `{}` | Changed to `error?.message \|\| "Internal Server Error"` | MEDIUM |
| `rara/document-validation-comprehensive.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `rara/document-validation-comprehensive.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `rara/document-validation-comprehensive.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `submit-form.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `submit-form.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `submit-form.ts` | HTTP 500 for missing body field | Changed to 400 | LOW |
| `progress-report-score.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `progress-report-score.ts` | No auth enforcement (session checked but never enforced) | Added early return 401 if `!session` | HIGH |
| `progress-report-score.ts` | `error \|\| "Internal Server Error"` serialization (×2) | Changed to `error?.message \|\| "..."` | MEDIUM |
| `carry-forward-suggestions.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `carry-forward-suggestions.ts` | HTTP 500 on Unauthorized | Changed to 401 | MEDIUM |
| `calculate-score/index.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `calculate-score/index.ts` | **Module-level `recommendationWithFormfieldData`** — shared state corrupts concurrent requests | Converted to local per-request variable inside `calculateScore()`; passed as parameter to `fillrecommendationArray()` | CRITICAL |
| `calculate-score/index.ts` | No auth enforcement (session computed but not checked) | Added early return 401 if `!session` | HIGH |
| `calculate-score/index.ts` | `error \|\| "Internal Server Error"` serialization (×2) | Changed to `error?.message \|\| "..."` | MEDIUM |
| `calculate-score/form-submission-email.ts` | `error \|\| "Internal Server Error"` serialization (×2) | Changed to `error?.message \|\| "..."` | MEDIUM |
| `calculate-score/reviewer-form-submission-email.ts` | `error \|\| "Internal Server Error"` serialization (×2) | Changed to `error?.message \|\| "..."` | MEDIUM |
| `AI/AI-dataStats-calculation.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/AI-dataStats-calculation.ts` | Defensive `JSON.parse(req.body)` — body already parsed | Removed defensive parse; use `req.body ?? {}` directly | MEDIUM |
| `AI/AIprocessing.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/AIprocessing.ts` | Defensive `JSON.parse(req.body)` — body already parsed | Removed defensive parse; use `req.body ?? {}` directly | MEDIUM |
| `AI/get-chat-subscription-status.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/get-chat-subscription-status.ts` | `JSON.parse((req as any).body \|\| {})` — crashes on non-string body | Replaced with `req.body ?? {}` | MEDIUM |
| `AI/get-formInvitation-detail.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/get-formInvitation-detail.ts` | `JSON.parse(req.body)` — crashes when body is already an object | Replaced with `req.body ?? {}` | MEDIUM |
| `AI/get-invitation-isdata-curation-skipped-status..ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/get-invitation-isdata-curation-skipped-status..ts` | `JSON.parse(req.body)` — crashes when body is already an object | Replaced with `req.body ?? {}` | MEDIUM |
| `AI/suggestion-answer-entry.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/update-form-invitation.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/update-form-invitation.ts` | `JSON.parse(req.body)` — crashes when body is already an object | Replaced with `req.body ?? {}` | MEDIUM |
| `AI/update-invitation-and-skipped-status.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/update-invitation-and-skipped-status.ts` | `JSON.parse(req.body)` — crashes when body is already an object | Replaced with `req.body ?? {}` | MEDIUM |
| `AI/update-invitation-web-curation-ai-bulk-processing.ts` | Wildcard CORS `Access-Control-Allow-Origin: *` | Removed CORS headers | HIGH |
| `AI/update-invitation-web-curation-ai-bulk-processing.ts` | Defensive `JSON.parse(rawBody)` — body already parsed | Removed defensive parse; use `req.body ?? {}` directly | MEDIUM |
| `AI/generate-background-report.ts` | `jwt.decode()` — no signature verification | Changed to `jwt.verify()` inside try/catch | CRITICAL |
| `AI/generate-background-report.ts` | Defensive `JSON.parse(body)` — body already parsed | Removed defensive parse; use `req.body \|\| {}` directly | MEDIUM |
| `AI/migrate-existing-invitations-stats.ts` | Zero auth — no access control on this developer-only endpoint | Added `x-warp-shared-key` guard using `crypto.timingSafeEqual` | CRITICAL |
| `AI/migrate-existing-invitations-stats.ts` | No cap on `invitationIds` array length — DoS risk | Added 100-item cap; returns 400 if exceeded | HIGH |
| `sending-email-from-db.ts` | `String(req.headers["x-warp-shared-key"])` bypass — produces `"undefined"` when header absent | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` comparison against `WARP_INTERNAL_SHARED_KEY` env var | HIGH |
| `sending-email-from-db.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `reviewer-pending-emails-cron.ts` | `String(req.headers["x-warp-shared-key"])` bypass | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` | HIGH |
| `recommendation/reminder/recommendation-reminder-post-duedate.ts` | `String(req.headers["x-warp-shared-key"])` bypass | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` | HIGH |
| `recommendation/reminder/recommendation-reminder-pre-duedate.ts` | `String(req.headers["x-warp-shared-key"])` bypass | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` | HIGH |
| `assigned-question-bulk-email-invitation.ts` | `String(req.headers["x-warp-shared-key"])` bypass | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` | HIGH |
| `answer-on-assigned-question-bulk-email.ts` | `String(req.headers["x-warp-shared-key"])` bypass | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` | HIGH |
| `comments-on-question-bulk-email.ts` | `String(req.headers["x-warp-shared-key"])` bypass | Replaced with proper `typeof` guard + `crypto.timingSafeEqual` | HIGH |
| `test/secrets-check.ts` | Fully public — exposes secret presence metadata to any caller | Added `x-warp-shared-key` guard using `crypto.timingSafeEqual` | CRITICAL |
| `awss3/download.ts` | No JWT auth — unauthenticated S3 file access | Added `jwt.verify()` check; returns 401 if missing/invalid | HIGH |
| `awss3/upload.ts` | No JWT auth — unauthenticated S3 file upload | Added `jwt.verify()` check; returns 401 if missing/invalid | HIGH |
| `auth/[...nextauth].ts` | Hardcoded backdoor: `admin@warp.com` / `1234` accepted as credentials | Removed hardcoded check; `authorize()` always returns null | CRITICAL |
| `saveAnswers/index.ts` | PUT method silently accepted then no response sent (if branch never matches) | Changed method guard to POST-only | MEDIUM |
| `saveAnswers/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `carry-forward-assessment-data/index.ts` | PUT method silently accepted then no response sent | Changed method guard to POST-only | MEDIUM |
| `carry-forward-assessment-data/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `carry-forward-assessment-data-userwise/index.ts` | PUT method silently accepted then no response sent | Changed method guard to POST-only | MEDIUM |
| `carry-forward-assessment-data-userwise/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `v1/platform/auth/signin.ts` | `String(req.headers["x-warp-shared-key"])` — `"undefined"` string passes truthiness check | Replaced with `typeof === "string" && length > 0` guard; cast to `string` before SDK call | HIGH |
| `v1/platform/user/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `v1/platform/user/[userId].ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `v1/platform/emailsubscribed/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `v1/platform/company/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `v1/platform/company/[companyId].ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `v1/platform/company/addresses/delete-address.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |
| `test-logs/index.ts` | `error \|\| "Internal Server Error"` serialization | Changed to `error?.message \|\| "..."` | MEDIUM |

## Routes Verified Clean (no issues found)

- `AI/AI-rara-document-validation.ts` — VERIFIED
- `AI/ai-chat-subscription-notification.ts` — VERIFIED
- `AI/ai-processing-completed.ts` — VERIFIED (uses `crypto.timingSafeEqual` correctly)
- `AI/calculate-completion-percentage.ts` — VERIFIED
- `AI/document-processing-completed.ts` — VERIFIED
- `AI/email-invitation.ts` — VERIFIED
- `AI/suggestion-cleanup.ts` — VERIFIED
- `AI/web-curation-for-processing.ts` — VERIFIED
- `AI/update-invitation-web-curation-ai-bulk-processing.ts` — VERIFIED after CORS/JSON.parse fixes
- `awss3/get-download-url.ts` — VERIFIED
- `awss3/get-upload-url.ts` — VERIFIED
- `awss3/move-file.ts` — VERIFIED
- `auth/[...nextauth].ts` — VERIFIED after backdoor removal
- `Reviewer-email-invitation.ts` — VERIFIED
- `assessmentapproved-email.ts` — VERIFIED
- `assessmentapproved-email1.ts` — VERIFIED
- `assessmentreopen-email.ts` — VERIFIED
- `brsr-template.ts` — VERIFIED
- `calculate-score/form-submission-email.ts` — VERIFIED after error serialization fix
- `calculate-score/reviewer-form-submission-email.ts` — VERIFIED after error serialization fix
- `commentsubmission-email.ts` — VERIFIED
- `commentsubmissionuser2-email.ts` — VERIFIED
- `email-invitation.ts` — VERIFIED
- `get-company-by-name-and-primary-contact.ts` — VERIFIED
- `get-invited-assessmentlist-by-companyId.ts` — VERIFIED
- `hello.ts` — VERIFIED
- `interiam/index.ts` — VERIFIED
- `jwt.ts` — VERIFIED
- `khaitan-email-invitation.ts` — VERIFIED
- `new-user-created-email.ts` — VERIFIED
- `question-assign-email-invitation.ts` — VERIFIED
- `question-response-email-invitation.ts` — VERIFIED
- `recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee.ts` — VERIFIED
- `recommendation/email-on-manually-raising-the-recommendations.ts` — VERIFIED
- `recommendation/email-when-a-recommendation-is-reopened.ts` — VERIFIED
- `recommendation/email-when-the-actions-taken-on-the-recommendations-are-approved.ts` — VERIFIED
- `reviewer-aaproved-email.ts` — VERIFIED
- `reviewer-declined-email.ts` — VERIFIED
- `reviewer-resubmit-email.ts` — VERIFIED
- `upload-carry-forward-pdf.ts` — VERIFIED
- `v1/internal/post-form-submission.ts` — VERIFIED
- `v1/ops/check-company-eligibility.ts` — VERIFIED
- `v1/platform/company/bulk.ts` — VERIFIED
- `v1/platform/company/send-invitation.ts` — VERIFIED
- `v1/platform/company/addresses/save-address.ts` — VERIFIED
- `v1/platform/company/addresses/update-address.ts` — VERIFIED
- `v1/platform/user/UpdateResetPasswordFlag.ts` — VERIFIED
- `webhooks/document-expiry-notifications.ts` — VERIFIED

## Environment Variable Required

All `x-warp-shared-key` cron/internal routes now require `WARP_INTERNAL_SHARED_KEY` to be
set in the environment. If unset, all guarded routes return 401 (fail-safe).
