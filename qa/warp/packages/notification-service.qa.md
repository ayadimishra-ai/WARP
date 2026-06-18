# QA: packages/server/services/notification.service.ts

**File:** `packages/server/services/notification.service.ts` (7,498 lines)  
**Status:** LOW issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## [MEDIUM-1] Stray `debugger` statement at line 4549

**Location:** Inside `reviewerApprovedEmail` function, line 4549.

```typescript
export const reviewerApprovedEmail = async (...) => {
  // ...
  debugger; // ← line 4549
  // ...
};
```

A `debugger` statement in production code pauses JavaScript execution when the Node.js process is launched with `--inspect` or `--inspect-brk` (e.g., for remote debugging). In production Node.js without a debugger attached, `debugger` is a no-op — but it signals that the function was actively debugged and was not cleaned up before shipping.

**Fix:** Remove the `debugger` statement.

---

## [LOW-1] Inconsistent error logging in notification functions

Several notification functions use `console.error`, `console.log`, and `console.warn` inconsistently without structured logging. Errors are logged to stdout and S3 separately — some functions log to neither.

**Fix:** Standardize on a single structured logger that includes function name, invitationId, and timestamp in every log entry.

---

## [LOW-2] Email template renders HTML strings without sanitization

`sendCompanyAIInvitationEmail`, `sendFileCurationCompletionEmail`, and others build HTML email bodies using template string interpolation (`<p>${value}</p>`). Values from the database (company names, document names, user names) are interpolated directly. If a DB record contains HTML metacharacters (`<`, `>`, `&`, `"`), the email body could be malformed.

This does not affect end-user browsers (email clients, not WARP pages), but could break email rendering.

**Fix:** HTML-encode dynamic values before interpolating into email templates (e.g., replace `&` → `&amp;`, `<` → `&lt;`).

---

## [LOW-3] Hardcoded date format strings

Several functions format dates as `"DD MMM, YYYY"` (e.g., `sendAssessmentApprovedMail`). No locale or timezone is applied — dates are formatted in the server's system timezone, which may not match the user's locale.

---

## Summary Table

| ID | Severity | Issue |
|---|---|---|
| MEDIUM-1 | Medium | Stray `debugger` at line 4549 in reviewerApprovedEmail |
| LOW-1 | Low | Inconsistent error logging across functions |
| LOW-2 | Low | Dynamic values in email templates not HTML-encoded |
| LOW-3 | Low | Date formatting ignores locale/timezone |
