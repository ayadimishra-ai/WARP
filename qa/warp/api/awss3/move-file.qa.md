# QA: `apps/web/pages/api/awss3/move-file.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — any caller can move any S3 file

No JWT or session check. Any unauthenticated caller can supply a `filePath` and move files between locations in the S3 bucket, including files belonging to other tenants.

---

### [HIGH-1] Arbitrary `filePath` — no tenant isolation

**Lines 20–24**

```typescript
const reqData = await DeleteS3UploadUrlRequestSchema.validate(req.body);
reqData.filePath = decodeURIComponent(reqData.filePath);
await moveFileFromPath(reqData.filePath);
```

The schema validates `filePath` as a present string but does not restrict which paths are allowed. Any valid S3 key path can be supplied. Combined with CRITICAL-1, an unauthenticated attacker can reorganize or displace files from any company in the bucket.

**Fix:** After authentication, verify `filePath` refers to a file owned by the requesting company (look up in `AnswerFile` or `DocumentLogs` table before moving).

---

### [MEDIUM-1] `interface ApiResponse` uses `any[]` for `data`

**Line 10**

```typescript
data: any[];
```

Should be typed appropriately (or `null` since this endpoint returns an empty array on both success and error).

---

### [MEDIUM-2] Error message leaked in 500 response

**Line 37**

```typescript
message: error instanceof Error ? error.message : 'An error occurred...'
```

Internal error messages from AWS SDK or internal services can surface to the caller. Use a generic message; log internally.

---

### [LOW-1] Schema name misleading: `DeleteS3UploadUrlRequestSchema` used for move-file

**Line 20**

The schema is named `DeleteS3UploadUrlRequestSchema` but used for a move operation. Schema should be named `MoveS3FileRequestSchema` or similar.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication |
| HIGH-1 | High | 20–24 | Arbitrary filePath — no tenant isolation check |
| MEDIUM-1 | Medium | 10 | `data: any[]` in ApiResponse interface |
| MEDIUM-2 | Medium | 37 | AWS error message leaked in 500 response |
| LOW-1 | Low | 20 | `DeleteS3UploadUrlRequestSchema` misnamed for move operation |
