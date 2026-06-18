# QA: Test, Temp, and Learn Pages

**Files covered:**
- `pages/temp/blank-assessment-lock-actions/assessments.tsx`
- `pages/temp/blank-assessment-lock-actions/reports.tsx`
- `pages/form/ajv-test.tsx`
- `pages/test/form-components.tsx`
- `pages/test/form.tsx`
- `pages/test/s3-fileupload-test.tsx`
- `pages/learn/index.tsx`
- `pages/learn/example.tsx`
- `pages/learn/[testId]/index.tsx`
- `pages/learn/[testId]/[slug].tsx`
- `pages/learn/[testId]/name.tsx`
- `pages/learn/test/[testId].tsx`

**Status:** CRITICAL issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Issue: Development/Test Pages Accessible in Production

### [CRITICAL-1] All 12 files are development/test artifacts deployed to production

None of these files should exist in a production Next.js deployment. They are all accessible via public routes:
- `/temp/blank-assessment-lock-actions/assessments`
- `/temp/blank-assessment-lock-actions/reports`
- `/form/ajv-test`
- `/test/form-components`
- `/test/form`
- `/test/s3-fileupload-test`
- `/learn`
- `/learn/example`
- `/learn/<testId>/`
- `/learn/<testId>/<slug>`
- `/learn/<testId>/name`
- `/learn/test/<testId>`

None of these pages set `.auth = true` or use `getServerSideProps` with an auth guard.

**Fix:** Delete all files under `pages/temp/`, `pages/test/`, `pages/learn/`, and `pages/form/ajv-test.tsx` from the production codebase. At minimum, block access via `middleware.ts` or Next.js rewrites if the files must be retained for local development.

---

## `pages/form/ajv-test.tsx`

### [HIGH-1] Unauthenticated GraphQL mutation — form calculation data writable by anyone

```typescript
const [updateCalc, result] = useUpdateFormCalcMutation();
const formResult = useGetFormCalcQuery();
// ...
<button onClick={() => updateCalc({ variables: { calc: { value } } })}>Save</button>
```

`useUpdateFormCalcMutation` writes to the `Form` table's `calc` field. This page is accessible at `/form/ajv-test` without authentication — any visitor can modify form calculation rules for any form.

---

### [MEDIUM-1] `useEffect(() => {}, [value])` — empty effect with dependency

```typescript
useEffect(() => {}, [value]);
```

This effect does nothing when `value` changes. It's leftover scaffolding code that should be removed.

---

## `pages/test/s3-fileupload-test.tsx`

### [HIGH-2] S3 upload test page accessible without authentication

This page triggers calls to `/api/awss3/get-upload-url` to obtain a pre-signed S3 upload URL. Even if the API itself enforces auth (which it does not — see `awss3/get-upload-url.qa.md`), having this UI in production invites unintentional use of the S3 upload pipeline.

---

### [LOW-1] Misleading comment vs. file type restriction

```typescript
<p>Upload a .png or .jpg image (max 10MB).</p>
<input onChange={uploadPhoto} type="file" accept="application/pdf" />
```

The descriptive text says "Upload a .png or .jpg image" but the `accept` attribute restricts to `application/pdf`. The comment and implementation are contradictory.

---

## `pages/temp/blank-assessment-lock-actions/assessments.tsx` and `reports.tsx`

### [HIGH-3] `temp/` directory pages in production with no auth

Both pages render `<BlankAssessmentLockActions />` without authentication. They are accessible at `/temp/blank-assessment-lock-actions/assessments` and `/temp/blank-assessment-lock-actions/reports`. The `temp/` naming makes clear these are temporary development pages that were never removed.

---

## `pages/learn/index.tsx` and `pages/learn/example.tsx`

### [MEDIUM-2] Hardcoded `localhost` URLs in source comments

```typescript
// url : http://localhost:3000/learn
// url : http://localhost:3000/learn/example
```

Development-time URL reminders committed to production source code. These comments indicate the files were written during local development and never cleaned up for production.

---

### [MEDIUM-3] Placeholder content — no real implementation

Both `LearnPage` and `ExamplePage` return hardcoded `<h1>This is index page of learn page dir</h1>`. These are placeholder pages with no content that have been shipped to production.

---

## `pages/test/form-components.tsx`

### [MEDIUM-4] Test scaffold with no content

```typescript
const FormComponents: NextPage = () => {
  return <div>FormComponents</div>;
};
```

Placeholder test page accessible in production at `/test/form-components`.

---

## `pages/test/form.tsx`

### [MEDIUM-5] Test form with empty schema in production

```typescript
const schema = { title: "" } as RJSFSchema;
// ...
<Form schema={{}} uiSchema={{}} onSubmit={() => {}} ... />
```

An empty JSON Schema form is rendered in production at `/test/form`. Calling this page serves an empty form that does nothing on submit — it is entirely non-functional test scaffolding.

---

## Summary Table

| ID | Severity | Files Affected | Issue |
|---|---|---|---|
| CRITICAL-1 | Critical | All 12 | Development/test pages publicly accessible in production without auth |
| HIGH-1 | High | form/ajv-test.tsx | Unauthenticated GraphQL mutation writes to Form table |
| HIGH-2 | High | test/s3-fileupload-test.tsx | S3 upload test accessible without auth |
| HIGH-3 | High | temp/assessments.tsx, temp/reports.tsx | Temp pages in production |
| MEDIUM-1 | Medium | form/ajv-test.tsx | Empty `useEffect` with dependency — dead code |
| MEDIUM-2 | Medium | learn/index.tsx, learn/example.tsx | Hardcoded `localhost` URL comments |
| MEDIUM-3 | Medium | learn/index.tsx, learn/example.tsx | Placeholder content in production |
| MEDIUM-4 | Medium | test/form-components.tsx | Test scaffold with no content |
| MEDIUM-5 | Medium | test/form.tsx | Empty schema form in production |
| LOW-1 | Low | test/s3-fileupload-test.tsx | Comment says "png/jpg" but `accept="application/pdf"` |
