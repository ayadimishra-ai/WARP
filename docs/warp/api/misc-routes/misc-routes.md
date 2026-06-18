# QA: Misc API Routes — Upload PDF + Company/Assessment Search

**Files covered:**
- `upload-carry-forward-pdf.ts`
- `get-company-by-name-and-primary-contact.ts`
- `get-invited-assessmentlist-by-companyId.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `upload-carry-forward-pdf.ts`

### [CRITICAL-1] No authentication — anyone can upload files to S3

No JWT or session check. Any caller can upload arbitrary files to the `AI_SOURCES/<companyId>/` prefix on S3. The `companyId` comes from the request body — not from the authenticated session — so any caller can upload files under any company's prefix.

---

### [HIGH-1] No file type validation — any content type accepted

```typescript
const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
```

Only file size (10 MB) is validated. Any file type is accepted and uploaded to S3. A caller can upload executable scripts, HTML files, or malicious archives to the AI sources bucket.

**Fix:** Validate `file.mimetype` against an allowlist (e.g., `["application/pdf"]`) before upload.

---

### [MEDIUM-1] `require("stream")` inside request handler instead of top-level import

```typescript
const { Readable } = require("stream");
```

CommonJS `require()` is called inside the async request handler on every invocation. This should be a static `import { Readable } from "stream"` at the top of the file.

---

## `get-company-by-name-and-primary-contact.ts`

### [CRITICAL-2] No authentication — exposes company data to any caller

No JWT or session check. Any caller can query company name, primary contact email, and phone number for any company by passing `companyName` and `primaryContactEmail` as query parameters. Company data is sensitive PII.

---

### [HIGH-2] Missing params returns HTTP 500 instead of 400

```typescript
if (!req?.query?.companyName || !req?.query?.primaryContactEmail) {
  res.status(500).send("Company name and primary contact email is required");
}
```

Missing query parameters are a client error (400), not a server error (500).

---

### [HIGH-3] `req.query` values can be `string | string[]` — unhandled array case

```typescript
const companyName: any = req?.query?.companyName;
```

Next.js query parameters can be `string[]` if the parameter appears multiple times. Casting to `any` silently passes an array to the Hasura `_ilike` filter, which may produce unexpected query behavior. Use `Array.isArray(req.query.companyName) ? req.query.companyName[0] : req.query.companyName`.

---

### [HIGH-4] No HTTP method restriction

Accepts any HTTP method — GET, POST, DELETE, etc.

---

### [LOW-1] Typo: `responce` instead of `response`

**Line 38:** `const responce = await sdk.GetCompanyByName(...)` — "responce" is not a word.

---

## `get-invited-assessmentlist-by-companyId.ts`

### [CRITICAL-3] No authentication — exposes assessment list to any caller

No JWT or session check. Any caller can retrieve the full invited assessment list for any `companyId`.

---

### [HIGH-5] Missing `companyId` returns HTTP 500 instead of 400

```typescript
if (!body.companyId) {
  res.status(500).send("company is required");
}
```

Missing required parameter should return 400.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | upload-carry-forward-pdf.ts | No authentication — unauthenticated S3 upload |
| CRITICAL-2 | Critical | get-company-by-name-and-primary-contact.ts | No authentication — company PII exposed |
| CRITICAL-3 | Critical | get-invited-assessmentlist-by-companyId.ts | No authentication |
| HIGH-1 | High | upload-carry-forward-pdf.ts | No file type validation |
| HIGH-2 | High | get-company-by-name-and-primary-contact.ts | Missing params returns 500 instead of 400 |
| HIGH-3 | High | get-company-by-name-and-primary-contact.ts | `req.query` string array not handled |
| HIGH-4 | High | get-company-by-name-and-primary-contact.ts | No HTTP method restriction |
| HIGH-5 | High | get-invited-assessmentlist-by-companyId.ts | Missing companyId returns 500 instead of 400 |
| MEDIUM-1 | Medium | upload-carry-forward-pdf.ts | `require("stream")` inside handler |
| LOW-1 | Low | get-company-by-name-and-primary-contact.ts | `responce` typo |
