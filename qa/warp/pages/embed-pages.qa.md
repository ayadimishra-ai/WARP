# QA: Embed Pages

**Files covered:**
- `pages/embed/AIBasedSections/ChatWithSnowkapAI.tsx`
- `pages/embed/form/invitation/[invitationId]/AIBasedSections/AIStatistics.tsx`
- `pages/embed/form/invitation/[invitationId]/[mode].tsx`
- `pages/embed/form/invitation/[invitationId]/intro.tsx`
- `pages/embed/form/[formId].tsx`
- `pages/embed/invitation/list.tsx`
- `pages/embed/invitation/send-invitation.tsx`
- `pages/embed/invitation/send-invitation-assessment-and-reports.tsx`
- `pages/embed/invitation/RecommendationList.tsx`

**Status:** HIGH issues found  
**Reviewer:** Claude Code  
**Date:** 2026-06-18

---

## Shared Auth Note

All embed pages use `embeddedAuthGuard` via `getServerSideProps` and set `.auth = true`. Server-side auth is consistently applied across the embed surface. The issues below are within individual pages.

---

## `pages/embed/AIBasedSections/ChatWithSnowkapAI.tsx`

### [HIGH-1] Access token taken from URL query parameter

**Lines 30–33:**
```typescript
const { accessToken } = query;
const userContext = getUserContext(accessToken as string);
```

The access token is extracted from `?accessToken=` in the URL. Tokens in URLs appear in browser history, server access logs, and Referer headers. This is the same pattern identified in `invitationQuery.tsx` (CRITICAL-2 in the invitation-query-pages report). Even if `embeddedAuthGuard` has already validated the session server-side, reading the raw token from `query` client-side and passing it to `getUserContext` without verification makes the client-side token handling weaker than the server-side guard.

---

### [MEDIUM-1] Extensive `console.log` in resize handler

**Lines 59:**
```typescript
const handleResize = () => console.log(window.innerWidth);
```

A `window.resize` listener fires continuously as the user resizes the window. Each event logs to the console — which is both noisy and a performance concern. This looks like debugging code left behind.

---

## `pages/embed/form/invitation/[invitationId]/AIStatistics.tsx`

### [MEDIUM-2] Component body almost entirely commented out — dead code

The entire AI statistics logic (100+ lines) is commented out. The rendered component consists only of:
```tsx
return <Box><FileProcessing /></Box>;
```

This page no longer serves its intended purpose. The dead commented code includes data fetching, AI card data setup, and action handling. Either the page should be restored to working state or removed.

---

## `pages/embed/invitation/RecommendationList.tsx`

### [LOW-1] Prop `invitationId` declared but never passed to child

```typescript
const EmbedRecommendationList: NextPageType = (invitationId) => {
  return <RecommendationList />;
};
```

The component accepts `invitationId` as a prop (from the function parameter), but `RecommendationList` is rendered with no props. The `invitationId` prop is silently ignored. This may be intentional if `RecommendationList` reads from context or the router, but the prop name in the parameter declaration is misleading — it should match `PageProps` if the intent is to use Next.js page props.

---

## `pages/embed/invitation/send-invitation-assessment-and-reports.tsx`

### [LOW-2] `formtype` query parameter accepts any value; silently defaults to `SendInvitationAssessment`

```typescript
switch (formtype) {
  case FormTypesPage.Assessment:
    return SendInvitationAssessment;
  case FormTypesPage.Report:
    return SendInvitationReports;
  default:
    return SendInvitationAssessment; // silent fallback for unknown formtype
}
```

An unknown or missing `formtype` silently renders `SendInvitationAssessment`. This is safe but could mask misconfiguration — consider logging an unexpected `formtype` value.

---

## Well-Structured Pages (No Issues)

The following embed pages are thin, clean wrappers that correctly use `embeddedAuthGuard`:
- `embed/form/invitation/[invitationId]/[mode].tsx`
- `embed/form/invitation/[invitationId]/intro.tsx`
- `embed/form/[formId].tsx`
- `embed/invitation/list.tsx`
- `embed/invitation/send-invitation.tsx`

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| HIGH-1 | High | ChatWithSnowkapAI.tsx | Access token from URL query parameter |
| MEDIUM-1 | Medium | ChatWithSnowkapAI.tsx | `console.log` in window resize listener |
| MEDIUM-2 | Medium | AIStatistics.tsx | Component body almost entirely commented out — dead code |
| LOW-1 | Low | RecommendationList.tsx | `invitationId` prop declared but never used |
| LOW-2 | Low | send-invitation-assessment-and-reports.tsx | Silent default for unknown `formtype` |
