# QA: `apps/web/pages/api/submit-form.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] JWT decoded without signature verification — auth is completely bypassable

**Lines 11–15**

```typescript
const accessToken = String(req.headers.authorization);
const decodedToken: any = jwt.decode(accessToken);  // ← NOT jwt.verify()
session = parseHasuraClaims(decodedToken, accessToken);
```

`jwt.decode()` only base64-decodes the token payload. It does **not** verify the signature. Any attacker can craft a JWT with arbitrary `x-hasura-user-id`, `x-hasura-company-id`, or role claims and this handler will accept it as authenticated.

This is the most critical class of JWT vulnerability — the authentication check provides zero protection.

**Fix:** Replace `jwt.decode` with `jwt.verify`:

```typescript
const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) throw new Error("HASURA_GRAPHQL_JWT_SECRET required");

// in handler:
const decodedToken = jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET, {
  algorithms: ["HS256"],
}) as Record<string, any>;
```

---

### [CRITICAL-2] No ownership check — any authenticated user can submit any form

**Lines 23–36**

The handler only checks that a parseable token exists. It does not verify that the `session.companyId` or `session.userId` has any relationship to the `submissionId` being submitted. A valid token holder for Company A can submit FormSubmission records belonging to Company B.

**Fix:** After parsing the session, verify the submission belongs to the caller:

```typescript
const submission = await sdk.getSubmissionById({ submissionId });
if (submission.FormSubmission_by_pk?.CompanyForm?.Company?.id !== session.companyId) {
  return res.status(403).json({ error: { message: "Forbidden" } });
}
```

---

### [HIGH-1] Auth failure returns HTTP 500 instead of 401

**Lines 16–22**

```typescript
return res.status(500).json({
  error: { message: "Unauthorized" },
});
```

An authentication failure is a client error (401 Unauthorized), not a server error (500). Returning 500 for auth failures misleads callers, monitoring systems, and error trackers.

**Fix:** `res.status(401)`

---

### [HIGH-2] Validation failure leaks request body in error response

**Lines 24–30**

```typescript
return res.status(500).json({
  error: {
    message: "Required details are missing",
    data: req.body,   // ← full request body returned to caller
  },
});
```

The entire request body is echoed back in the error response. If `req.body` contains sensitive data (answer content, file references), this leaks it. Status code should also be 400, not 500.

**Fix:** Return only a generic message; do not echo `req.body`. Use `res.status(400)`.

---

### [HIGH-3] Mutation result is never checked — returns 200 on DB failure

**Lines 32–36**

```typescript
const submissionDetails = await sdk.updateSubmissionStatus({
  submissionId,
  submissionStatus: FormSubmissionStatus.Submitted,
});
return res.status(200).send({ data: "Success", error: null });
```

`submissionDetails` is assigned but never inspected. If the Hasura mutation silently fails (e.g., no row matched the `submissionId`), the handler still returns 200 "Success". The submission status is not actually changed but the frontend proceeds as if it were.

**Fix:** Check the mutation affected count:

```typescript
const result = await sdk.updateSubmissionStatus({ submissionId, submissionStatus: FormSubmissionStatus.Submitted });
if (!result.update_FormSubmission?.affected_rows) {
  return res.status(404).json({ error: { message: "Submission not found" } });
}
```

---

### [LOW-1] `submissionDetails` variable declared but never used

**Line 32**

```typescript
const submissionDetails = await sdk.updateSubmissionStatus({...});
```

The result is never read. After fixing HIGH-3 this becomes used, but currently it's dead assignment.

---

### [LOW-2] Post-submission processing not triggered from this handler

Per the workflow spec, after setting status to `"Submitted"` the caller must separately call `POST /api/v1/internal/post-form-submission` to start score calculation. This handler does not trigger that call — responsibility falls entirely on the frontend. If the frontend fails or is interrupted between the two calls, the submission is stranded in `"Submitted"` status with no score ever computed.

**Recommendation:** Either trigger post-submission processing from within this handler, or document the two-call contract explicitly in both the handler and the frontend call site.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | 13 | `jwt.decode` instead of `jwt.verify` — signatures never checked |
| CRITICAL-2 | Critical | 23–36 | No ownership check — any user can submit any submission |
| HIGH-1 | High | 17 | Auth failure returns 500 instead of 401 |
| HIGH-2 | High | 26–29 | Request body echoed in validation error response |
| HIGH-3 | High | 32–36 | Mutation result unchecked — returns 200 even on DB failure |
| LOW-1 | Low | 32 | `submissionDetails` assigned but never read |
| LOW-2 | Low | — | Post-submission processing not triggered; frontend-only contract |

---

## Fixed File

See `submit-form.fixed.ts` in this directory.
