# QA: `progress-report-score.ts` + `interiam/index.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `progress-report-score.ts`

### [CRITICAL-1] `jwt.decode()` not `jwt.verify()` + no auth enforcement

**Lines 193–196:**
```typescript
const accessToken = String(req.headers.authorization);
const decodedToken: any = jwt.decode(accessToken);
session = parseHasuraClaims(decodedToken, accessToken);
```

`jwt.decode()` does not verify the token signature. Additionally, `let session: any = ""` is never checked for truthiness — if the `Authorization` header is absent, `session` remains `""` and processing continues without any auth error. The endpoint is functionally unauthenticated for callers who omit the header.

---

### [HIGH-1] `forEach` + async — race condition in score tree traversal

**Lines 67, 87, 96:**
```typescript
currentSection.Questions.forEach(async (question) => { ... });
currentSection.children.forEach((m) => calculateChildrenScore(m));
treeMapSections.forEach((section) => calculateChildrenScore(section));
```

Three separate `forEach` calls dispatch async functions without awaiting them. Parent score calculations run before children complete. `sectionScoreInput` mutations from children may not be visible when parent scores are computed. Same defect as `calculate-score/index.ts` [HIGH-1].

**Fix:** Replace all three with `for...of` + `await`.

---

### [HIGH-2] Missing required params returns HTTP 500 instead of 400

```typescript
if (!formId || !submissionId || !invitationId || !isApproved)
  return { status: 500, result: { error: { message: "Required details missing" } } };
```

Client-supplied missing parameters should return 400 Bad Request.

---

### [MEDIUM-1] `invitationStatus` declared but never used

**Lines 189–190:**
```typescript
let invitationStatus: string = FormInvitationStatus.Submitted;
```

`invitationStatus` is declared and set, but never used anywhere. The role check that would use it is commented out (lines 198–200).

---

### [MEDIUM-2] `error || "Internal Server Error"` — full Error object to client

```typescript
res.status(500).json({ error: error || "Internal Server Error" });
```

---

---

## `interiam/index.ts`

### [CRITICAL-2] No authentication — mutations exposed on unauthenticated endpoint

No JWT or session check. Any caller can bulk-insert `Interim_Answer` and `Interim_Recommendation` records into any submission.

---

### [CRITICAL-3] `ApiMethodGuard("GET")` — mutation endpoint declared as GET

**Line 178:**
```typescript
const handler = ApiErrorGuard(ApiMethodGuard(interimAnswerHandler, "GET"));
```

This endpoint inserts answers and recommendations into the database but is registered as a `GET` route. HTTP GET must not have side effects. Any GET-caching layer (CDN, proxy) could suppress the request, and HTTP clients may retry GET requests automatically.

**Fix:** Change to `"POST"`.

---

### [HIGH-1] `updateInterimanswer` initialized as `[]` — entire update block is dead code

**Lines 52–73:**
```typescript
let updateInterimanswer: any = [];
updateInterimanswer?.map(async (m: any) => { ... });
if (updateInterimanswer.length > 0) {
  // ... never executes
}
```

`updateInterimanswer` is initialized as an empty array and never populated with request data. The `.map()` runs 0 iterations. `updateInterimanswer.length > 0` is always false. The entire update block is unreachable dead code. No interim answers are ever updated by this endpoint.

---

### [HIGH-2] `interimAnswerId` shared across concurrent `Promise.all` iterations — race condition

**Line 78:**
```typescript
let interimAnswerId: any = null;
await Promise.all(
  interimAnswer?.map(async (x: any) => {
    interimAnswerId = null;  // shared mutable variable
    // ...
    interimAnswerId = ...;   // multiple concurrent writes
    await finalInterimAnswerData.push({ interim_answer_id: interimAnswerId });
    interimAnswerId = null;
  })
);
```

`interimAnswerId` is a `let` variable in the outer scope, written from multiple concurrent async callbacks. By the time any one callback reads it, another callback may have overwritten it. The `interim_answer_id` in the resulting records will be non-deterministic.

---

### [HIGH-3] `await Array.push()` — no-op await that hides concurrency confusion

```typescript
await finalInterimAnswerData.push({ ... });
await interimRecommend.push({ ... });
```

`Array.prototype.push` is synchronous. `await`ing it does nothing. This pattern suggests the author intended atomic async inserts but the concurrent writes to shared arrays still create race conditions.

---

### [LOW-1] `res.status(200).json("hello world")` — non-structured response

**Line 175:** The endpoint returns the string `"hello world"` as the HTTP 200 body instead of structured result data. Callers receive no meaningful information about what was inserted.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | progress-report-score.ts | `jwt.decode()` + no auth enforcement |
| CRITICAL-2 | Critical | interiam/index.ts | No authentication |
| CRITICAL-3 | Critical | interiam/index.ts | GET method for mutation endpoint |
| HIGH-1 | High | progress-report-score.ts | `forEach` + async race condition in score tree |
| HIGH-2 | High | progress-report-score.ts | Missing params returns 500 instead of 400 |
| HIGH-1 | High | interiam/index.ts | `updateInterimanswer` dead code — updates never run |
| HIGH-2 | High | interiam/index.ts | `interimAnswerId` shared across concurrent callbacks |
| HIGH-3 | High | interiam/index.ts | `await Array.push()` — no-op await |
| MEDIUM-1 | Medium | progress-report-score.ts | `invitationStatus` declared but unused |
| MEDIUM-2 | Medium | progress-report-score.ts | Full Error object sent to client |
| LOW-1 | Low | interiam/index.ts | `"hello world"` response body |
