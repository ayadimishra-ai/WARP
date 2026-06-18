# Document Repository V2 - Clean Architecture

**Status**: 🟢 **Production Ready** | **Architecture**: 5-Layer Clean Architecture | **Lines Reduced**: 2600+ → 15 files

This is a **complete rewrite** of the Document Repository feature following clean architecture principles with strict layer separation and event-driven design.

## 🎯 Goals

- **Separation of Concerns**: Clear layer boundaries (domain → server → application → ui → pages)
- **Testability**: Pure functions, isolated logic, zero side-effect coupling
- **Performance**: Memoized components, card-level re-renders, SSR-first
- **Maintainability**: Explicit dependencies, no magic, event-driven over effect-driven
- **Architecture Compliance**: Zero useState/useEffect in page layer

## 📁 Architecture

```
document-repository-v2/
├── domain/           # Pure business logic (no React)
│   ├── document.types.ts      # Domain models
│   ├── document.rules.ts      # Business rules
│   └── document.selectors.ts  # Derived data
│
├── server/           # Data fetching (SSR-compatible)
│   └── fetchDocuments.ts      # GraphQL queries
│
├── application/      # Hooks & orchestration
│   ├── useDocuments.ts        # State management
│   ├── useUploadManager.ts    # Upload logic
│   ├── usePolling.ts          # Polling utility
│   ├── useProcessingTracker.ts # AI processing
│   └── useDocumentFilters.ts  # Filter state
│
├── ui/               # Presentational components
│   ├── Dropzone.tsx           # File drop UI
│   ├── DocumentCard.tsx       # Single document
│   └── DocumentGrid.tsx       # Grid layout
│
├── pages/            # Page composition
│   └── document-repository.tsx # Next.js page
│
└── index.ts          # Module exports
```

## 🔄 Data Flow

```
User Action (Upload)
       ↓
UI Layer (Dropzone)
       ↓
Application Layer (useUploadManager)
       ↓
Server Layer (Upload to S3, Update DB)
       ↓
Application Layer (Refresh documents)
       ↓
Domain Layer (Apply business rules)
       ↓
UI Layer (Re-render affected cards only)
```

## 🧪 Layer Responsibilities

### Domain Layer (Pure Logic)

**What it does:**
- Define business rules (expiry, validation, permissions)
- Define domain models
- Calculate derived state

**What it CANNOT do:**
- Import React
- Make API calls
- Access browser APIs

**Example:**
```typescript
// Pure function - testable, predictable
export function isDocumentExpired(document: Document): boolean {
  if (!document.expiryDate) return false;
  const status = calculateExpiryStatus(document.expiryDate);
  return status === ExpiryStatus.Expired;
}
```

---

### Server Layer (Data Fetching)

**What it does:**
- Fetch data from GraphQL/REST
- Normalize responses to domain models
- Handle authentication

**What it CANNOT do:**
- Use React hooks
- Manage UI state
- Contain business logic

**Example:**
```typescript
// SSR-compatible
export async function fetchDocuments(
  apolloClient: ApolloClient,
  userContext: UserContext
): Promise<Document[]> {
  const { data } = await apolloClient.query({...});
  return data.DocumentLogs.map(normalizeDocument);
}
```

---

### Application Layer (Orchestration)

**What it does:**
- Manage state with hooks
- Orchestrate uploads
- Handle polling
- Wire events

**What it CANNOT do:**
- Render JSX
- Contain business rules
- Directly call GraphQL

**Example:**
```typescript
export function useUploadManager({ onUploadComplete }) {
  const uploadFiles = async (files) => {
    // Orchestrate: validate → upload → persist → callback
  };
  return { uploadFiles, uploadProgress };
}
```

---

### UI Layer (Presentation)

**What it does:**
- Render components
- Emit events via callbacks
- Display data

**What it CANNOT do:**
- Make API calls
- Contain business logic
- Manage global state

**Example:**
```typescript
// Memoized for performance
export default memo(Dropzone, (prev, next) => {
  return prev.currentFile?.status === next.currentFile?.status;
});
```

---

### Page Layer (Composition)

**What it does:**
- Fetch initial data (SSR)
- Compose hooks
- Wire UI components

**What it CANNOT do:**
- Contain business logic
- Directly call GraphQL in render
- Implement domain rules

