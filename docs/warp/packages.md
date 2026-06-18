# WARP Packages

All packages live under `packages/`. They are consumed by `apps/web` and (in the case of `@warp/graphql`, `@warp/shared`, `@warp/configs`) by each other. All packages are written in TypeScript and export their types directly from `.ts` files (no build step except codegen for `@warp/graphql`).

---

## @warp/configs

**Location**: `packages/configs/`
**Entry**: `index.ts`
**Consumers**: `@warp/graphql`, `@warp/client`, `@warp/server`, `apps/web`

Thin wrappers around environment variables. No dependencies other than `dotenv` (dev only).

| File | Exports | Purpose |
|---|---|---|
| `api.config.ts` | `getGraphqlApiUrl()`, `getAppApiUrl()` | Returns `NEXT_PUBLIC_GRAPHQL_API_URL` (with hardcoded fallback to production URL) and `NEXT_PUBLIC_API_BASE_URL` |
| `email.config.ts` | Email config helpers | SMTP env var readers |
| `graphql.config.ts` | `getHasuraAdminSecret()` | Returns `HASURA_GRAPHQL_ADMIN_SECRET` |
| `nextauth.config.ts` | NextAuth secret accessor | |
| `s3bucket.config.ts` | S3 config accessors | Reads `S3_BUCKET`, `S3_BUCKET_REGION`, `S3_BUCKET_ACCESS_KEY`, `S3_BUCKET_SECRET_ACCESS_KEY`, `S3_BUCKET_BACKUP` |
| `index.ts` | Re-exports all | |

[QA] `api.config.ts` has a hardcoded production fallback URL (`https://2bcfdg2um2.ap-south-1.awsapprunner.com/v1/graphql`) that will silently use the wrong endpoint if the env var is missing.

---

## @warp/shared

**Location**: `packages/shared/`
**Entry**: `index.ts`
**Consumers**: `@warp/graphql`, `@warp/client`, `@warp/server`, `apps/web`

Pure TypeScript (no React, no Node-only APIs). Safe to import in any context. Dependencies: `dayjs`, `jsonata`, `lodash`, `uuid`.

### `constants/`

| File | Key exports | Purpose |
|---|---|---|
| `app.constants.ts` | `AppRoles`, `FormInvitationStatus`, `FormInvitationUIStatus`, `FormSubmissionStatus`, `QuestionStatus`, `FormTypes`, `FormMode`, `RecommendationStatus`, `EmailStatus`, `Platform` (config types), `SourcesType`, `DocumentLogsStatus`, `AIEmailTemplates`, `inputFieldsinFormFields`, `OPSToIQCurationStatus`, `AIProcessingTypes`, `WebDataCurationStatus`, `DOCUMENT_EXPIRY_NOTIFICATION`, `AI_DATA_SOURCES`, `FORM_NAMES`, `DOCUMENT_VALIDATION_TYPES`, `blankCheck`, `commonValues` | All application-level enumerations and constant objects; the single source of truth for status values, role names, and configuration keys |
| `form-submission.constants.ts` | `FormSubmissionStatus` | `New`, `Submitted`, `InProgress`, `Successful`, `Failed`, `Declined`, `Re-submitted`, `Approved` |
| `api.constants.ts` | API-related constants | |
| `ai.constants.ts` | AI feature constants | |
| `status.ts` | Status constants | |

### `types/`

| File | Purpose |
|---|---|
| `auth.types.ts` | `AuthSessionType` — session shape: `{ company, platform, user, accessToken }` |
| (others) | Additional shared TypeScript types |

### `utils/`

| File | Key exports | Purpose |
|---|---|---|
| `auth-session.util.ts` | `parseHasuraClaims()`, `buildHasuraClaims()`, `getLocalStorageSession()` | Parse JWT Hasura claims into session object; build Hasura claims for JWT signing; read session from localStorage |
| `custom-error.util.ts` | `CustomError()` | Creates structured Next.js API error responses |
| `date.util.ts` | Date helpers | dayjs-based date formatting |
| `logger.util.ts` | `logger` | Structured logging utility |
| `number.utl.ts` | Number helpers | [QA: typo in filename "utl"] |
| `jwt-ai.util.ts` | `PLAN_OPS_TO_IQ_CURATION` | AI plan name constants for JWT claims |
| `excel-form-fields-processor.ts` | Form field Excel processing | Processes form field data for Excel export |
| `excel-form-fields-processor_new.ts` | Newer variant | |
| `excel-questions-processor.ts` | Question Excel processing | |
| `excel-sections-processor.ts` | Section Excel processing | |
| `form-field/` | Form field utility functions | |
| `dom-purifier/` | DOMPurify wrapper | Sanitizes HTML content |

### `validation/`

Yup validation schemas shared across client and server.

---

## @warp/graphql

**Location**: `packages/graphql/`
**Entry**: `index.ts`
**Consumers**: `@warp/client`, `@warp/server`, `apps/web`
**Build**: `yarn codegen` runs `graphql-code-generator` to produce typed SDK from `.gql` files

