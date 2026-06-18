/**
 * Document Repository V2 - Clean Architecture Implementation
 * 
 * This module is a complete rewrite of the Document Repository feature
 * following clean architecture principles.
 * 
 * ## Architecture Overview
 * 
 * ```
 * ┌─────────────────────────────────────────────────┐
 * │                    Page Layer                    │
 * │         (Composition, SSR, Routing)             │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────┐
 * │                  UI Layer                        │
 * │    (Presentational Components, Memoized)        │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────┐
 * │             Application Layer                    │
 * │      (Hooks, Orchestration, Events)             │
 * └─────────────┬───────────┬───────────────────────┘
 *               │           │
 *     ┌─────────▼─────┐    │
 *     │  Server Layer │    │
 *     │ (Data Fetch)  │    │
 *     └─────────┬─────┘    │
 *               │           │
 *     ┌─────────▼───────────▼─────────────┐
 *     │         Domain Layer               │
 *     │  (Pure Logic, Types, Rules)       │
 *     └───────────────────────────────────┘
 * ```
 * 
 * ## Layer Responsibilities
 * 
 * ### Domain Layer (Pure)
 * - Business rules (validation, expiry, permissions)
 * - Domain types and models
 * - Selectors (derived state)
 * - NO React, NO side effects
 * 
 * ### Server Layer (Data)
 * - SSR-compatible data fetching
 * - GraphQL query execution
 * - Response normalization
 * - NO React hooks
 * 
 * ### Application Layer (Orchestration)
 * - State management hooks
 * - Upload orchestration
 * - Polling logic
 * - Event handling
 * 
 * ### UI Layer (Presentation)
 * - Dumb components
 * - Memoized for performance
 * - NO business logic
 * - NO API calls
 * 
 * ### Page Layer (Composition)
 * - SSR via getServerSideProps
 * - Hook composition
 * - Event wiring
 * - NO business logic
 * 
 * ## Key Improvements
 * 
 * 1. **Separation of Concerns**: Each layer has a single, clear responsibility
 * 2. **Testability**: Pure functions can be tested in isolation
 * 3. **Performance**: Memoized components prevent unnecessary re-renders
 * 4. **Event-Driven**: Uploads triggered by user actions, not effects
 * 5. **SSR Support**: Initial data fetched server-side
 * 6. **Type Safety**: Full TypeScript coverage across all layers
 * 
 * ## Usage Example
 * 
 * ```tsx
 * import DocumentRepositoryPage from '@warp/client/features/document-repository-v2/pages/document-repository';
 * 
 * // Use as a Next.js page
 * export default DocumentRepositoryPage;
 * ```
 * 
 * ## Migration Notes
 * 
 * - This module is **parallel** to the existing implementation
 * - Same backend contracts (GraphQL mutations/queries)
 * - Same business rules preserved
 * - Can be swapped in without backend changes
 * 
 * @module document-repository-v2
 */

// ========== Domain Exports ==========
export * from "./domain/document.rules";
export * from "./domain/document.selectors";
export * from "./domain/document.types";

// ========== Server Exports ==========
export * from "./server/fetchDocuments";

// ========== Application Exports ==========
export { useDocumentFilters } from "./application/useDocumentFilters";
export { useDocuments } from "./application/useDocuments";
export { usePolling } from "./application/usePolling";
export { useProcessingTracker } from "./application/useProcessingTracker";
export { useUploadManager } from "./application/useUploadManager";

// ========== UI Exports ==========
export { default as DocumentCard } from "./ui/DocumentCard";
export { default as DocumentGrid } from "./ui/DocumentGrid";
export { default as Dropzone } from "./ui/Dropzone";

// ========== Page Exports ==========
export { default as DocumentRepositoryPage } from "./pages/document-repository";

