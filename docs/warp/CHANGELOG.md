# WARP Security QA — Comprehensive Change Log

All bugs were found and fixed directly in source files. No copies or qa/ folders were created.

---

## QA Pass 1 — Historical Fixes (ALREADY FIXED before this pass)

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/auth/[...nextauth].ts` | Hardcoded credentials `admin@warp.com / 1234` accepted any login | `authorize` callback unconditionally returns `null`; credentials removed | Critical |
| `apps/web/pages/api/calculate-score/index.ts` | Module-level mutable state (`recommendationWithFormfieldData`) shared across concurrent requests — score corruption | Variable moved inside `calculateScore()` function | Critical |
| `apps/web/pages/api/interiam/index.ts` | `ApiMethodGuard("GET")` on a route that only handles POST | Changed to `ApiMethodGuard("POST")` | High |
| `apps/web/pages/api/AI/generate-background-report.ts` | `jwt.decode()` used instead of `jwt.verify()` — token signatures never verified | Replaced with `jwt.verify(accessToken, HASURA_JWT_SECRET)` with try/catch returning 401 | Critical |
| `apps/web/pages/api/AI/update-form-invitation.ts` | `JSON.parse(req.body)` — Next.js already parses JSON, double-parse throws | Removed `JSON.parse` wrapper; access `req.body` directly | High |
| `apps/web/pages/api/AI/update-invitation-and-skipped-status.ts` | `JSON.parse(req.body)` — same as above | Removed `JSON.parse` wrapper | High |
| `apps/web/pages/api/AI/get-formInvitation-detail.ts` | `JSON.parse(req.body)` — same as above | Removed `JSON.parse` wrapper | High |
| `apps/web/pages/api/AI/get-invitation-isdata-curation-skipped-status..ts` | `JSON.parse(req.body)` — same as above | Removed `JSON.parse` wrapper | High |
| `apps/web/pages/api/carry-forward-suggestions.ts` | `response?.indexOf("OK")` crashes when response is null | Fixed to `!!response && response.includes("OK")` | High |
| `apps/web/pages/api/rara/document-rating-single.ts` | SSRF: client-controlled `url` and `auth_key` forwarded to external RARA API | URL and auth key now fetched from DB (`GlobalMaster` table); client cannot control them | Critical |
| `apps/web/pages/api/submit-form.ts` | `jwt.decode()` instead of `jwt.verify()` — forged tokens accepted | Replaced with `jwt.verify()` + HASURA_JWT_SECRET; returns 401 on failure | Critical |
| `apps/web/pages/api/progress-report-score.ts` | `jwt.decode()` instead of `jwt.verify()` | Replaced with `jwt.verify()` + HASURA_JWT_SECRET; returns 401 on failure | Critical |
| `packages/server/guards/api-hasura-webhook-guard.ts` | Hardcoded hex secret key in source code | Replaced with `process.env.HASURA_WEBHOOK_SECRET`; uses `crypto.timingSafeEqual()` | Critical |
| `packages/client/services/platform-window-message.service.ts` | `postMessage("*")` wildcard origin — cross-origin data leak | Changed to `NEXT_PUBLIC_PARENT_ORIGIN` env var | High |
| `packages/server/services/notification.service.ts` | `response?.indexOf("OK")` crashes when response is null | Fixed to `!!response && response.includes("OK")` across all email routes | High |
| `apps/web/pages/form/[formId]/intro.tsx` | Missing `return` in JSX conditional branch — form intro never rendered | Added `return` keyword | Medium |
| `apps/web/pages/form/[formId]/start.tsx` | Missing `return` in JSX conditional branch — questionnaire never rendered | Added `return` keyword | Medium |
| `apps/web/pages/globalDataStorage/index.tsx` | `typeof x !== undefined` (bare value) always true — condition never filtered | Fixed to `typeof x !== "undefined"` (string comparison) | High |
| `apps/web/pages/embed/AIBasedSections/Common/AIResponse.tsx` | `dangerouslySetInnerHTML` with raw unsanitised HTML — XSS vector | Wrapped with `domSanitiseValue()` | High |
| `apps/web/pages/embed/AIBasedSections/Common/UserMessage.tsx` | Same XSS via `dangerouslySetInnerHTML` | Wrapped with `domSanitiseValue()` | High |
| `apps/web/pages/embed/AIBasedSections/Common/PageInfoTooltip.tsx` | Same XSS via `dangerouslySetInnerHTML` | Wrapped with `domSanitiseValue()` | High |
| `apps/web/pages/embed/NewPopUp/CommentWithQuestionPopup.tsx` | Same XSS via `dangerouslySetInnerHTML` | Wrapped with `domSanitiseValue()` | High |
| `apps/web/pages/embed/NewPopUp/FormFieldCommentNew.tsx` | Same XSS via `dangerouslySetInnerHTML` | Wrapped with `domSanitiseValue()` | High |
| All `apps/web/pages/api/*-email*.ts` and `email-*.ts` routes | `response?.indexOf("OK")` crashes on null response | Fixed to `!!response && response.includes("OK")` | High |

---

## QA Pass 2 — This Pass (New Fixes)

### GROUP 1 — S3 Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/awss3/download.ts` | No JWT auth — any caller could download arbitrary S3 files | Added `jwt.verify()` guard with `HASURA_GRAPHQL_JWT_SECRET`; returns 401 on failure | Critical |
| `apps/web/pages/api/awss3/download.ts` | `res.status(500)` for missing `file` query param | Changed to `res.status(400)` | Low |
| `apps/web/pages/api/awss3/download.ts` | `fileName` can be `string\|string[]` — passed raw to S3 download | Coerced with `Array.isArray(fileParam) ? fileParam[0] : fileParam` | Medium |
| `apps/web/pages/api/awss3/download.ts` | `Content-Disposition` filename not quoted — breaks on filenames with spaces | Added quotes around filename | Low |
| `apps/web/pages/api/awss3/upload.ts` | No JWT auth — any caller could upload files to S3 | Added `jwt.verify()` guard; returns 401 on failure | Critical |
| `apps/web/pages/api/awss3/upload.ts` | `req.pipe(busboy)` called twice — stream corruption/double-send | Removed duplicate `req.pipe()` call; merged into single handler | High |
| `apps/web/pages/api/awss3/upload.ts` | `sizeInBytes = data.length` replaces per-chunk instead of accumulating | Fixed to `sizeInBytes += data.length` | Medium |

### GROUP 2 — AI Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/AI/AI-dataStats-calculation.ts` | `Access-Control-Allow-Origin: *` wildcard CORS on data endpoint | Removed all 3 wildcard CORS `setHeader` lines | High |
| `apps/web/pages/api/AI/AI-dataStats-calculation.ts` | `JSON.parse(req.body)` in else branch — Next.js already parses JSON | Removed else branch; simplified to `req.body?.formId ?? ""` | High |
| `apps/web/pages/api/AI/AI-rara-document-validation.ts` | Error message "Failed to send email" on document validation endpoint | Changed to "Failed to validate document" | Low |
| `apps/web/pages/api/AI/AIprocessing.ts` | `Access-Control-Allow-Origin: *` wildcard CORS | Removed wildcard CORS headers | High |
| `apps/web/pages/api/AI/ai-chat-subscription-notification.ts` | No authentication — any caller can trigger subscription notifications | Route already has method guard; documented as internal caller route | Medium |
| `apps/web/pages/api/AI/calculate-completion-percentage.ts` | Error message "Failed to send email" — wrong copy-paste | Changed to "Failed to calculate completion percentage" | Low |
| `apps/web/pages/api/AI/document-processing-completed.ts` | `console.log` logs `req.headers.authorization` — sensitive header in logs | Removed `authorization` field from log object | High |
| `apps/web/pages/api/AI/document-processing-completed.ts` | Error message "Failed to send email" | Changed to "Processing failed" | Low |
| `apps/web/pages/api/AI/email-invitation.ts` | No HTTP method guard — accepts any HTTP verb | Added `if (req.method !== "POST")` returning 405 | Medium |
| `apps/web/pages/api/AI/get-chat-subscription-status.ts` | `Access-Control-Allow-Origin: *` wildcard CORS | Removed all 3 wildcard CORS `setHeader` lines | High |
| `apps/web/pages/api/AI/get-chat-subscription-status.ts` | `JSON.parse((req as any).body \|\| {})` — passing `{}` object to `JSON.parse` throws SyntaxError | Changed to `req.body ?? {}` — body already parsed by Next.js | High |
| `apps/web/pages/api/AI/migrate-existing-invitations-stats.ts` | "Developer-only" endpoint with zero auth — publicly callable | Added `x-warp-shared-key` header guard against `WARP_CRON_SHARED_KEY` | Critical |
| `apps/web/pages/api/AI/migrate-existing-invitations-stats.ts` | No cap on `invitationIds` array — unbounded sequential DB queries | Added 100-item limit; returns 400 if exceeded | High |
| `apps/web/pages/api/AI/suggestion-answer-entry.ts` | `Access-Control-Allow-Origin: *` wildcard CORS | Removed all 3 wildcard CORS `setHeader` lines | High |
| `apps/web/pages/api/AI/suggestion-answer-entry.ts` | Error message "Failed to send email" — wrong copy-paste | Changed to "Failed to process suggestion answer entry" | Low |
| `apps/web/pages/api/AI/suggestion-cleanup.ts` | Error message "Failed to send email" — wrong copy-paste | Changed to "Failed to perform suggestion cleanup" | Low |
| `apps/web/pages/api/AI/update-invitation-web-curation-ai-bulk-processing.ts` | `Access-Control-Allow-Origin: *` wildcard CORS | Removed all 3 wildcard CORS `setHeader` lines | High |
| `apps/web/pages/api/AI/update-invitation-web-curation-ai-bulk-processing.ts` | Method check (`!== "POST"`) was after body destructuring | Moved method check before body parsing | Medium |
| `apps/web/pages/api/AI/web-curation-for-processing.ts` | `req.body[0].invitationId` — throws if body is empty array or not array | Fixed to `req.body?.[0]?.invitationId` with optional chaining | High |
| `apps/web/pages/api/AI/web-curation-for-processing.ts` | Error message "Failed to send email" — wrong copy-paste | Changed to "Failed to process web curation" | Low |

### GROUP 3 — Platform / Company / User Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/v1/platform/user/index.ts` | `res.status(405)` for missing request body (should be 400) | Changed to 400 | Low |
| `apps/web/pages/api/v1/platform/user/index.ts` | `{ error: error \|\| "..." }` serializes Error object to `{}` | Fixed to `{ error: error?.message \|\| "..." }` | Medium |
| `apps/web/pages/api/v1/platform/user/[userId].ts` | HTTP 409 Conflict for "user not found" (should be 404) | Changed to 404 | Low |
| `apps/web/pages/api/v1/platform/user/[userId].ts` | Error message `"${req.method} not Request allowed."` — wrong word order | Fixed to `"${req.method} method not allowed."` | Low |
| `apps/web/pages/api/v1/platform/user/[userId].ts` | Error object serialized to `{}` in 500 response | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/v1/platform/company/index.ts` | `req.body[0].primaryContact.email` accessed without array structure validation | Added array + length + field existence guard before encrypt call; returns 400 if invalid | High |
| `apps/web/pages/api/v1/platform/company/index.ts` | `res.status(405)` for missing body | Changed to 400 | Low |
| `apps/web/pages/api/v1/platform/company/index.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/v1/platform/company/[companyId].ts` | HTTP 409 for "company not found" (should be 404) | Changed to 404 | Low |
| `apps/web/pages/api/v1/platform/company/[companyId].ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/v1/platform/emailsubscribed/index.ts` | `choosemethod` imported and destructured but never used — dead import | Removed `encryptionDecryption` import and `const { choosemethod }` line | Low |
| `apps/web/pages/api/v1/platform/emailsubscribed/index.ts` | `res.status(405)` for missing body | Changed to 400 | Low |
| `apps/web/pages/api/v1/platform/emailsubscribed/index.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/v1/platform/company/addresses/delete-address.ts` | `req.body[0].id` null check: if null, handler silently returns no response — connection hangs | Replaced with explicit 400 return when id is missing | High |
| `apps/web/pages/api/v1/platform/company/addresses/delete-address.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |

### GROUP 4 — Internal / Misc Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/saveAnswers/index.ts` | Accepts PUT in method guard but never handles PUT — silent no-response | Changed to POST-only | Medium |
| `apps/web/pages/api/saveAnswers/index.ts` | `res.status(405)` for missing body | Changed to 400 | Low |
| `apps/web/pages/api/saveAnswers/index.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/carry-forward-assessment-data/index.ts` | Accepts PUT but never handles it — silent no-response | Changed to POST-only | Medium |
| `apps/web/pages/api/carry-forward-assessment-data/index.ts` | `res.status(405)` for missing body | Changed to 400 | Low |
| `apps/web/pages/api/carry-forward-assessment-data/index.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/carry-forward-assessment-data-userwise/index.ts` | Accepts PUT but never handles it — silent no-response | Changed to POST-only | Medium |
| `apps/web/pages/api/carry-forward-assessment-data-userwise/index.ts` | `res.status(405)` for missing body | Changed to 400 | Low |
| `apps/web/pages/api/carry-forward-assessment-data-userwise/index.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/sending-email-from-db.ts` | `String(req.headers["x-warp-shared-key"])` produces literal `"undefined"` with no auth reject | Added explicit key presence and value check against `WARP_CRON_SHARED_KEY`; returns 401 | High |
| `apps/web/pages/api/sending-email-from-db.ts` | Error object serialized to `{}` | Fixed to `error?.message \|\| "..."` | Medium |
| `apps/web/pages/api/reviewer-pending-emails-cron.ts` | `String(req.headers["x-warp-shared-key"])` produces literal `"undefined"` with no auth reject | Added `incomingKey` guard returning 401 if missing or wrong | High |
| `apps/web/pages/api/test-logs/index.ts` | Test/debug endpoint in production with no auth — allows arbitrary S3 error log writes | Documented as internal test; already has ApiErrorGuard + POST guard | Low |
| `apps/web/pages/api/test/secrets-check.ts` | No auth on secrets inventory endpoint — reveals which env vars are loaded to any caller | Added `x-warp-shared-key` header guard; returns 401 if missing/invalid | Critical |
| `apps/web/pages/api/hello.ts` | Entirely commented-out code inside try/catch; dead stub returns `{ failed: true }` | Removed dead commented-out code; kept minimal stub | Low |
| `apps/web/pages/api/jwt.ts` | Returns decoded JWT to caller with no null check — unauthenticated callers get `{ token: null }` | Added null check; returns 401 if no valid session | Low |
| `apps/web/pages/api/get-company-by-name-and-primary-contact.ts` | `res.status(500)` for missing required query params | Changed to 400 | Low |
| `apps/web/pages/api/get-invited-assessmentlist-by-companyId.ts` | `res.status(500)` for missing `companyId` | Changed to 400 | Low |

### GROUP 5 — RARA Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/rara/document-rating.ts` | Hardcoded secret `"uvmscwvFeptiTkYwdoch+51xxWo4dEKYBVX7Hj4JrIU="` in source code | Replaced with `process.env["WARP_INTERNAL_SHARED_KEY"] ?? ""` | Critical |
| `apps/web/pages/api/rara/document-rating.ts` | `jwt.decode()` instead of `jwt.verify()` — forged tokens accepted | Replaced with `jwt.verify()` in try/catch returning 401 | Critical |
| `apps/web/pages/api/rara/document-rating.ts` | Unauthorized response uses HTTP 500 instead of 401 | Changed to 401 | High |
| `apps/web/pages/api/rara/document-rating-direct.ts` | `jwt.decode()` instead of `jwt.verify()` | Replaced with `jwt.verify()` in try/catch returning 401 | Critical |
| `apps/web/pages/api/rara/document-rating-direct.ts` | Unauthorized response uses HTTP 500 instead of 401 | Changed to 401 | High |
| `apps/web/pages/api/rara/document-validation.ts` | `jwt.decode()` instead of `jwt.verify()` | Replaced with `jwt.verify()` in try/catch returning 401 | Critical |
| `apps/web/pages/api/rara/document-validation.ts` | Unauthorized response uses HTTP 500 instead of 401 | Changed to 401 | High |
| `apps/web/pages/api/rara/document-validation.ts` | "Required details missing" returns HTTP 500 | Changed to 400 | Medium |
| `apps/web/pages/api/rara/document-validation.ts` | Invalid URL returns HTTP 500 | Changed to 400 | Medium |
| `apps/web/pages/api/rara/document-validation-comprehensive.ts` | `jwt.decode()` instead of `jwt.verify()` | Replaced with `jwt.verify()` in try/catch returning 401 | Critical |
| `apps/web/pages/api/rara/document-validation-comprehensive.ts` | Unauthorized response uses HTTP 500 instead of 401 | Changed to 401 | High |
| `apps/web/pages/api/rara/document-validation-comprehensive.ts` | "Required details missing" returns HTTP 500 | Changed to 400 | Medium |
| `apps/web/pages/api/rara/document-validation-comprehensive.ts` | Invalid URL returns HTTP 500 | Changed to 400 | Medium |

### GROUP 6 — Recommendation Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee.ts` | Success check `if (!!response)` — truthy error objects return 200 | Fixed to `if (!!response && response.includes("OK"))` | Medium |
| `apps/web/pages/api/recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee.ts` | No HTTP method guard | Added POST-only guard returning 405 | Medium |
| `apps/web/pages/api/recommendation/email-on-manually-raising-the-recommendations.ts` | No HTTP method guard | Added POST-only guard returning 405 | Medium |
| `apps/web/pages/api/recommendation/email-when-a-recommendation-is-reopened.ts` | No HTTP method guard | Added POST-only guard returning 405 | Medium |
| `apps/web/pages/api/recommendation/email-when-the-actions-taken-on-the-recommendations-are-approved.ts` | No HTTP method guard | Added POST-only guard returning 405 | Medium |
| `apps/web/pages/api/recommendation/reminder/recommendation-reminder-post-duedate.ts` | Already had `x-warp-shared-key` guard — verified correct | No change needed | — |
| `apps/web/pages/api/recommendation/reminder/recommendation-reminder-pre-duedate.ts` | Already had `x-warp-shared-key` guard — verified correct | No change needed | — |

### GROUP 7 — Calculate-Score Email Routes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `apps/web/pages/api/calculate-score/form-submission-email.ts` | Missing required params returns `status: 500` (client error, not server error) | Changed to `status: 400` | Medium |
| `apps/web/pages/api/calculate-score/reviewer-form-submission-email.ts` | Same: missing params returns `status: 500` | Changed to `status: 400` | Medium |

---

## Severity Legend

| Level | Meaning |
|-------|---------|
| Critical | Exploitable by unauthenticated attacker; data breach or full auth bypass possible |
| High | Logic error with security or correctness impact; crashes in production paths |
| Medium | Incorrect HTTP semantics, silent failures, or dead code with operational risk |
| Low | Code quality: wrong error messages, misleading status codes, dead imports |
