# QA: Remaining AI API Routes (14 files)

**Files covered:**
- `AI/AI-dataStats-calculation.ts`
- `AI/AI-rara-document-validation.ts`
- `AI/calculate-completion-percentage.ts`
- `AI/document-processing-completed.ts`
- `AI/email-invitation.ts`
- `AI/generate-background-report.ts`
- `AI/get-chat-subscription-status.ts`
- `AI/get-formInvitation-detail.ts`
- `AI/get-invitation-isdata-curation-skipped-status..ts`
- `AI/migrate-existing-invitations-stats.ts`
- `AI/suggestion-answer-entry.ts`
- `AI/suggestion-cleanup.ts`
- `AI/update-form-invitation.ts`
- `AI/update-invitation-web-curation-ai-bulk-processing.ts`

**Status:** CRITICAL issues found across all files  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issues (all 14 files)

### [CRITICAL-1] No authentication on any of the 14 routes

None of the 14 routes verifies a JWT or session. Any unauthenticated caller can trigger:
- AI statistics queries for any invitation
- Document validation for arbitrary payloads
- Completion percentage recalculation
- Document processing completion flows
- AI invitation emails
- Background report generation
- Subscription status queries for any user/company pair
- Full FormInvitation data dumps
- Invitation skip-status lookups
- Bulk migration of AI statistics across arbitrary invitation IDs
- AI suggestion entry and cleanup
- FormInvitation status updates
- Document ingest, web curation, and OPS-to-IQ curation pipelines

---

### [HIGH-1] Wildcard CORS on 9 of 14 routes

`AI-dataStats-calculation.ts`, `get-chat-subscription-status.ts`, `get-formInvitation-detail.ts`, `get-invitation-isdata-curation-skipped-status..ts`, `suggestion-answer-entry.ts`, `update-form-invitation.ts`, `update-invitation-web-curation-ai-bulk-processing.ts`, and others all set:

```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
```

`get-chat-subscription-status.ts` even has a comment `// AITODO: remove below setHeader` acknowledging it is wrong but it was never removed.

---

### [MEDIUM-1] `progressiveDelay: false` on all rate-limited routes

All routes using `withEmailOrIpRateLimitWithProgressiveDelay` set `progressiveDelay: false`, disabling the backoff. Failed requests (including auth bypass attempts once auth is added) can be retried at full speed.

---

### [MEDIUM-2] Wrong error message: "Failed to send email" for non-email operations

`AI-rara-document-validation.ts`, `calculate-completion-percentage.ts`, `suggestion-answer-entry.ts`, `suggestion-cleanup.ts`, and `document-processing-completed.ts` all return:

```typescript
res.status(400).send({ data: null, error: "Failed to send email" });
```

These routes have nothing to do with email. This is copy-paste from the email routes and makes errors impossible to diagnose.

---

## File-Specific Issues

### `AI-dataStats-calculation.ts`

#### [HIGH-2] `isAIUser` extracted but never used

```typescript
let isAIUser = "";
if (typeof req.body == "object") {
  isAIUser = req.body.isAIUser;   // assigned
  ...
}
const responseData = await getCachedAIDataStatistics(formId, invitationId);
// isAIUser is never passed to the service call
```

`isAIUser` is extracted from the request but never forwarded to `getCachedAIDataStatistics`. If the service needs this value, behavior will be silently wrong.

#### [MEDIUM-3] Loose equality `==` for type check

**Line 20**: `if (typeof req.body == "object")` — should be `===`.

---

### `AI-rara-document-validation.ts`

#### [HIGH-3] No method guard, no input validation — raw body forwarded to service

`req.body` is forwarded directly to `raraDocumentValidation()` with no method restriction and no shape validation. Any HTTP verb and any body shape is accepted.

---

### `calculate-completion-percentage.ts`

#### [HIGH-4] `req.body.invitationIdArray` crashes if body is null/missing

```typescript
const responseData = await calculateCompletionPercentage(
  req.body.invitationIdArray,
  req.body.isForuploadDocPage
);
```

No null guard on `req.body`. If the body is absent or malformed, `req.body.invitationIdArray` throws `TypeError`.

#### [LOW-1] Property name typo: `isForuploadDocPage`

`isForuploadDocPage` — "upload" is inconsistently capitalised. Should be `isForUploadDocPage`.

---

### `document-processing-completed.ts`

#### [HIGH-5] `authorization` header logged to console despite comment saying not to

**Lines 14–17:**
```typescript
headers: {
  // avoid logging sensitive headers in production
  authorization: req.headers.authorization,  // ← logged anyway
},
```

The comment says "avoid logging sensitive headers" but the `authorization` header is still logged. Any JWT token present in the header is written to server logs.

---

### `generate-background-report.ts`

#### [CRITICAL-2] `jwt.decode()` not `jwt.verify()` — token signature not checked

