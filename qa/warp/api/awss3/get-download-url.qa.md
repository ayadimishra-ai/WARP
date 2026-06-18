# QA: `apps/web/pages/api/awss3/get-download-url.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication

No JWT or session check. Any caller can request a pre-signed download URL. Combined with CRITICAL-2, this is a full file access bypass.

---

### [CRITICAL-2] `getDownloadURL()` called with no file identifier — stub-level implementation

**Lines 6–8**

```typescript
const GetDownloadData: NextApiHandler = async (req, res) => {
  const data = await getDownloadURL();  // no file key/path passed
  res.status(200).json(data);
};
```

`getDownloadURL()` is called with zero arguments. There is no way for this function to know which file to generate a pre-signed URL for without being given a file key. This is either:
1. A stub that was never completed (the function ignores its argument or uses a hardcoded key internally), or
2. A completely non-functional endpoint.

The request body and query params are entirely ignored.

**Fix:** Accept a file key in the request body/query, verify the caller has access to that file, then pass the key to `getDownloadURL(key)`.

---

### [LOW-1] Trailing blank lines

**Lines 23–25** — remove.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication |
| CRITICAL-2 | Critical | 7 | `getDownloadURL()` called with no file identifier — stub |
| LOW-1 | Low | 23–25 | Trailing blank lines |
