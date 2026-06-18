# QA: AI API Routes (7 files)

**Files covered:**
- `AI/AIprocessing.ts` (959 lines)
- `AI/ai-processing-completed.ts`
- `AI/ai-chat-subscription-notification.ts`
- `AI/web-curation-for-processing.ts`
- `AI/update-invitation-and-skipped-status.ts`
- `AI/update-invitation-web-curation-ai-bulk-processing.ts`
- `AI/email-invitation.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `AIprocessing.ts` — 959-line mega-handler

### [CRITICAL-1] No authentication + wildcard CORS

**Lines 483–488**

```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
```

No JWT check. Wildcard CORS. Any cross-origin client in any browser can call this endpoint directly. This is the central AI processing hub — it triggers document ingestion, web curation, OPS-to-IQ curation, AI chat queries, and embedding deletion.

---

### [CRITICAL-2] Full stack trace leaked in 500 response

**Line 949**

```typescript
return res.status(500).send({ data: null, message: error.message, stack: error.stack });
```

`error.stack` is sent to the client. Stack traces expose file paths, function names, and internal architecture to any attacker who triggers an error.

**Fix:** Remove `stack` from the response; log it server-side.

---

### [HIGH-1] 959-line switch statement — single handler for 8 unrelated operations

`processType` values: `newFormInvitation`, `dataCurationStatus`, `ingesting`, `deleteFile`, `fileParsing`, `chatQuery`, `opsToIQCuration`, `deleteParsedDocument`. These should be separate endpoints with separate auth, validation, and rate limiting policies, not branches in one 959-line function.

---

### [HIGH-2] `NEXT_PUBLIC_AIAPI_BASE_URL` used without null-guard in several cases

**Lines 518, 795, 873, 882**

```typescript
process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] + "new-form-invitation"
```

If the env var is missing, the URL becomes `"undefinednew-form-invitation"`, making invalid HTTP requests with no error thrown at configuration time.

---

### [MEDIUM-1] `AI_SERVICES_AUTHORIZATION` sent as `""` if env var missing

**Lines 800, 887**

```typescript
"x-ai-services-authorization": process.env.AI_SERVICES_AUTHORIZATION ?? "",
```

If the env var is absent, an empty string is sent as the auth header to the AI service — which the AI service may accept silently.

---

### [MEDIUM-2] Document log query limit hardcoded to 1000

**~Line 51**

```typescript
limit: 1000,
```

Fetches up to 1000 document logs per invocation. For companies with many documents, this saturates memory and the Hasura response. Should be paginated or bounded at the service design level.

---

### [MEDIUM-3] `console.log` of full OPS-to-IQ payload

**Line 790–793**

```typescript
console.log("[AIprocessing] OPS-to-IQ curation payload:", JSON.stringify(opsToIQPayload));
```

Full curation payload (including company IDs, form IDs, submission data) is written to server logs. Remove or redact.

---

## `update-invitation-and-skipped-status.ts` — broken JSON parsing

### [CRITICAL-3] No authentication + wildcard CORS

**Lines 8–13** — same pattern as AIprocessing.ts.

---

### [CRITICAL-4] `JSON.parse(req.body)` crashes — body is already an object

**Line 22**

```typescript
const { status, invitationId, invitationStatus } = JSON.parse(req.body);
```

Next.js's built-in `bodyParser` (enabled by default) automatically parses JSON request bodies into objects before the handler runs. `req.body` is already an object, not a string. `JSON.parse(object)` coerces to `JSON.parse("[object Object]")` which throws `SyntaxError`. **This endpoint is broken — it always returns 500.**

**Fix:** Remove the `JSON.parse()` call:
```typescript
const { status, invitationId, invitationStatus } = req.body;
```

---

### [HIGH-3] Raw error object leaked in 500 response

**Line 32**

```typescript
return res.status(500).send({ error: error });
```

Full `Error` object sent to client. Use `error?.message`.

---

## `web-curation-for-processing.ts` — array access without guard

### [CRITICAL-5] No authentication

---

### [HIGH-4] `req.body[0].invitationId` — crashes if body is not array

**Line 6**

```typescript
const responseData = await webCurationForProcessing(req.body[0].invitationId);
```

If the caller sends a non-array body or an empty array, this throws `TypeError: Cannot read properties of undefined`. No guard, no method restriction, no error handling.

---

### [MEDIUM-4] Wrong error message: "Failed to send email"

**Line 9** — error is "Failed to send email" for a web curation operation, not an email operation.

---

## `ai-processing-completed.ts` — mostly well done (one exception)

This is one of the best-implemented routes in the codebase: uses `crypto.timingSafeEqual`, validates input types, has proper method guard.

**Only issue:** `progressiveDelay: false` on the AI callback endpoint. While this is a server-to-server callback, false progressive delay means failed auth attempts can be retried at full speed.

---

## `ai-chat-subscription-notification.ts`

### [HIGH-5] No authentication — anyone can trigger subscription limit emails

No JWT check. Any caller with a valid-looking `companyId`, `userId`, `queryType`, `platformId` can trigger subscription exceeded notification emails.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | AIprocessing.ts | No auth + wildcard CORS |
| CRITICAL-2 | Critical | AIprocessing.ts | Full stack trace in 500 response |
| CRITICAL-3 | Critical | update-invitation-and-skipped-status.ts | No auth + wildcard CORS |
| CRITICAL-4 | Critical | update-invitation-and-skipped-status.ts | `JSON.parse(req.body)` — endpoint always returns 500 |
| CRITICAL-5 | Critical | web-curation-for-processing.ts | No auth |
| HIGH-1 | High | AIprocessing.ts | 959-line switch handler — 8 operations in one endpoint |
| HIGH-2 | High | AIprocessing.ts | `NEXT_PUBLIC_AIAPI_BASE_URL` used without null-guard |
| HIGH-3 | High | update-invitation-and-skipped-status.ts | Raw error object in 500 response |
| HIGH-4 | High | web-curation-for-processing.ts | `req.body[0]` crash without array guard |
| HIGH-5 | High | ai-chat-subscription-notification.ts | No auth — anyone can trigger subscription emails |
| MEDIUM-1 | Medium | AIprocessing.ts | `AI_SERVICES_AUTHORIZATION` defaults to empty string |
| MEDIUM-2 | Medium | AIprocessing.ts | Document log query hardcoded `limit: 1000` |
| MEDIUM-3 | Medium | AIprocessing.ts | Full curation payload logged to server logs |
| MEDIUM-4 | Medium | web-curation-for-processing.ts | Wrong error message ("Failed to send email") |