This package contains all GraphQL operation definitions and the generated TypeScript SDK.

### Raw operations

| Directory | Count | Contents |
|---|---|---|
| `queries/` | 181 files | All read operations (.gql files) |
| `mutations/` | 112 files | All write operations (.gql files) |
| `subscriptions/` | — | Subscription operations |

**Notable queries** (representative sample):
- `get-form-questionnaire.gql` — Fetches full form with sections, questions, form fields for rendering
- `get-render-form-details.gql` / `get-render-formfield-details.gql` — Optimized form render queries
- `get-answer-by-questionid-and-submissionid.gql` — Fetch specific answer for pre-filling
- `get-score-calculation-details.gql` / `get-interim-score-calculation-details.gql` — Fetch all data needed for score calculation
- `get-assessment-list.query.gql` — Assessment listing with filters
- `get-form-invitation-details-by-id.gql` — Full invitation detail
- `get-email-template-data-by-email-type.gql` — Fetch email template by type

**Notable mutations**:
- `upsert-answer.gql` — Upsert a single answer
- `bulk-insert-answer.gql` / `bulk-upsert-answer-for-AI.gql` — Batch answer writes
- `update-form-invitation-status.gql` — Change invitation status
- `update-submission-status.gql` — Change submission status
- `upsert-form-results.gql` — Write score results
- `insert-recommendation.gql` / `bulk-insert-interim-recommendation.gql` — Recommendations
- `create-company.gql` / `create-user.gql` — Entity creation

### Generated files (`generated/`)

| File | Purpose |
|---|---|
| `types.ts` | All GraphQL types, input types, enums — auto-generated from Hasura schema introspection |
| `server.ts` | `sdk` object using `graphql-request` — for server-side (API routes) use with admin secret; all operations available as typed async functions |
| `sdk.ts` | Apollo Client hooks (`useQuery`, `useMutation`, `useSubscription`) — for client-side React component use |
| `apollo-helpers.ts` | Apollo cache helpers |

### Usage pattern

Server-side (API routes):
```typescript
import { sdk } from "@warp/graphql/generated/server";
const result = await sdk.getFormQuestionnaire({ formId, invitationId });
```

Client-side (React components):
```typescript
import { useGetFormQuestionnaireQuery } from "@warp/graphql/generated/sdk";
const { data } = useGetFormQuestionnaireQuery({ variables: { formId } });
```

### Codegen config

`codegen.js` — configures graphql-code-generator with multiple output plugins:
- `typescript` — base type definitions
- `typescript-operations` — query/mutation types
- `typescript-react-apollo` — React hooks for client SDK
- `typescript-generic-sdk` — generic SDK for server use (via `graphql-request`)

---

## @warp/server

**Location**: `packages/server/`
**Entry**: `index.ts`
**Consumers**: `apps/web` (API routes only — never imported in client-side code)
**Note**: Contains Node.js-only code (nodemailer, aws-sdk, file system). Never transpile for browser.

### `guards/`

| File | Export | Purpose |
|---|---|---|
| `api-error.guard.ts` | `ApiErrorGuard(handler)` | HOF that wraps an API route handler with try/catch, returns structured error JSON on exception |
| `api-method.guard.ts` | `ApiMethodGuard(handler, method)` | HOF that enforces HTTP method; returns 405 if wrong method |
| `api-hasura-webhook-guard.ts` | `ApiHasuraWebhookGuard` | Validates Hasura event trigger webhook signature |
| `embedded-auth-guard.ts` | Embedded auth guard | Auth guard for embedded form views |
| `AI/` | AI-specific guards | |

### `services/`

| File/Dir | Key exports | Purpose |
|---|---|---|
| `aws-s3.service.ts` | `upload()`, `uploadError()`, `download()`, `getUploadUrl()`, `getDownloadUrl()`, `moveFile()` | All AWS S3 operations; `uploadError()` uploads error JSON to S3 `exception-logs` bucket |
| `notification.service.ts` | `sendEmail()`, `sendEmailFromTemplate()` | Nodemailer email sending; fetches SMTP config from `EmailConfiguration` table |
| `company.service.ts` | `createCompany()`, `updateCompany()` | Company CRUD logic (calls Hasura SDK) |
| `user.service.ts` | `createUser()`, `updateUser()` | User CRUD logic |
| `invitation.service.ts` | Invitation service functions | |
| `invited-assessment-list.services.ts` | Assessment list service | |
| `platform-sync.service.ts` | Platform sync | |
| `document-expiry-notification.service.ts` | `sendDocumentExpiryNotifications()` | Finds documents expiring in 5/20/30 days or already expired; sends notification emails |
| `addresses.service.ts` | Address CRUD | |
| `isemailsubscribed.service.ts` | Email subscription check | |
| `carry-forward-assessment-data/` | Carry-forward service | Copies answers from previous submission to current |
| `carry-forward-suggestions.service.ts` | AI suggestion carry-forward | |
| `ai-chat-subscription-notification.service.ts` | AI chat notifications | |
| `ai-report.service.ts` | AI report generation | |
| `save-Answers/saveAnswers.ts` | `saveAnswers(body)` | Core answer persistence logic: determines whether to update existing answers or create new ones, handles interim answers for re-opened submissions, evaluates carry-forward-as-suggestions logic |
| `calculate-score/` | Score calculation services | |
| `AI/` | AI-specific services | |

