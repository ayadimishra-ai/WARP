# QA: Core / Root Pages

**Files covered:**
- `pages/_app.tsx`
- `pages/assesment.tsx`
- `pages/pdf.tsx`
- `pages/test.tsx`
- `pages/globalDataStorage/index.tsx`
- `pages/index.tsx`
- `pages/assessment/listing.tsx`
- `pages/questionnaires.tsx`
- `pages/invitation/list.tsx`

**Status:** HIGH issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `pages/_app.tsx`

### [HIGH-1] `postParentMessage(message, "*")` — wildcard postMessage target origin

**Lines 1010–1011:**
```typescript
const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");
```

`"*"` as the `targetOrigin` means the message is sent to any parent frame regardless of its origin. An attacker who embeds this application inside a malicious iframe on any domain will receive all `postParentMessage` calls, which carry layout/height information and potentially user context.

**Fix:** Replace `"*"` with the known parent origin (e.g., `process.env.NEXT_PUBLIC_PARENT_ORIGIN`):
```typescript
window.parent?.postMessage(message, process.env.NEXT_PUBLIC_PARENT_ORIGIN!);
```

---

## `pages/assesment.tsx`

### [HIGH-2] JWT stored in localStorage — XSS risk

**Lines 14–17:**
```typescript
localStorage.setItem(
  "warp_user_access_token",
  isPlatformAndTokenAvailable.userAccessDetails[0].warpUserAccessToken
);
```

Access tokens stored in `localStorage` are readable by any JavaScript running on the same origin. Any XSS vulnerability in the application grants full token theft. Prefer `HttpOnly` cookies, which are inaccessible to JavaScript.

---

### [MEDIUM-1] `useEffect` without dependency array — runs on every render

**Lines 11–24:**
```typescript
useEffect(() => {
  try {
    if (isPlatformAndTokenAvailable.userAccessDetails.length > 0) {
      localStorage.setItem("warp_user_access_token", ...);
    } else {
      localStorage.setItem("warp_user_access_token", "");
    }
  } catch (error) { ... }
}); // ← no dependency array
```

Omitting the dependency array makes `useEffect` run after every render. `localStorage.setItem` is called on every re-render, which is wasteful and could cause unexpected side effects.

**Fix:** Add `[]` dependency array (run once on mount) or `[isPlatformAndTokenAvailable.userAccessDetails]`.

---

### [LOW-1] Filename typo: `assesment.tsx` (missing 's')

The filename should be `assessment.tsx`. This also affects the URL — `/assesment` — which is user-visible.

---

### [LOW-2] Typo in UI text: "Singed in"

**Line 27:** `<div>Singed in</div>` — should be "Signed in".

---

## `pages/pdf.tsx`

### [CRITICAL-1] Hardcoded `http://localhost:3000` URL in production code

**Line 232:**
```typescript
src={"http://localhost:3000/images/CompanyLogo.png"}
```

This URL will always fail in any non-development environment. The PDF will render with a broken company logo image in production.

---

### [HIGH-3] Development/prototype artifact in production — hardcoded data

The entire file is a prototype PDF report with hardcoded content that should never reach production:
- Hardcoded date: `"ESG Diagnostic Report - 12th October 2022"`
- Hardcoded company: `"ThinkBoxs"` (also a typo — should be "ThinkBox's" or "ThinkBox")
- Hardcoded scores: `"140 / 195"`, `"122 / 150"` etc.
- No auth guard — anyone can access `/pdf`

This page should be removed from production or completely rewritten to accept dynamic data.

---

### [LOW-3] Style property typo: `coloumn` (should be `column`)

**Line 25:** `coloumn: { display: "flex", flexDirection: "column" }` — misspelled CSS property name.

---

## `pages/test.tsx`

### [HIGH-4] Test page accessible in production at `/test`

`TestPage` renders `<Box>Test Page</Box>` and checks `localStorage` access. This is a debugging/integration test page that should not be accessible in production.

---

### [HIGH-5] Wildcard `postMessage` in test page

**Line 14:**
```typescript
window.parent?.postMessage(message, "*");
```

Same wildcard postMessage issue as `_app.tsx`. Even if this page is removed, both branches of the try/catch send to `"*"`.

---

## `pages/globalDataStorage/index.tsx`

### [HIGH-6] `typeof globalMasterData !== undefined` — condition is always true

**Line 36:**
```typescript
if (typeof globalMasterData !== undefined) {
```

`typeof` always returns a string (e.g. `"object"`, `"undefined"`). Comparing a string to the value `undefined` with `!==` is always `true`. This should be:
```typescript
if (typeof globalMasterData !== "undefined") {
```

---

### [HIGH-7] Session data written to localStorage on every render

**Lines 46–58:**
```typescript
localStorage.setItem("warp_GlobalMasterData", JSON.stringify(globalMasterData1));
setLocalStorageSession(window.localStorage, session);
setLocalStorageGlobalMasterSession(window.localStorage, session, globalMasterData1.GlobalMaster);
```

This runs synchronously in the component render function (not inside `useEffect`), so it executes on every render. Also, `globalMasterData1.GlobalMaster` — `globalMasterData1` is already the filtered array result, not an object with a `.GlobalMaster` property, so this is always `undefined`.

---

### [MEDIUM-2] Session/auth data in localStorage — XSS risk

`setLocalStorageSession` and `setLocalStorageGlobalMasterSession` store session data in `localStorage`, which is readable by any JavaScript on the origin. This should use server-side session management or `HttpOnly` cookies.

---

## `pages/index.tsx`

### [LOW-4] Placeholder home page — no content

`HomePage` returns `<Box>Home Page</Box>` — this appears to be a placeholder that never received real implementation. The home page is user-visible.

---

## `pages/assessment/listing.tsx`, `questionnaires.tsx`, `pages/invitation/list.tsx`

### [MEDIUM-3] No explicit auth guard on thin-wrapper pages

All three pages are thin wrappers that delegate to feature components but do not set `.auth = true` or `getServerSideProps`. Auth is only enforced if the layout or feature component internally handles it. If the route is accessed directly (e.g., SSR or middleware bypass), the auth check may not fire.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | pdf.tsx | Hardcoded `http://localhost:3000` URL in production |
| HIGH-1 | High | _app.tsx | `postMessage("*")` — wildcard target origin |
| HIGH-2 | High | assesment.tsx | JWT stored in localStorage |
| HIGH-3 | High | pdf.tsx | Development prototype with hardcoded data in production |
| HIGH-4 | High | test.tsx | Test page accessible in production |
| HIGH-5 | High | test.tsx | Wildcard `postMessage("*")` |
| HIGH-6 | High | globalDataStorage/index.tsx | `typeof x !== undefined` always true |
| HIGH-7 | High | globalDataStorage/index.tsx | Session write on every render; `.GlobalMaster` always undefined |
| MEDIUM-1 | Medium | assesment.tsx | `useEffect` without dependency array |
| MEDIUM-2 | Medium | globalDataStorage/index.tsx | Session data in localStorage |
| MEDIUM-3 | Medium | listing/questionnaires/list | No explicit auth guard |
| LOW-1 | Low | assesment.tsx | Filename typo |
| LOW-2 | Low | assesment.tsx | "Singed in" text typo |
| LOW-3 | Low | pdf.tsx | `coloumn` CSS property typo |
| LOW-4 | Low | index.tsx | Placeholder home page |
