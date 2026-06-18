# QA: Document Repository Page

**Files covered:**
- `pages/document-repository.tsx`
- `pages/_document.tsx`

**Status:** Minor issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## `pages/document-repository.tsx`

This is one of the best-structured pages in the WARP codebase. It correctly:
- Uses `embeddedAuthGuard` in `getServerSideProps` with redirect handling
- Sets `DocumentRepositoryPage.auth = true`
- Fetches all initial data server-side (SSR), avoiding client-side data exposure
- Uses `mergeWithLatestSystemGenerated` domain selector to apply business logic before serialization
- Handles errors gracefully — returns empty data rather than crashing

### [MEDIUM-1] Error in `getServerSideProps` swallowed — client receives no indication of failure

**Lines 233–250:**
```typescript
} catch (error) {
  console.error("Error fetching document repository data:", error);
  return {
    props: {
      session,
      initialDocuments: [],
      templates: [],
      subscription: { isChatSubscriptionActive: false },
      ...
    },
  };
}
```

If `fetchDocuments`, `fetchDocumentTemplates`, or the Apollo query fails (e.g., network error, DB unavailable), the page renders silently with empty data rather than showing an error to the user. The `console.error` goes to server logs only. The user sees a blank document repository with no explanation.

**Fix:** Return a 500 error page on critical data fetch failures, or pass an `error` prop to the component to display a user-facing error message.

---

### [LOW-1] Stray comment `///` at line 111

**Line 111:** `///` — a stray triple-slash comment with no content. This is a leftover artifact that should be removed.

---

### [LOW-2] Type assertion instead of proper typing

**Line 162:**
```typescript
const session = (sessionProps as { props: { session: AuthSessionType } }).props.session;
```

After narrowing out redirect/notFound cases, the type of `sessionProps.props` is still not known to TypeScript without this cast. This could be improved by defining a proper return type for `embeddedAuthGuard` rather than using a type assertion.

---

## `pages/_document.tsx`

Standard Next.js custom Document with Mantine's `createGetInitialProps`. Clean and correct — no issues.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| MEDIUM-1 | Medium | document-repository.tsx | SSR data fetch errors silently produce empty data |
| LOW-1 | Low | document-repository.tsx | Stray `///` comment at line 111 |
| LOW-2 | Low | document-repository.tsx | Type assertion instead of proper return type |
