# QA: `apps/web/pages/api/v1/internal/post-form-submission.ts`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Issues Found

### [CRITICAL-1] No authentication — publicly accessible internal endpoint

This handler runs score calculation, writes `FormResult` rows, updates `FormSubmission.status`, and transitions `FormInvitation.status`. It has **zero authentication**. No `Authorization` header check, no JWT verification, no guard beyond `ApiMethodGuard(POST)`.

Despite being named "internal", it is a standard Next.js API route reachable by any HTTP client at `/api/v1/internal/post-form-submission`. Any unauthenticated request with a valid `submissionId` and `invitationId` (guessable UUIDs) can trigger a full submission processing cycle.

**Fix:** Add JWT verification before processing:

```typescript
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";

const accessToken = String(req.headers.authorization ?? "");
if (!accessToken) return res.status(401).json({ error: { message: "Unauthorized" } });
const decoded = jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET, { algorithms: ["HS256"] });
const session = parseHasuraClaims(decoded as any, accessToken);
```

---

### [HIGH-1] Validation errors echo full request body

**Lines 93, 108–112**

```typescript
return res.status(400).json({
  error: { message: "Required details are missing", data: req.body },
});
```

`req.body` is returned verbatim in error responses. This exposes submission IDs, invitation IDs, and processing parameters to any caller who receives a 400. Remove `data: req.body` from all error responses.

---

### [HIGH-2] `Answer` array cast directly to `Interim_Answer_Insert_Input[]` without mapping

**Lines 165–167**

```typescript
const interimAnswers: Interim_Answer_Insert_Input[] = interimAnswer_Answer.Answer;
await sdk.bulkInsertInterimAnswer({ interinm_input: interimAnswers });
```

`Answer` and `Interim_Answer_Insert_Input` are different GraphQL types with different field sets. The TypeScript annotation is a lie — there is no actual transformation. At runtime, the `Answer` objects will be passed as-is to the `Interim_Answer` insert, likely including foreign-key fields that don't exist in the target table and missing fields that are required. This is a silent data corruption risk.

**Fix:** Write an explicit mapping function that transforms `Answer` fields to `Interim_Answer_Insert_Input` fields.

---

### [HIGH-3] `carryForWardData` property will always be undefined

**Lines 170–196**

```typescript
if (!shouldSkipInterim && interimAnswer_Answer?.carryForWardData?.length) {
  // update carry-forward interim answers
}
```

`interimAnswer_Answer` is the result of `sdk.getAnswersByFormSubmissionId()`, which returns an `{ Answer: Answer[] }` shape. There is no `carryForWardData` field in the GraphQL response. This block of code is dead — it never executes. If carry-forward interim answer updates are required, the query needs to be updated to return this data, or it should be fetched with a separate query.

---

### [MEDIUM-1] Typo in handler function name

**Line 81**

```typescript
const postFormSubmissionHander: NextApiHandler = ...
//                          ↑ missing 'l' — "Hander" not "Handler"
```

---

### [MEDIUM-2] Typo in GraphQL mutation parameter

**Line 167**

```typescript
await sdk.bulkInsertInterimAnswer({ interinm_input: interimAnswers });
//                                   ↑ "interinm" not "interim"
```

This typo is in the generated SDK, meaning it originated in a `.gql` mutation definition. The source `.gql` file for `bulkInsertInterimAnswer` needs to be fixed and codegen re-run.

---

### [MEDIUM-3] `processProgressReportScore` called with string `"true"` instead of boolean

**Line 67**

```typescript
const result = await processProgressReportScore(
  formId, submissionId, invitationId,
  "true",   // ← string boolean
  ...
);
```

Passing `"true"` (string) for what is conceptually a boolean parameter is a code smell indicating the function has an untyped or poorly-typed signature. Should be `true` (boolean) or the function signature should be fixed.

---

### [MEDIUM-4] Success response echoes request body

**Line 241**

```typescript
return res.status(200).send({ data: req.body, error: null });
```

The full request body is returned on success. Should return a meaningful result (e.g., `{ submissionId, status: "Successful" }`).

---

### [LOW-1] `targetInvitationStatus` logic may be incorrect

**Lines 134–136**

```typescript
const targetInvitationStatus = reviewerParentCompanyId
  ? FormInvitationStatus.Approved
  : FormInvitationStatus.Submitted;
```

When `reviewerParentCompanyId` is set (reviewer workflow), the invitation jumps directly to `Approved`. Based on the documented workflow, a reviewer-assigned form should first go to `UnderReview` or `PendingReview`, not directly to `Approved`. Verify this logic with the product workflow spec.

---

### [LOW-2] `"Recommendation_new"` GlobalMaster key hardcoded as magic string

**Line 140**

```typescript
const isRecommendation = await sdk.getGlobalMasterByType({ type: "Recommendation_new" });
```

Magic string — not a named constant. If the GlobalMaster key changes this silently breaks. Should be a constant in `@warp/shared/constants`.

---

## Summary Table

| ID | Severity | Line(s) | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | whole file | No authentication on publicly accessible internal endpoint |
| HIGH-1 | High | 93, 108 | Validation errors echo full `req.body` |
| HIGH-2 | High | 165–167 | `Answer[]` cast to `Interim_Answer_Insert_Input[]` without mapping |
| HIGH-3 | High | 170–196 | `carryForWardData` always undefined — block is dead code |
| MEDIUM-1 | Medium | 81 | Typo in handler name (`Hander` → `Handler`) |
| MEDIUM-2 | Medium | 167 | Typo in GQL param (`interinm_input` → `interim_input`) |
| MEDIUM-3 | Medium | 67 | String `"true"` passed for boolean param |
| MEDIUM-4 | Medium | 241 | Success response echoes request body |
| LOW-1 | Low | 134–136 | `targetInvitationStatus` may skip reviewer workflow states |
| LOW-2 | Low | 140 | `"Recommendation_new"` is a magic string, not a constant |

---

## Fixed File

See `post-form-submission.fixed.ts` in this directory.
