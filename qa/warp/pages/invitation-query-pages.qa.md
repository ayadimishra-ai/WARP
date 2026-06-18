# QA: Invitation Query & Log Pages

**Files covered:**
- `pages/embed/form/invitation/[invitationId]/Query/invitationQuery.tsx` (1019 lines)
- `pages/embed/form/invitation/[invitationId]/Query/invitationlog.tsx`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `invitationQuery.tsx`

### [CRITICAL-1] `jwt.decode()` not `jwt.verify()` — token signature never verified

**Lines 112–113:**
```typescript
const decodedToken: any = jwt.decode(String(accessToken));
session = parseHasuraClaims(decodedToken, String(accessToken));
```

`jwt.decode()` decodes the payload without verifying the signature. An attacker can craft a JWT with arbitrary Hasura claims (`x-hasura-user-id`, `x-hasura-company-id`, `x-hasura-allowed-roles`) and gain full access to any invitation's comments, form fields, and mutation operations.

Same critical pattern found in submit-form.ts, calculate-score/index.ts, carry-forward-suggestions.ts, and all five RARA routes.

**Fix:**
```typescript
const decodedToken = jwt.verify(
  String(accessToken),
  process.env.HASURA_GRAPHQL_JWT_SECRET!,
  { algorithms: ["HS256"] }
);
session = parseHasuraClaims(decodedToken as any, String(accessToken));
```

---

### [CRITICAL-2] `accessToken` taken from URL query parameter

**Line 108:**
```typescript
const { accessToken } = query;
```

The JWT is read from `?accessToken=` in the URL. Access tokens in URLs appear in:
- Browser history
- Server access logs
- Referrer headers sent to third-party resources
- Proxy logs

This is a well-known vulnerability class (CWE-598). Tokens should be passed via `Authorization` headers or `HttpOnly` cookies, not URL query parameters.

---

### [HIGH-1] `postParentMessage(message, "*")` — wildcard postMessage target

**Line 494–495:**
```typescript
const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");
```

Same wildcard `postMessage` pattern as `_app.tsx` and `test.tsx`. Any page embedding this iframe (on any domain) receives the messages. Messages include navigation events (`invitationFormquestionredirect`), comment counts (`sendCommentsButtonCount`), and close/reopen signals (`warpClosePopup`, `warpReopenAssessmentSubmit`).

**Fix:** Restrict to the known parent origin:
```typescript
window.parent?.postMessage(message, process.env.NEXT_PUBLIC_PARENT_ORIGIN!);
```

---

### [HIGH-2] `localStorage` write for page refresh tracking

**Line 388:**
```typescript
setLocalStorageData(window.localStorage, "IsPageRefreshed", questionId);
```

`questionId` (from URL query) is written directly to `localStorage`. This could be used to persist state across page loads but also exposes the active question ID to any XSS attack on the origin.

---

### [MEDIUM-1] `let session: any = ""` — mutable module-level-adjacent variable

**Lines 105–113:**
```typescript
let session: any = "";
// ...
const decodedToken: any = jwt.decode(String(accessToken));
session = parseHasuraClaims(decodedToken, String(accessToken));
```

`session` is declared as a `let` at the component function scope and reassigned after `jwt.decode`. In React's concurrent rendering, multiple renders of this component could overwrite each other's `session` value before it's used. Refactor to `const` with proper initialization.

---

### [MEDIUM-2] `String(accessToken)` when `accessToken` can be `string[]`

**Lines 112–113:**
```typescript
jwt.decode(String(accessToken))
parseHasuraClaims(decodedToken, String(accessToken))
```

Next.js query parameters can be `string | string[]`. If `?accessToken=a&accessToken=b` is supplied, `String(["a", "b"])` = `"a,b"` — a malformed JWT that `jwt.decode` returns `null` for. This should guard: `Array.isArray(accessToken) ? accessToken[0] : accessToken`.

---

## `invitationlog.tsx`

### [LOW-1] `setTimeout` used to scroll log — fragile timing

**Lines 36–44:**
```typescript
useEffect(() => {
  setAllInvitationComment(allComments);
  setTimeout(() => {
    const chatBox = document.getElementById("log");
    if (chatBox) {
      chatBox.scrollTo({ top: chatBox.scrollHeight });
    }
  }, 100);
}, [allComments?.InvitationComment, allComments]);
```

`setTimeout(..., 100)` is a magic delay to wait for the DOM to update. If the DOM update takes longer than 100ms (e.g., large comment list, slow device), the scroll will fire before the new items are painted. Prefer `useLayoutEffect` + `requestAnimationFrame` or a `MutationObserver`.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | invitationQuery.tsx | `jwt.decode()` — token signature not verified |
| CRITICAL-2 | Critical | invitationQuery.tsx | Access token in URL query parameter |
| HIGH-1 | High | invitationQuery.tsx | `postMessage("*")` wildcard target |
| HIGH-2 | High | invitationQuery.tsx | `questionId` from URL written to localStorage |
| MEDIUM-1 | Medium | invitationQuery.tsx | `let session` mutable re-assignment pattern |
| MEDIUM-2 | Medium | invitationQuery.tsx | `String(accessToken)` ignores array case |
| LOW-1 | Low | invitationlog.tsx | `setTimeout` for DOM scroll — fragile timing |