### `libs/`

Shared Node.js utilities (not inspected in detail).

### `util/`

Server-side utilities.

---

## @warp/client

**Location**: `packages/client/`
**Entry**: `index.ts`
**Consumers**: `apps/web`

All React code shared across pages. This is by far the largest package. It requires React 17+ as a peer dependency and imports many UI libraries.

### `components/`

Standalone UI components:

| File/Dir | Purpose |
|---|---|
| `MonthYearPicker.tsx` | Month/year date picker component |
| `MonthYearRangePicker.tsx` | Month/year range picker |
| `PaginationFooter.tsx` | Table pagination footer |
| `SortIcons.tsx` | Sort direction icons for table headers |
| `TooltipUtils.tsx` | Tooltip helper components |
| `form/` | Form-specific components |
| `app/` | App-level components |
| `charts/` | Chart components (using amCharts 5) |
| `icons/` | Icon components |
| `questions/` | Question display components |
| `rjsf-widgets/` | Custom react-jsonschema-form widgets |
| `svgIcons/` | SVG icon components |

### `features/`

Feature modules (domain-focused component collections):

| Directory | Purpose |
|---|---|
| `assessment/` | Assessment listing, detail, management components |
| `auth/` | Login form, auth-related UI |
| `company-form/` | Company and form management UI |
| `document-repository/` | Document repository v1 UI |
| `document-repository-v2/` | Document repository v2 UI |
| `form/` | Form rendering engine (renders FormFields based on `interface` type, handles answer state, validation) |
| `invitation/` | Invitation management UI |
| `questionnaire/` | Questionnaire builder UI |
| `recommendation/` | Recommendation listing and management UI |
| `score-calculation/` | Score display UI |
| `settings/` | Platform/company settings UI |

### `hooks/`

Custom React hooks (not fully listed). Includes:
- `encryption-decryption` — client-side encrypt/decrypt utility (used for email encryption in company creation)

### `libs/`

Client-side libraries:
- `progressive-delay-rate-limit` — Rate limiting HOF (`withEmailOrIpRateLimitWithProgressiveDelay`) applied to sensitive endpoints (sign-in, score calculation)

### `services/`

Client-side service functions (non-hook API callers).

### `layouts/`

Page layout components:
- `MainLayout` — Primary app shell (navigation, sidebar)

### `hocs/`

Higher-order components.

### `types/`

| File | Purpose |
|---|---|
| `page-types.ts` | `NextPageType` — extends `NextPage` with `getLayout` and `title` for per-page layout support |

### `themes/`

Mantine theme configuration.

### `icons/`

Custom icon definitions.

---

## @warp/secrets

**Location**: `packages/secrets/`
**Entry**: `index.ts`
**Consumers**: `apps/web` (instrumentation only — loaded at server boot, never in API route handlers directly)
**Dependencies**: `@aws-sdk/client-secrets-manager` v3

| File | Export | Purpose |
|---|---|---|
| `secrets-manager.service.ts` | `secretsManagerService` | Singleton service that calls AWS Secrets Manager API to fetch all secrets for the configured secret name |
| `load-environment.ts` | `loadEnvironment()` | Fetches secrets from AWS SM and merges into `process.env` (without overwriting existing values) |
| `index.ts` | Re-exports `loadEnvironment` | |

Called from `apps/web/instrumentation.ts`:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { loadEnvironment } = await import('@warp/secrets');
    await loadEnvironment(); // throws if AWS SM is unreachable
  }
}
```

Fail-fast: if AWS Secrets Manager is unreachable, the server will not start.

---

## @warp/eslint-config-custom

**Location**: `packages/eslint-config-custom/`
**Consumers**: All packages and apps via `"eslint-config-custom": "*"` in devDependencies

Shared ESLint configuration extending `eslint-config-next` and `eslint-config-prettier`.

---

## @warp/tsconfig

**Location**: `packages/tsconfig/`
**Consumers**: All packages and apps via `"tsconfig": "*"` in devDependencies

Provides base `tsconfig.json` files:
- `base.json` — base strict TypeScript config
- `nextjs.json` — Next.js-specific TypeScript config (extends base)
- `react-library.json` — For React component packages (client, etc.)

---

## Package Dependency Graph

```
apps/web
  ├── @warp/client       (React components + features)
  │     ├── @warp/graphql
  │     ├── @warp/shared
  │     └── @warp/configs
  ├── @warp/graphql      (GQL operations + generated SDK)
  │     ├── @warp/shared
  │     └── @warp/configs
  ├── @warp/server       (Node services + guards)
  │     ├── @warp/graphql
  │     └── @warp/shared
  ├── @warp/shared       (pure TS constants, types, utils)
  ├── @warp/secrets      (AWS Secrets Manager loader)
  └── @warp/configs      (env var accessors)
```
