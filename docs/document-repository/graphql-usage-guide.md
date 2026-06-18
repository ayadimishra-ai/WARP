# GraphQL Usage Guide - Document Repository V2

## Overview

This document explains how GraphQL is used across different layers of the Document Repository V2 clean architecture implementation.

---

## GraphQL in Clean Architecture

### Layer-Specific Usage

| Layer | GraphQL Method | Why |
|-------|---------------|-----|
| **Domain** | ❌ None | Pure business logic - no external dependencies |
| **Server** | ✅ SDK (server-side) | Runs in `getServerSideProps` - no browser context |
| **Application** | ✅ Apollo Client | Runs client-side in React hooks |
| **UI** | ❌ None | Presentational only - delegates to application layer |
| **Page** | ✅ Apollo Client (via hooks) | Composes application hooks |

---

## Two GraphQL Execution Methods

### 1. Apollo Client (Client-Side)

**When to use:**
- React hooks (application layer)
- Client-side mutations/queries
- Browser environment

**How it works:**
```typescript
import { useApolloClient } from "@apollo/client";
import { BULK_INSERT_DOCUMENT_LOG_FILES } from "@warp/graphql/generated/mutations";

const apolloClient = useApolloClient();

// Imperative mutation
await apolloClient.mutate({
  mutation: BULK_INSERT_DOCUMENT_LOG_FILES,
  variables: { objects: [...] }
});
```

**Advantages:**
- Automatic caching
- Real-time updates
- React integration
- Error handling

---

### 2. SDK (Server-Side)

**When to use:**
- `getServerSideProps`
- API routes
- Server-side data fetching

**How it works:**
```typescript
import { createSDKClient } from "@warp/graphql/sdk";

const sdk = createSDKClient({ headers: { authorization: token } });

const data = await sdk.getDocumentLogs({
  where: { companyId: { _eq: companyId } }
});
```

**Advantages:**
- No browser required
- Direct server-to-server
- SSR compatibility

---

## Implementation in Document Repository V2

### Application Layer Hooks

**Files:** `useUploadManager.ts`, `useProcessingTracker.ts`

**Pattern:**
```typescript
export function useUploadManager({ userContext }: Props) {
  const apolloClient = useApolloClient(); // ✅ Get client instance
  
  const uploadFiles = async () => {
    // Import mutation definition
    const { BULK_INSERT_DOCUMENT_LOG_FILES } = 
      await import("@warp/graphql/generated/mutations");
    
    // Execute imperatively
    await apolloClient.mutate({
      mutation: BULK_INSERT_DOCUMENT_LOG_FILES,
      variables: { ... }
    });
  };
}
```

**Why not use mutation hooks?**
- ❌ `useBulkInsertDocumentLogFilesMutation()` can only be called at component level
- ❌ Cannot call hooks inside helper functions
- ✅ `apolloClient.mutate()` can be called anywhere

---

### Server Layer

**File:** `server/fetchDocuments.ts`

**Pattern:**
```typescript
export async function fetchDocuments(
  apolloClient: ApolloClient, // Passed from outside
  userContext: UserContext
) {
  const { GET_DOCUMENT_LOGS } = await import("@warp/graphql/queries");
  
  const { data } = await apolloClient.query({
    query: GET_DOCUMENT_LOGS,
    variables: { where: { ... } },
    fetchPolicy: "network-only"
  });
  
  return normalizeDocuments(data.DocumentLogs);
}
```

**Note:** In SSR context (future enhancement), replace with SDK:
```typescript
const sdk = createSDKClient({ ... });
const data = await sdk.getDocumentLogs({ ... });
```

---

## Import Paths

### ❌ Incorrect (Current Issue)

```typescript
// This module doesn't exist
await import("@warp/graphql/mutations");
```

### ✅ Correct

```typescript
// Import from generated definitions
import { 
  BULK_INSERT_DOCUMENT_LOG_FILES,
  BULK_UPDATE_DOCUMENT_LOG_FILES 
} from "@warp/graphql/generated/mutations";

// Or for queries
import { 
  GET_DOCUMENT_LOGS,
  GET_AI_SUGGESTED_DOCUMENTS 
} from "@warp/graphql/generated/queries";
```

---

## Common Patterns

### Pattern 1: Mutation in Hook

```typescript
// ✅ Correct
const apolloClient = useApolloClient();

const performAction = async () => {
  const { MUTATION_NAME } = await import("@warp/graphql/generated/mutations");
  
  const { data } = await apolloClient.mutate({
    mutation: MUTATION_NAME,
    variables: { ... }
  });
  
  return data;
};
```

### Pattern 2: Query in Server Function

```typescript
// ✅ SSR-compatible
export async function serverSideFunction(apolloClient) {
  const { QUERY_NAME } = await import("@warp/graphql/generated/queries");
  
  const { data } = await apolloClient.query({
    query: QUERY_NAME,
    fetchPolicy: "network-only"
  });
  
  return normalize(data);
}
```

---

## Decision Matrix

**Should I use Apollo Client or SDK?**

```
┌─────────────────────────────────────────────────────────┐
│ Question: Where is this code running?                   │
└─────────────────────────────────────────────────────────┘
              │
              ├─ Browser (React hook)
              │  └─> ✅ Apollo Client (apolloClient.mutate/query)
              │
              └─ Server (getServerSideProps, API route)
                 └─> ✅ SDK (createSDKClient)
```

**Should I use a mutation hook or apolloClient.mutate()?**

```
┌─────────────────────────────────────────────────────────┐
│ Question: Can I call this at component level?           │
└─────────────────────────────────────────────────────────┘
              │
              ├─ Yes (inside component/hook body)
              │  └─> ✅ Either works (prefer apolloClient for consistency)
              │
              └─ No (inside helper function, callback)
                 └─> ✅ apolloClient.mutate() (hooks not allowed)
```

---

## Troubleshooting

### Error: "Cannot find module '@warp/graphql/mutations'"

**Cause:** Incorrect import path

**Solution:**
```typescript
// Change this:
await import("@warp/graphql/mutations");

// To this:
import { MUTATION_NAME } from "@warp/graphql/generated/mutations";
```

### Error: "Cannot call hooks inside callback"

**Cause:** Trying to use `useMutation()` hook inside helper function

**Solution:**
```typescript
// ❌ Wrong
function helperFunction() {
  const [mutate] = useBulkInsertMutation(); // Error!
}

// ✅ Correct
function helperFunction(apolloClient) {
  await apolloClient.mutate({ mutation: BULK_INSERT });
}
```

---

## Summary

1. **Application Layer** (hooks) → Use **Apollo Client** (`apolloClient.mutate`)
2. **Server Layer** (SSR) → Use **SDK** (when implemented)
3. **Never** use mutation hooks inside helper functions
4. **Always** import from `@warp/graphql/generated/*`

---

**Last Updated:** February 1, 2026  
**Related Files:**
- `application/useUploadManager.ts`
- `application/useProcessingTracker.ts`
- `server/fetchDocuments.ts`
