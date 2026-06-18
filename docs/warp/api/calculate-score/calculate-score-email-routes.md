# QA: `calculate-score/form-submission-email.ts` + `calculate-score/reviewer-form-submission-email.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issues (both files)

### [CRITICAL-1] No authentication

Neither route verifies a JWT or session. Any caller can trigger form submission emails for any `formId` / `invitationId` / `companyId` combination. The `GlobalMaster` email gate (`shouldSendEmail`) can be bypassed by anyone who knows the right `formId`.

Both files contain commented-out authentication code (lines 23–28 in `form-submission-email.ts`) that was removed and never replaced:

```typescript
// if (!!req?.headers?.authorization) {
//   const accessToken = String(req.headers.authorization);
//   const decodedToken: any = jwt.decode(accessToken);
//   session = parseHasuraClaims(decodedToken, accessToken);
// }
```

---

### [HIGH-1] Hardcoded `platformId` default UUID baked into source

**Line 14 (both files):**
```typescript
platformId: string = "8459adc3-5375-4828-b127-4fc630b16c44"
```

A production UUID is hardcoded as a default parameter. If the caller omits `platformId`, this hardcoded value is used silently, sending emails against the wrong platform configuration. Should come from an environment variable or be required.

---

### [HIGH-2] Missing required params returns HTTP 500 instead of 400

```typescript
if (!formId || !submissionId || !invitationId || !companyId)
  return { status: 500, result: { error: { message: "Required details missing" } } };
```

Missing required parameters are a client error (400 Bad Request), not a server error (500 Internal Server Error).

---

### [HIGH-3] `error || "Internal Server Error"` — full Error object sent to client

**Line 58 (form-submission-email.ts), line 51 (reviewer-form-submission-email.ts):**
```typescript
result: { error: error || "Internal Server Error" }
```

If `error` is truthy (which it almost always is), the full `Error` object (including message and stack if serialized) is returned to the client.

---

### [MEDIUM-1] Duplicate exported function name `processFormSubmissionEmail`

Both files export a function named `processFormSubmissionEmail`. If both are imported in the same module, the second import silently shadows the first, causing incorrect email type to be sent.

---

## Summary Table

| ID | Severity | Issue |
|---|---|---|
| CRITICAL-1 | Critical | No authentication on both email routes |
| HIGH-1 | High | Hardcoded production `platformId` UUID as default parameter |
| HIGH-2 | High | Missing params returns HTTP 500 instead of 400 |
| HIGH-3 | High | Full Error object returned to client |
| MEDIUM-1 | Medium | Duplicate exported function name across both files |
