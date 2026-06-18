# QA: Embed NewPopUp Pages & AIBasedSections/Common Components

**Files covered:**
- `pages/embed/NewPopUp/AISuggestionTablePopup.tsx`
- `pages/embed/NewPopUp/AddRecommendationPopup.tsx`
- `pages/embed/NewPopUp/AssignQuestionPopup.tsx`
- `pages/embed/NewPopUp/AssignReviewerPopup.tsx`
- `pages/embed/NewPopUp/AssignReviewerPopupFromSubmit.tsx`
- `pages/embed/NewPopUp/CommentWithQuestionPopup.tsx`
- `pages/embed/NewPopUp/DeclinePopup.tsx`
- `pages/embed/NewPopUp/DeviationReportPopup.tsx`
- `pages/embed/NewPopUp/FormFieldCommentNew.tsx`
- `pages/embed/NewPopUp/JustifyPopup.tsx`
- `pages/embed/NewPopUp/ProgressReport.tsx`
- `pages/embed/NewPopUp/QuestionnaireReportPopup.tsx`
- `pages/embed/NewPopUp/UploadFilesPopup.tsx`
- `pages/embed/AIBasedSections/Common/AIResponse.tsx`
- `pages/embed/AIBasedSections/Common/AISuggestionCarousel.tsx`
- `pages/embed/AIBasedSections/Common/CustomDropzoneV2.tsx`
- `pages/embed/AIBasedSections/Common/PageInfoTooltip.tsx`
- `pages/embed/AIBasedSections/Common/UserMessage.tsx`
- (other Common/* components)

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issue: Components Placed in `pages/` Directory

### [HIGH-1] React components in `pages/` are routable — accessed without authentication

None of the NewPopUp or Common files have `getServerSideProps`, `embeddedAuthGuard`, or `.auth = true`. In Next.js, every file in `pages/` that exports a default component is automatically served as a route. All 13 popup files and all Common component files are therefore accessible as unauthenticated pages:
- `/embed/NewPopUp/AISuggestionTablePopup`
- `/embed/NewPopUp/AssignReviewerPopupFromSubmit`
- `/embed/AIBasedSections/Common/AIResponse`
- etc.

These files should be moved to `components/` or `features/` directories, not placed inside `pages/`.

---

## `pages/embed/NewPopUp/CommentWithQuestionPopup.tsx`

### [CRITICAL-1] `jwt.decode()` not `jwt.verify()` — token signature never verified

**Lines 34–37:**
```typescript
const { accessToken } = query;
const decodedToken: any = jwt.decode(String(accessToken));
session = parseHasuraClaims(decodedToken, String(accessToken));
```

Token signature is never verified. Same pattern as `invitationQuery.tsx`, `calculate-score/index.ts`, submit-form.ts, and five RARA routes. An attacker can craft arbitrary Hasura claims.

---

## `pages/embed/NewPopUp/FormFieldCommentNew.tsx`

### [CRITICAL-2] `jwt.decode()` not `jwt.verify()` — token signature never verified

**Lines 13–16:**
```typescript
const { accessToken } = query;
const decodedToken: any = jwt.decode(String(accessToken));
session = parseHasuraClaims(decodedToken, String(accessToken));
```

Same critical pattern as CRITICAL-1 above.

---

## Shared Issue (all NewPopUp files): Wildcard `postMessage` target

### [HIGH-2] `postMessage(message, "*")` — wildcard target origin (7 files)

The following files use `window.parent?.postMessage(message, "*")` or `window.parent.postMessage(data, "*")`:
- `AddRecommendationPopup.tsx` — line 44
- `AssignQuestionPopup.tsx` — line 52
- `AssignReviewerPopup.tsx` — line 31
- `AssignReviewerPopupFromSubmit.tsx` — line 55
- `CommentWithQuestionPopup.tsx` — line 21
- `DeclinePopup.tsx` — line 15
- `JustifyPopup.tsx` — line 15
- `ProgressReport.tsx` — line 46
- `AISuggestionTablePopup.tsx` — lines 194, 248
- `UploadFilesPopup.tsx` — lines 174, 193

All 10 files send messages with `"*"` as the `targetOrigin`. Any page that embeds these popups in an iframe (regardless of domain) receives the messages. Messages carry user-action signals including recommendation updates, file upload status, and form field data.

**Fix for all files:** Replace `"*"` with `process.env.NEXT_PUBLIC_PARENT_ORIGIN`.

---

## `pages/embed/AIBasedSections/Common/AIResponse.tsx`

### [HIGH-3] `dangerouslySetInnerHTML` with AI-generated content — no sanitization

**Line 265:**
```tsx
<div dangerouslySetInnerHTML={{ __html: content }} />
```

`content` is AI-generated response text rendered as raw HTML. Depending on the AI model's output format (Markdown → HTML conversion), this could contain injected HTML if the AI produces unexpected markup. Sanitize with DOMPurify before rendering.

---

## `pages/embed/AIBasedSections/Common/PageInfoTooltip.tsx`

### [HIGH-4] `dangerouslySetInnerHTML` with DB-sourced content — no sanitization

**Lines 83–88:**
```tsx
<Box
  dangerouslySetInnerHTML={{
    __html: (!!isReplaceInfoContent && isReplaceInfoContent ? result : pageContent) || "Default popover content",
  }}
/>
```

`pageContent` and `result` come from database-backed configuration. If an admin or attacker modifies these records, arbitrary HTML/JavaScript can be injected into the tooltip.

---

## `pages/embed/AIBasedSections/Common/UserMessage.tsx`

### [HIGH-5] `dangerouslySetInnerHTML` on user-submitted content

**Line 65:**
```tsx
dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
```

`displayContent` contains user-entered chat messages. Even after `formatContent()` (a Markdown formatter), the HTML output is inserted without DOMPurify sanitization. A user could inject `<script>` or `<img onerror="...">` tags through chat input.

---

## `pages/embed/AIBasedSections/Common/CustomDropzoneV2.tsx`

### [MEDIUM-1] `localStorage` used for upload progress persistence

**Lines 381, 398:**
```typescript
const storedProgress = localStorage.getItem(`uploadProgress_${id}`);
const storedProgress = localStorage.getItem(progressKey);
```

Upload progress is stored in `localStorage` keyed by document ID. This is accessible to any XSS attack on the origin and leaks which documents are being uploaded.

---

## `pages/embed/AIBasedSections/Common/AISuggestionCarousel.tsx`

### [MEDIUM-2] Wildcard `postMessage` in suggestion carousel (no explicit `"*"` — implicit)

**Lines 59, 477:**
```typescript
window.parent.postMessage(data, ...)
```

Check the exact target origin passed — if `"*"` is used here as well, this is the same HIGH-2 issue.

---

## Summary Table

| ID | Severity | Files Affected | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | CommentWithQuestionPopup.tsx | `jwt.decode()` not `jwt.verify()` |
| CRITICAL-2 | Critical | FormFieldCommentNew.tsx | `jwt.decode()` not `jwt.verify()` |
| HIGH-1 | High | All 13 NewPopUp + Common files | Components in `pages/` — routable without auth |
| HIGH-2 | High | 10 NewPopUp files | `postMessage("*")` wildcard target origin |
| HIGH-3 | High | AIResponse.tsx | `dangerouslySetInnerHTML` on AI-generated content |
| HIGH-4 | High | PageInfoTooltip.tsx | `dangerouslySetInnerHTML` on DB-sourced content |
| HIGH-5 | High | UserMessage.tsx | `dangerouslySetInnerHTML` on user chat input |
| MEDIUM-1 | Medium | CustomDropzoneV2.tsx | Upload progress stored in localStorage |
| MEDIUM-2 | Medium | AISuggestionCarousel.tsx | Verify postMessage target origin |
