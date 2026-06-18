# QA: Form Pages

**Files covered:**
- `pages/form/[formId]/_index.tsx`
- `pages/form/[formId]/intro.tsx`
- `pages/form/[formId]/start.tsx`
- `pages/form/invitation/[invitationId]/intro.tsx`
- `pages/form/invitation/[invitationId]/start.tsx`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `pages/form/[formId]/_index.tsx`

### [CRITICAL-1] Development prototype with hardcoded company data in production

The entire file is a static prototype UI for "ESG Diligence Questionnair - Company 7" with:
- Hardcoded company name: `"ESG Diligence Questionnair - Company 7"`
- Hardcoded tab structure: Q1 through Q18 tabs with no dynamic data
- Hardcoded field labels: `"Name and designation of the correspondant"`
- No auth guard — accessible at `/form/<any-uuid>`
- No data fetching — nothing from the database

This is a development mockup that should not exist in the production codebase.

---

### [MEDIUM-1] `_index.tsx` naming — unreachable Next.js route

In Next.js, files beginning with `_` in the `pages/` directory are ignored by the router. `_index.tsx` inside `pages/form/[formId]/` is therefore never served as a route. The file is dead code that should be deleted or renamed.

---

### [LOW-1] Typos in hardcoded content

- `"Questionnair"` → `"Questionnaire"`
- `"correspondant"` → `"correspondent"`

---

## `pages/form/[formId]/intro.tsx`

### [CRITICAL-2] XSS via `dangerouslySetInnerHTML` with unsanitized DB content

**Lines 79–85:**
```tsx
{formDetails?.focusArea.map((focusOn: any) => (
  <span
    dangerouslySetInnerHTML={{
      __html: Object.values(focusOn)[0] as string,
    }}
  ></span>
))}
```

**Lines 95–97 (approx):**
```tsx
<span
  dangerouslySetInnerHTML={{
    __html: formDetails?.bodyTemplate ?? "",
  }}
></span>
```

Both `focusArea` values and `bodyTemplate` come from the `GlobalMaster`/`FormDetails` database tables and are rendered directly as raw HTML with no sanitization. If any DB record contains injected HTML or JavaScript (e.g., `<script>document.cookie</script>` or `<img onerror="...">`), it executes in the user's browser.

**Fix:** Sanitize with DOMPurify before rendering:
```typescript
import DOMPurify from "dompurify";
<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />
```

---

### [HIGH-1] No auth guard — form intro accessible without authentication

`FormIntroPage.auth` is not set to `true` and there is no `getServerSideProps` with an auth guard. The page queries `FormDetails` and `GlobalMaster` via GraphQL using the user's session; without server-side auth, a user without a valid session can still load this page.

---

### [MEDIUM-2] Missing `key` prop on mapped `List.Item` elements

**Lines in notes section:**
```tsx
{formDetails?.notes?.points?.map((point: String) => (
  <List.Item>{point}</List.Item>
))}
```

No `key` prop on the mapped `List.Item`. React will warn about this and diffing will be suboptimal. Add `key={index}` or a unique identifier.

---

## `pages/form/[formId]/start.tsx`

### [CRITICAL-3] Missing `return` keyword — questionnaire data never renders

**Line 22:**
```typescript
if (questionnaire) <Box>{JSON.stringify(questionnaire, null, 2)}</Box>;
```

The `return` keyword is missing. This statement evaluates the JSX expression but discards its value. The page always falls through to `return <Box></Box>` — an empty box. The questionnaire data is fetched successfully but never displayed.

**Fix:**
```typescript
if (questionnaire) return <Box>{JSON.stringify(questionnaire, null, 2)}</Box>;
```

---

### [HIGH-2] No auth guard — form start accessible without authentication

Same gap as `intro.tsx`: `StartFormPage.auth` is not set, no `getServerSideProps`.

---

### [LOW-2] Commented-out `LoadingOverlay` import — dead code

**Line 19:** `// if (loading) return <LoadingOverlay visible={true} />;` — the import that likely went with this is also unused. Dead code.

---

## `pages/form/invitation/[invitationId]/intro.tsx`

### [HIGH-3] No auth guard

`FormIntroPage.auth` is not set and there is no `getServerSideProps` with an auth guard. The embedded form intro page loads `FormIntroScreen` which fetches invitation data; without server-side auth enforcement, this page can be accessed by unauthenticated users.

---

### [MEDIUM-3] `invitationId` can be `string[]` — unguarded coercion

**Line 12:**
```typescript
return <FormIntroScreen invitationId={String(invitationId)} />;
```

`router.query.invitationId` can be `string | string[]`. If it's an array, `String(["abc", "def"])` = `"abc,def"` — an invalid UUID that will cause the DB query to fail. Guard with:
```typescript
const id = Array.isArray(invitationId) ? invitationId[0] : invitationId;
```

---

## `pages/form/invitation/[invitationId]/start.tsx`

### [HIGH-4] No auth guard

`FormPage` has no `getLayout`, no `.auth`, no `getServerSideProps`. It's a plain component with no authentication enforcement.

---

### [MEDIUM-4] `invitationId` can be `string[]` — unguarded coercion

**Line 9:** Same issue as `intro.tsx` — `String(invitationId)` when the value can be `string[]`.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | form/[formId]/_index.tsx | Development prototype with hardcoded data in production |
| CRITICAL-2 | Critical | form/[formId]/intro.tsx | XSS via `dangerouslySetInnerHTML` with unsanitized DB HTML |
| CRITICAL-3 | Critical | form/[formId]/start.tsx | Missing `return` — questionnaire data never renders |
| HIGH-1 | High | form/[formId]/intro.tsx | No auth guard |
| HIGH-2 | High | form/[formId]/start.tsx | No auth guard |
| HIGH-3 | High | form/invitation/[invitationId]/intro.tsx | No auth guard |
| HIGH-4 | High | form/invitation/[invitationId]/start.tsx | No auth guard |
| MEDIUM-1 | Medium | form/[formId]/_index.tsx | `_index.tsx` — unreachable Next.js route (dead file) |
| MEDIUM-2 | Medium | form/[formId]/intro.tsx | Missing `key` prop on mapped list items |
| MEDIUM-3 | Medium | form/invitation/[invitationId]/intro.tsx | `String(invitationId)` ignores array case |
| MEDIUM-4 | Medium | form/invitation/[invitationId]/start.tsx | `String(invitationId)` ignores array case |
| LOW-1 | Low | form/[formId]/_index.tsx | Typos: "Questionnair", "correspondant" |
| LOW-2 | Low | form/[formId]/start.tsx | Commented-out `LoadingOverlay` — dead code |
