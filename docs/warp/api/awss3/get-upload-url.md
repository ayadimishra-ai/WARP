# QA: `apps/web/pages/api/awss3/get-upload-url.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — pre-signed S3 upload URLs issued to anyone

No JWT or session check. Any unauthenticated caller can request a pre-signed S3 upload URL and then use it to upload arbitrary files directly to the production S3 bucket (within the URL's expiry window). This bypasses the `upload.ts` route entirely.

---

### [MEDIUM-1] Typo in function name: `generateS3PresignUplaodUrl`

**Line 21**

`generateS3PresignUplaodUrl` — "Uplaod" should be "Upload". The typo is in the service function name imported from `@warp/server`. The service file must be fixed and all callers updated.

---

### [LOW-1] Trailing blank line

**Line 44** — remove.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication — pre-signed S3 upload URLs issued to anyone |
| MEDIUM-1 | Medium | 21 | Typo `generateS3PresignUplaodUrl` (Uplaod → Upload) |
| LOW-1 | Low | 44 | Trailing blank line |
