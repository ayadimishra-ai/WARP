# QA: `apps/web/pages/api/awss3/download.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — anyone can download any S3 file

No JWT, no session, no guard. Any unauthenticated HTTP client with knowledge of (or ability to guess) an S3 file key can download arbitrary files from the production bucket, including documents belonging to other companies.

---

### [CRITICAL-2] No tenant isolation — direct S3 key access

**Lines 27–29**

```typescript
const fileName = req?.query?.file;
const result = await download(fileName);
```

The `file` query parameter is passed directly to S3 without any verification that the requesting user has permission to access it. If a user knows or can guess the S3 key of a file belonging to a different company, they can download it. S3 keys are generated with `nanoid(32)` (file 6) — guessable only by brute force, but the lack of access control is an architectural flaw.

**Fix:** Look up the requested file in the `AnswerFile` table and verify `companyId` matches the session.

---

### [HIGH-1] No HTTP method restriction

No `ApiMethodGuard` or manual method check. Accepts `GET`, `POST`, `PUT`, `DELETE`, etc. for a download operation.

---

### [HIGH-2] Missing file param returns 500 instead of 400

**Lines 23–25**

```typescript
if (!req?.query?.file) {
  res.status(500).send("No file to download");
}
```

A missing query parameter is a client error (400), not a server error (500).

---

### [MEDIUM-1] `fileName` can be `string[]` — unhandled

**Line 27**

`req.query.file` is typed `string | string[]`. If the query string contains `?file=a&file=b`, `fileName` is an array and `download(fileName)` receives `string[]`, which will cause a runtime type error.

**Fix:** `const fileName = Array.isArray(req.query.file) ? req.query.file[0] : req.query.file;`

---

### [MEDIUM-2] `Content-Disposition` filename not quoted

**Line 39**

```typescript
res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
```

If `fileName` contains spaces or special characters (e.g., S3 keys with `+` or `=`), the header is malformed per RFC 6266. Should be: `attachment; filename="${fileName}"`.

---

### [LOW-1] Commented-out debug log

**Line 31** — remove.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication |
| CRITICAL-2 | Critical | 27–29 | No tenant isolation — any S3 key downloadable |
| HIGH-1 | High | — | No HTTP method restriction |
| HIGH-2 | High | 24 | Missing param returns 500 instead of 400 |
| MEDIUM-1 | Medium | 27 | `fileName` can be `string[]` — not handled |
| MEDIUM-2 | Medium | 39 | `Content-Disposition` filename not quoted |
| LOW-1 | Low | 31 | Commented-out debug log |
