# QA: `apps/web/pages/api/calculate-score/index.ts`

**Status:** CRITICAL issues found — most complex and highest-risk file reviewed so far  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] Module-level mutable state shared across requests — concurrency data corruption

**Line 21**

```typescript
let recommendationWithFormfieldData: any = [];
```

This array is declared at **module scope**. Next.js caches API route modules between requests — in production this array persists across requests and is shared between concurrent callers. It is reset on line 575 (`recommendationWithFormfieldData = []`) only inside a conditional path. Any error or early exit before line 575 leaves stale recommendation data for the next request.

**Scenario:** Request A processes Form X (10 recommendations pushed). Request A errors before line 575. Request B processes Form Y — starts with Form X's 10 recommendations still in the array, producing corrupted `FormResult` and `Interim_Recommendation` data.

**Fix:** Move initialization to the start of each `calculateScore()` invocation or make it a local variable:
```typescript
const calculateScore = async (...) => {
  let recommendationWithFormfieldData: any[] = [];  // local, not module-level
  // ...
};
```

---

### [CRITICAL-2] JWT decoded without verification — auth completely bypassable

**Lines 706–709**

```typescript
const accessToken = String(req.headers.authorization);
const decodedToken: any = jwt.decode(accessToken);
let session = parseHasuraClaims(decodedToken, accessToken);
```

Same pattern as `submit-form.ts` (CRITICAL): `jwt.decode()` does not verify the signature. Any attacker can craft a JWT with arbitrary claims and trigger score calculation for any submission. The session is parsed but then discarded — the only code using it is commented out (line 711-712). Effectively zero authentication.

---

### [CRITICAL-3] SSRF via GlobalMaster `api.url` field

**Lines 661–668**

```typescript
const { url, method, headers } = job?.api;
await fetch(url, { method, body, headers });
```

`url`, `method`, and `headers` come directly from a `GlobalMaster` database record. If an attacker can insert or modify a `GlobalMaster` row with a malicious `api.url`, this endpoint will make arbitrary HTTP requests to any host (internal or external) — a Server-Side Request Forgery vector. There is no URL allowlist, no scheme restriction, and no header sanitization.

**Fix:** Validate `url` against a strict allowlist of known external endpoints before fetching.

---

### [HIGH-1] `forEach` used with async `calculateChildrenScore` — race condition in tree traversal

**Line 445**

```typescript
currentSection.children.forEach((m) => calculateChildrenScore(m));
```

`Array.forEach` does not await Promises. All child sections are dispatched concurrently but the parent section's score calculation (lines 447–473) runs immediately after, without waiting for children to complete. `sectionScoreInput` mutations from children may not be visible when the parent score is calculated.

**Fix:** Replace with `for...of` + `await`:
```typescript
for (const child of currentSection.children) {
  await calculateChildrenScore(child);
}
```

---

### [HIGH-2] `updateInterimAnswerResult` declared but never used

**Line 512**

```typescript
const updateInterimAnswerResult =
  await sdk.updateInterimAnswerByQuestionIdAndSubmissionId({ ... });
```

The result is assigned but never read. If the mutation fails silently (returns without error but with 0 affected rows), there is no detection.

---

### [HIGH-3] `calculateScore` catch block continues with partial state on error

**Lines 588–596**

The inner `calculateScore` function catches errors, logs to S3, and returns whatever partial `finalResult` was built before the error. Partial score arrays can then be upserted into `FormResult`, corrupting score data. On error, the function should throw rather than return partial results.

---

### [MEDIUM-1] `processScoreCalculation` mixes error-as-return-value with exceptions

**Lines 620–698**

The function returns `{ status: 500, result: { error: ... } }` in some paths and throws in others. Callers must handle both styles. Should consistently throw on errors and let `ApiErrorGuard` catch them.

---

### [MEDIUM-2] Pervasive `any` types, `let` everywhere, deeply nested conditionals

The entire file (700+ lines) uses `any` for all data structures. Complex business logic (recommendation deduplication, interim answer management) is implemented as deeply nested `for` loops with mutable `let` state. Extremely difficult to test, debug, or extend.

---

### [MEDIUM-3] Magic string interface names not from constants

**Lines 291–294**

```typescript
x?.interface == "select-multiple-checkbox" ||
x?.interface == "file"
```

These interface names should come from a shared constant (like `inputFieldsinFormFields` already defined in `@warp/shared/constants`).

---

### [LOW-1] Significant commented-out code throughout

Lines 606–618, 711–713, 670, 677, 679, 452, 455, 675 — should be deleted.

---

### [LOW-2] `==` used for comparisons throughout instead of `===`

Lines 46, 47, 98, 151, 152, 282, 336, 337, etc. — loose equality (`==`) is used pervasively. This can produce unexpected results when comparing values of different types. Should be `===` throughout.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | 21 | Module-level mutable state shared across requests |
| CRITICAL-2 | Critical | 706–709 | `jwt.decode` not `jwt.verify` — auth bypassable |
| CRITICAL-3 | Critical | 661–668 | SSRF via unvalidated `GlobalMaster.api.url` field |
| HIGH-1 | High | 445 | `forEach` + async — race condition in tree traversal |
| HIGH-2 | High | 512 | `updateInterimAnswerResult` declared but never used |
| HIGH-3 | High | 588–596 | Error caught silently — partial state returned as success |
| MEDIUM-1 | Medium | 620–698 | Mixed error-as-return-value and exceptions |
| MEDIUM-2 | Medium | whole file | Pervasive `any`, `let`, nested conditionals |
| MEDIUM-3 | Medium | 291–294 | Magic string interface names |
| LOW-1 | Low | multiple | Commented-out dead code |
| LOW-2 | Low | multiple | `==` instead of `===` throughout |
