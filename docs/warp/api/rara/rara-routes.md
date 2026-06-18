# QA: RARA Document API Routes (5 files)

**Files covered:**
- `rara/document-rating.ts`
- `rara/document-rating-direct.ts`
- `rara/document-rating-single.ts`
- `rara/document-validation.ts`
- `rara/document-validation-comprehensive.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issues (all 5 files)

### [CRITICAL-1] `jwt.decode()` not `jwt.verify()` — token signature not verified (all 5 files)

```typescript
const decodedToken: any = jwt.decode(accessToken);
session = parseHasuraClaims(decodedToken, accessToken);
```

The same critical pattern as `submit-form.ts`, `calculate-score/index.ts`, and five other routes: the JWT signature is never verified. An attacker can craft a JWT with arbitrary Hasura claims and gain access.

---

### [HIGH-1] Auth failure returns HTTP 500 instead of 401 (all 5 files)

```typescript
if (!session) {
  return res.status(500).json({ error: { message: "Unauthorized" } });
}
```

Unauthenticated requests should return 401 Not Authorized, not 500 Internal Server Error.

---

### [MEDIUM-1] `AI_SERVICES_AUTHORIZATION ?? ""` — empty string forwarded to AI service if env var missing

**document-rating-direct.ts, document-rating-single.ts, document-validation.ts, document-validation-comprehensive.ts:**
```typescript
"x-ai-services-authorization": process.env["AI_SERVICES_AUTHORIZATION"] ?? "",
```

If the env var is absent, an empty string is forwarded as the AI services auth header. The downstream service may silently accept this.

---

## `document-rating.ts` — fire-and-forget + SSRF

### [CRITICAL-2] Ineffective URL validation inside `forEach` — return value is silently discarded

**Lines ~83–92:**
```typescript
ratingApiBodyInputs.forEach((item: any) => {
  const isValidUrl = urlCheck(item?.file?.path);
  if (!isValidUrl) {
    return {  // ← returns from the forEach callback, NOT from the outer function
      error: { message: "Document url is not valid" },
      status: 500,
    };
  }
  // ... proceeds to fetch even if URL invalid on other items
  fetch(appurl + "/api/rara/document-rating-single", { ... });
});
```

The `return { error: ... }` inside `forEach` returns from the callback function, not from `handler()`. Invalid URLs are silently skipped and execution continues. No response indicating the error is sent to the caller.

### [HIGH-2] Fire-and-forget `fetch()` calls — errors silently swallowed

The inner `fetch(appurl + "/api/rara/document-rating-single", ...)` calls are not awaited. Errors are silently discarded. The handler always returns HTTP 200 regardless of whether any document rating requests were successfully dispatched.

### [HIGH-3] `appurl` from env var without null-guard — malformed URLs if missing

```typescript
const appurl = process.env.NEXT_PUBLIC_API_BASE_URL;
fetch(appurl + "/api/rara/document-rating-single", ...)
```

If `NEXT_PUBLIC_API_BASE_URL` is missing, `appurl` is `undefined`, producing `"undefined/api/rara/..."` as the fetch URL.

### [HIGH-4] Hardcoded `internalSharedKey` in source

```typescript
const internalSharedKey = "uvmscwvFeptiTkYwdoch+51xxWo4dEKYBVX7Hj4JrIU=";
```

This shared key is baked into source code (and git history) even though its usage is commented out. Rotate this key.

---

## `document-rating-direct.ts` — SSRF via DB URL

### [HIGH-5] SSRF — external API URL read from `GlobalMaster` DB without allowlist validation

```typescript
const raraCheckConfig = raraData.data.find((config: any) => config.name === "rara-check");
url = raraCheckConfig.url || "";
// ...
const ratingResponse = await axios({ method: "POST", url: url, ... });
```

The URL used for the external RARA API call comes from the `GlobalMaster` database table. If an attacker can modify a `GlobalMaster` record, they can redirect the server's outbound requests to any internal or external host — a Server-Side Request Forgery vector. Same pattern as `calculate-score/index.ts` CRITICAL-3.

**Fix:** Validate `url` against a strict allowlist of known RARA service endpoints before calling.

---

## `document-rating-single.ts` — Client-controlled SSRF

### [CRITICAL-3] SSRF — external API URL comes directly from client request body

```typescript
const { url, auth_key, ... } = req.body;
const raraApiResponse = await fetch(url, {
  headers: { Authorization: auth_key, ... }
});
```

The URL **and the auth key** to call are both supplied by the client. Any authenticated caller can direct the server to make authenticated HTTP requests to any arbitrary URL — a full SSRF with credential forwarding. This is the most severe SSRF pattern in the codebase: client-controlled both target and credentials.

### [HIGH-6] Commented-out `internalSharedKey` check exposes key in source

```typescript
const internalSharedKey = "uvmscwvFeptiTkYwdoch+51xxWo4dEKYBVX7Hj4JrIU=";
// const requestAuthKey = req?.headers?.authorization;
// if (requestAuthKey !== internalSharedKey) { return res.status(401)... }
```

The intended internal-only auth guard was removed, leaving only the hardcoded key in source. Same key as `document-rating.ts` — rotate both.

---

## `document-validation.ts` + `document-validation-comprehensive.ts`

### [HIGH-7] Missing required params returns HTTP 500 instead of 400 (both files)

```typescript
if (!document_url || !document_name || ...)
  return res.status(500).json({ error: { message: "Required details missing" } });
```

Missing parameters are a client error (400), not a server error (500).

### [HIGH-8] `ValidationApiDetails[0].url` crashes if filter returns empty array (both files)

```typescript
ValidationApiDetails = responseData.GlobalMaster[0].data.filter(
  (item: any) => item.name === "Document-validation"
);
// ...
docValidRes = await fetch(ValidationApiDetails[0].url, config);
```

If no record matches the filter, `ValidationApiDetails[0]` is `undefined`. `.url` then throws `TypeError`.

### [HIGH-9] SSRF — external API URL from `GlobalMaster.data[].url` without allowlist (both files)

Same pattern as `document-rating-direct.ts` — the URL for the external validation API call comes from a database record. If the database record is modified, the server will call any URL.

---

## Summary Table

| ID | Severity | File(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | All 5 | `jwt.decode()` not `jwt.verify()` |
| CRITICAL-2 | Critical | document-rating.ts | URL validation in `forEach` — return value discarded, fires anyway |
| CRITICAL-3 | Critical | document-rating-single.ts | Client-controlled SSRF — URL and auth_key from request body |
| HIGH-1 | High | All 5 | Auth failure returns 500 instead of 401 |
| HIGH-2 | High | document-rating.ts | Fire-and-forget `fetch()` — errors silently swallowed |
| HIGH-3 | High | document-rating.ts | `NEXT_PUBLIC_API_BASE_URL` used without null-guard |
| HIGH-4 | High | document-rating.ts + document-rating-single.ts | Hardcoded `internalSharedKey` in source |
| HIGH-5 | High | document-rating-direct.ts | SSRF via `GlobalMaster.url` without allowlist |
| HIGH-6 | High | document-rating-single.ts | Commented-out auth guard exposes key |
| HIGH-7 | High | document-validation (both) | Missing params returns 500 instead of 400 |
| HIGH-8 | High | document-validation (both) | `ValidationApiDetails[0].url` crashes if filter is empty |
| HIGH-9 | High | document-validation (both) | SSRF via `GlobalMaster.url` without allowlist |
| MEDIUM-1 | Medium | 4 files | `AI_SERVICES_AUTHORIZATION` defaults to empty string |