**Example:**
```typescript
export default function DocumentRepositoryPage(props) {
  const { documents, refreshDocuments } = useDocuments(props);
  const { uploadFiles } = useUploadManager({ onUploadComplete: ... });
  
  return <DocumentGrid onDrop={(id, files) => uploadFiles(id, files)} />;
}
```

## 🚀 Usage

### As a Next.js Page

```typescript
// pages/documents.tsx
export { default, getServerSideProps } from '@warp/client/features/document-repository-v2';
```

### As a Module

```typescript
import { 
  useDocuments,
  DocumentCard,
  isDocumentExpired 
} from '@warp/client/features/document-repository-v2';
```

## 🔄 Migration Path

1. **Parallel Implementation**: New module runs alongside old one
2. **Same Backend**: Uses existing GraphQL schema
3. **Feature Parity**: All business rules preserved
4. **Swappable**: Can replace old implementation without backend changes

## ✅ Key Improvements vs Old Implementation

| Aspect | Old | New |
|--------|-----|-----|
| **Structure** | Single 2600+ line file | 15+ focused files |
| **Effects** | 15+ useEffects | 3 useEffects (in hooks only) |
| **Testability** | Coupled to React | Pure functions, isolated layers |
| **Re-renders** | Full page | Card-level isolation |
| **Upload** | Effect-driven | Event-driven |
| **SSR** | Client-only | Server-side initial data |
| **State** | useState in page layer | Application hooks only |
| **Expired Docs** | Mixed with main view | Separate tab with auto-navigation |
| **System Docs** | Duplicates shown | Latest per form only |

## 🧪 Testing

```typescript
// Domain layer - unit tests
import { isDocumentExpired } from './domain/document.rules';

test('detects expired documents', () => {
  const doc = { expiryDate: '2025-01-01', ... };
  expect(isDocumentExpired(doc)).toBe(true);
});

// UI layer - component tests
import { render } from '@testing-library/react';
import Dropzone from './ui/Dropzone';

test('renders dropzone', () => {
  render(<Dropzone template={...} onDrop={jest.fn()} />);
});
```

## 📊 Performance Optimizations

1. **Memoization**: All UI components use `React.memo`
2. **Selective Re-renders**: Only changed cards update
3. **Event-Driven**: No effect watchers, only explicit actions
4. **Polling Optimization**: Only when AI processing active
5. **SSR**: Initial data loaded server-side

## 🔐 Security

- User context validated in server layer
- File type validation in domain rules
- Size limits enforced before upload
- Auth tokens handled in SSR only

## 🎉 Completed Features

### Core Functionality
- ✅ Document grid with search and filtering
- ✅ File upload (drag & drop, file picker)
- ✅ AI processing with progress tracking
- ✅ Document deletion with confirmation
- ✅ Real-time polling for processing updates
- ✅ SSR with hydration for instant load

### Advanced Features
- ✅ **Expired Documents Tab**: Separate view for expired documents
  - Auto-switch to expired tab when uploading expired doc
  - Auto-return to main view when last expired doc deleted
  - Only shows truly expired (not "expiring soon")
  - Correct document counts per tab
- ✅ **System-Generated Document Filtering**: Shows only latest per form
  - Prevents duplicate system reports
  - Groups by actual Form ID (not invitation ID)
  - Keeps all user-uploaded documents
- ✅ **"Any Other" Card**: Dynamic sequencing
  - Newest uploads appear first (1.001)
  - Existing uploads auto-shift down (1.002, 1.003...)
  - Fractional indexing maintains sort order
- ✅ **Document Validation API**: Expiry date extraction
  - Validates documents on upload
  - Extracts expiry dates automatically
  - Tracks document validity status
- ✅ **Smart DELETE Button**: Hides during processing
  - Checks upload and processing status
  - Prevents deletion of system-generated docs
  - Domain-level permission rules

## 📝 Notes

- **No Breaking Changes**: Same GraphQL contracts
- **Backward Compatible**: Can run alongside old implementation
- **Production Ready**: Full TypeScript, error handling, comprehensive logging
- **Extensible**: Add features by extending layers, not modifying existing code
- **Event-Driven**: Zero useEffect in page layer, all actions explicit
- **SSR-First**: All initial data server-side, client-side refresh on demand

---

**Status**: ✅ **Production Ready** - All features implemented and tested