**Lines 13–15:**
```typescript
const accessToken = String(req.headers.authorization);
const decodedToken: any = jwt.decode(accessToken);
session = parseHasuraClaims(decodedToken, accessToken);
```

Same critical pattern as `submit-form.ts` and `calculate-score/index.ts`: `jwt.decode()` does not verify the signature. An attacker can craft a JWT with arbitrary `x-hasura-user-id` / `x-hasura-company-id` claims and the handler will accept it.

#### [HIGH-6] Auth failure returns HTTP 500 instead of 401

**Lines 17–21:**
```typescript
if (!session) {
  return res.status(500).json({
    error: { message: "Unauthorized" },
  });
}
```

Unauthenticated requests should return 401, not 500. HTTP 500 masks auth failures as server errors.

#### [HIGH-7] No rate limiting

`generate-background-report.ts` does not use `withEmailOrIpRateLimitWithProgressiveDelay`. Any caller can trigger unlimited background report generation jobs.

---

### `get-chat-subscription-status.ts`

#### [HIGH-8] `JSON.parse((req as any).body || {})` — crashes when body is absent

**Line 36:**
```typescript
const { userId, companyId } = JSON.parse((req as any).body || {});
```

When the body is absent, `|| {}` evaluates to the object `{}`. `JSON.parse({})` coerces the object to `"[object Object]"` and throws `SyntaxError`. Should be:
```typescript
const { userId, companyId } = req.body;
```

#### [HIGH-9] No rate limiting

`get-chat-subscription-status.ts` does not use any rate-limiting wrapper and is exported directly as `default getChatWithSnowkapAIStatusHandler`.

---

### `get-formInvitation-detail.ts`

#### [CRITICAL-3] `JSON.parse(req.body)` — crashes because body is already parsed

**Line 29:**
```typescript
const { companyId, invitationId, userId } = JSON.parse(req.body);
```

Next.js's built-in body parser already parses JSON before the handler runs. `JSON.parse(object)` coerces to `JSON.parse("[object Object]")` which always throws `SyntaxError`. **This endpoint is broken and always returns 500.**

#### [HIGH-10] Raw error object in 500 response

**Line 87:**
```typescript
return res.status(500).send({ error: error });
```

Full `Error` object sent to client. Use `error?.message`.

#### [HIGH-11] `maxRequestCount: 1000` — rate limit 17× higher than all other routes

All other AI routes use `maxRequestCount: 60`. This route uses `1000` with no justification.

#### [MEDIUM-4] Method check inside try block, after `JSON.parse` — GET crashes before method guard fires

The method guard `if (req.method === "POST")` is on line 31, after the `JSON.parse(req.body)` on line 29. A GET request with no body hits the JSON.parse crash before the method check can reject it.

---

### `get-invitation-isdata-curation-skipped-status..ts`

#### [LOW-2] Double dot in filename: `get-invitation-isdata-curation-skipped-status..ts`

The filename has two consecutive dots before the extension. This is likely a typo. While it is a valid filename on most filesystems, it is inconsistent with all other files and produces an awkward URL (`/api/AI/get-invitation-isdata-curation-skipped-status.`).

#### [CRITICAL-4] `JSON.parse(req.body)` — endpoint always crashes (same pattern as CRITICAL-3)

**Line 22:**
```typescript
const { invitationId } = JSON.parse(req.body);
```

Identical broken pattern. This endpoint always returns 500.

#### [HIGH-12] Raw error object in 500 response

**Line 34:**
```typescript
return res.status(500).send({ error: error });
```

#### [MEDIUM-5] Method check after JSON.parse — GET requests crash before guard fires

Same ordering issue as `get-formInvitation-detail.ts`.

---

### `migrate-existing-invitations-stats.ts`

#### [CRITICAL-5] No rate limiting on a bulk migration endpoint — no auth, no throttle

This file has no `withEmailOrIpRateLimitWithProgressiveDelay` wrapper and no authentication. Any caller can submit an `invitationIds` array of arbitrary length and force the server to run DB queries + AI statistics calculations for each item synchronously, one by one, until the request times out or exhausts database connections.

#### [HIGH-13] No upper bound on `invitationIds` array

```typescript
for (const invitationId of invitationIds) { ... }
```

No `maxLength` or batch size check. An array of 100,000 items would run 100,000 sequential SDK calls without interruption.

#### [MEDIUM-6] `error.message` exposed in 500 response

```typescript
return res.status(500).json({ error: "Internal server error", message: error.message });
```

Internal error messages from the database or AI service are forwarded to the client.

---

### `update-form-invitation.ts`

#### [CRITICAL-6] `JSON.parse(req.body)` — endpoint always crashes

**Line 24:**
```typescript
const { invitationId, invitationStatus } = JSON.parse(req.body);
```

Same broken pattern. This endpoint always returns 500.

#### [HIGH-14] Raw error object in 500 response

**Line 67:**
```typescript
return res.status(500).send({ error: error });
```

