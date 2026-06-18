# QA: `apps/web/pages/api/awss3/upload.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — public S3 upload endpoint

No JWT, no session check, no guard. Any HTTP client can `POST /api/awss3/upload` and upload arbitrary files to the production S3 bucket. This is a direct vector for storage abuse, malware hosting, and cost amplification attacks.

**Fix:** Add JWT verification before processing the multipart stream.

---

### [CRITICAL-2] `req.pipe(busboy)` called twice — stream consumed twice

**Lines 35, 82**

```typescript
req.pipe(busboy);  // line 35
// ... event handlers registered ...
req.pipe(busboy);  // line 82 — DUPLICATE
```

A Node.js Readable stream can only be piped once. The second `req.pipe(busboy)` call after the stream is already being consumed results in undefined behaviour — typically the second pipe receives no data, causing uploads to silently fail or produce empty files. One of these calls must be removed.

---

### [HIGH-1] `busboy.on("file", ...)` registered twice — duplicate handlers

**Lines 29–34, 37–81**

Two separate `"file"` event handlers are registered on the same busboy instance. For every uploaded file, both callbacks fire. The first increments `ArrayAcount`, the second does the upload. While this accidentally works for a single file, registering the same event type twice is fragile, confusing, and breaks in multi-file uploads if handler ordering changes.

**Fix:** Merge both into a single `"file"` handler.

---

### [HIGH-2] File size calculated from last chunk only — always wrong for large files

**Lines 44–46**

```typescript
file.on("data", function (data) {
  sizeInBytes = data.length;  // overwritten on every chunk — not accumulated
});
```

The `"data"` event fires once per buffer chunk. Assigning `data.length` instead of accumulating (`sizeInBytes += data.length`) means `sizeInBytes` is always the size of the last chunk received, not the total file size. File size metadata stored in the database will be wrong for any file larger than one chunk (~64KB).

**Fix:** `sizeInBytes += data.length;`

---

### [HIGH-3] Upload errors silently swallowed — request hangs

**Lines 48–79**

```typescript
try {
  const { ETag, ...metadata } = await upload(uploadFileName, "", FileStream);
  // ...
  ArrayData.push(objectarray);
} catch (e) {
  // empty catch — no response, no log
}
```

If `upload()` throws (S3 unreachable, credentials expired, etc.), the catch block does nothing. `ArrayData.push()` is never called, so `ArrayAcount != ArrayData.length` remains true forever, and the response at line 68 never fires. The request hangs until the client times out with no indication of what failed.

**Fix:** Send an error response in the catch block:
```typescript
} catch (e: any) {
  console.error("S3 upload failed:", e);
  return res.status(500).json({ error: e.message || "Upload failed" });
}
```

---

### [MEDIUM-1] No file type or size validation

Any file of any type and any size is accepted and uploaded. This allows:
- Malware/executables uploaded to S3
- Unbounded storage cost from giant uploads
- No MIME type enforcement

**Fix:** Validate `mimeType` against an allowlist (e.g., PDF, PNG, JPEG, XLSX) and enforce a maximum `sizeInBytes`.

---

### [MEDIUM-2] `busboy.on("error", ...)` registered inside file handler — multiple registrations

**Lines 30–32**

```typescript
busboy.on("file", (file, info) => {
  busboy.on("error", (error) => { res.status(500).send([]); });
  // ...
});
```

The error handler is registered inside the `"file"` callback, so it is added once per file uploaded. For a 3-file upload, 3 identical error handlers are registered on busboy. This means a single error fires the handler 3 times, attempting to send 3 responses — causing a "headers already sent" crash.

**Fix:** Register `busboy.on("error", ...)` once, outside the `"file"` callback.

---

### [MEDIUM-3] Outer-scope mutable variables race on concurrent files

**Lines 24–26**

```typescript
let FileStream: Stream;
let filename1 = "";
```

`FileStream` and `filename1` are shared across async file handlers. If two files are being processed concurrently (busboy emits multiple `"file"` events before the first `await upload()` resolves), the second file's values overwrite the first's. The first file ends up uploaded with the wrong filename and stream reference.

---

### [MEDIUM-4] `name: String` — wrong TypeScript type

**Line 39**

```typescript
async function (name: String, file: Stream, info: Busboy.FileInfo)
```

`String` (capital S) is the JavaScript String object constructor, not the primitive `string` type. TypeScript will accept both but `String` is incorrect usage — primitives should use lowercase `string`.

---

### [LOW-1] Significant dead code (commented-out blocks)

**Lines 56, 66, 72–78, 83–88**

Multiple commented-out blocks remain. Should be deleted.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication on S3 upload endpoint |
| CRITICAL-2 | Critical | 35, 82 | `req.pipe(busboy)` called twice — stream double-consumed |
| HIGH-1 | High | 29–81 | Two `"file"` event handlers registered on busboy |
| HIGH-2 | High | 44–46 | File size = last chunk only, not total |
| HIGH-3 | High | 48–79 | Upload errors silently swallowed — request hangs |
| MEDIUM-1 | Medium | — | No file type or size validation |
| MEDIUM-2 | Medium | 30–32 | Error handler added inside file handler — fires N×per-error |
| MEDIUM-3 | Medium | 24–26 | Shared mutable vars race on concurrent file uploads |
| MEDIUM-4 | Medium | 39 | `name: String` should be `name: string` |
| LOW-1 | Low | 56, 66, 72–88 | Commented-out dead code |

---

## Fixed File

See `upload.fixed.ts` in this directory.
