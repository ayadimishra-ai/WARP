# QA: `apps/web/pages/api/v1/platform/company/send-invitation.ts`

**Status:** HIGH issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Overview

Clean structure: uses `ApiErrorGuard` + `ApiMethodGuard` and Yup schema validation. Main gap is authentication.

---

## Issues Found

### [CRITICAL-1] No authentication — anyone can send invitations as any company

No JWT or session check. Any caller can `POST /api/v1/platform/company/send-invitation` with any `companyId` + `email` + `formId` and create `FormInvitation` records on behalf of any company. This is a direct business logic bypass — invitations are the core workflow trigger.

---

### [HIGH-1] No ownership check — `companyId` not verified against session

Even after authentication is added, each item's `companyId` must be verified to match the authenticated user's company. Currently, a valid user from Company A could send invitations on behalf of Company B by including Company B's `companyId` in the array.

---

### [MEDIUM-1] Array input — no upper bound on batch size

The schema accepts an array of arbitrary length. A caller can send thousands of invitation records in a single request, causing unbounded writes and email sending. Add a max array length constraint.

---

### [LOW-1] Handler name typo: `sendInvitationhandler` (lowercase 'h')

**Line 15** — should be `sendInvitationHandler`.

---

### [LOW-2] Trailing blank lines

**Lines 27–28** — remove.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication |
| HIGH-1 | High | 20 | No ownership check on `companyId` per array item |
| MEDIUM-1 | Medium | 7–13 | No batch size limit on array input |
| LOW-1 | Low | 15 | `sendInvitationhandler` — lowercase 'h' |
| LOW-2 | Low | 27–28 | Trailing blank lines |