#### [MEDIUM-7] Method check after JSON.parse — GET requests crash before guard fires

---

### `update-invitation-web-curation-ai-bulk-processing.ts`

#### [HIGH-15] Verbose console.log with sensitive OPS payload

**Lines ~100 and ~119:**
```typescript
console.log("[API] Triggering OPS-to-IQ curation:", opsToIQPayload);
console.log("[AI][meta] read existingAIData:", JSON.stringify(existingAIData), "| inv:", invitationId, "| existingMetadata:", JSON.stringify(existingMetadata));
```

Full OPS-to-IQ curation payload (companyId, formId, submissionId, opsCompanyId, opsCompanyName) and metadata are written to server logs. Remove or redact.

#### [HIGH-16] Returns HTTP 200 even when all AI tasks fail

```typescript
const settled = await Promise.allSettled(tasks);
// ... partial result mapping ...
return res.status(200).send({ ok: true, results });
```

`Promise.allSettled` is used (correct), but the response is always `200` with `ok: true` regardless of task outcomes. Callers cannot distinguish "all tasks succeeded" from "all tasks failed". Should return a non-200 status or set `ok: false` when all tasks are rejected.

#### [MEDIUM-8] Method guard checked after CORS headers and body parsing

CORS headers are set unconditionally (lines 13–18). The `OPTIONS` handler (line 21) is correct, but `if (req.method !== "POST")` comes after body parsing. The CORS headers are set even for invalid methods.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | All 14 | No authentication |
| CRITICAL-2 | Critical | generate-background-report.ts | `jwt.decode()` not `jwt.verify()` |
| CRITICAL-3 | Critical | get-formInvitation-detail.ts | `JSON.parse(req.body)` — endpoint always 500 |
| CRITICAL-4 | Critical | get-invitation-isdata-curation-skipped-status..ts | `JSON.parse(req.body)` — endpoint always 500 |
| CRITICAL-5 | Critical | migrate-existing-invitations-stats.ts | No auth + no rate limiting on bulk migration endpoint |
| CRITICAL-6 | Critical | update-form-invitation.ts | `JSON.parse(req.body)` — endpoint always 500 |
| HIGH-1 | High | 9 files | Wildcard CORS (`Access-Control-Allow-Origin: *`) |
| HIGH-2 | High | AI-dataStats-calculation.ts | `isAIUser` extracted but never used |
| HIGH-3 | High | AI-rara-document-validation.ts | No method guard, raw body forwarded |
| HIGH-4 | High | calculate-completion-percentage.ts | `req.body.invitationIdArray` — no null guard |
| HIGH-5 | High | document-processing-completed.ts | `authorization` header logged despite comment |
| HIGH-6 | High | generate-background-report.ts | Auth failure returns 500 instead of 401 |
| HIGH-7 | High | generate-background-report.ts | No rate limiting |
| HIGH-8 | High | get-chat-subscription-status.ts | `JSON.parse({})` — SyntaxError crash when body absent |
| HIGH-9 | High | get-chat-subscription-status.ts | No rate limiting |
| HIGH-10 | High | get-formInvitation-detail.ts | Raw error object in 500 response |
| HIGH-11 | High | get-formInvitation-detail.ts | `maxRequestCount: 1000` — 17× higher than other routes |
| HIGH-12 | High | get-invitation-isdata-curation-skipped-status..ts | Raw error object in 500 response |
| HIGH-13 | High | migrate-existing-invitations-stats.ts | No array size limit |
| HIGH-14 | High | update-form-invitation.ts | Raw error object in 500 response |
| HIGH-15 | High | update-invitation-web-curation-ai-bulk-processing.ts | Sensitive OPS payload logged to console |
| HIGH-16 | High | update-invitation-web-curation-ai-bulk-processing.ts | HTTP 200 returned even when all AI tasks fail |
| MEDIUM-1 | Medium | All rate-limited routes | `progressiveDelay: false` |
| MEDIUM-2 | Medium | 5 files | Wrong error message "Failed to send email" |
| MEDIUM-3 | Medium | AI-dataStats-calculation.ts | Loose equality `==` for type check |
| MEDIUM-4 | Medium | get-formInvitation-detail.ts | Method check after JSON.parse — wrong ordering |
| MEDIUM-5 | Medium | get-invitation-isdata-curation-skipped-status..ts | Method check after JSON.parse — wrong ordering |
| MEDIUM-6 | Medium | migrate-existing-invitations-stats.ts | `error.message` in 500 response |
| MEDIUM-7 | Medium | update-form-invitation.ts | Method check after JSON.parse — wrong ordering |
| MEDIUM-8 | Medium | update-invitation-web-curation-ai-bulk-processing.ts | CORS headers set before method guard |
| LOW-1 | Low | calculate-completion-percentage.ts | `isForuploadDocPage` — capitalisation typo |
| LOW-2 | Low | get-invitation-isdata-curation-skipped-status..ts | Double dot in filename |
