# WARP Apps

There are two apps in `apps/`: `hasura` (configuration only, no runtime code) and `web` (the Next.js application).

---

## apps/hasura

**Purpose**: Hasura GraphQL engine configuration, not a runnable Node app.

Contains:
- `config.yaml` — Hasura CLI config pointing to the App Runner endpoint
- `docker-compose.yaml` — Local dev stack (PostgreSQL 12 + Hasura v2.10.0)
- `migrations/` — Versioned SQL migrations (see `database-schema.md`)
- `metadata/` — Hasura metadata YAML (permissions, relationships, event triggers — see `hasura-metadata.md`)
- `package.json` — Scripts to run `hasura console` and `hasura deploy`

Dev command: `yarn dev:hasura` (runs Hasura console against the configured endpoint).

---

## apps/web

**Package name**: `@warp/web`

**Purpose**: The main WARP user-facing application. A Next.js 14 app (Pages Router) that serves:
1. UI pages for form filling, invitation management, assessment listing, questionnaire builder, and document repository
2. All serverless API routes (backend logic, email sending, S3 file handling, score calculation, AI integration)

**Key dependencies**: Mantine 5 (UI), Apollo Client 3 (GraphQL), NextAuth v4 (auth), TanStack Table v8, react-pdf/renderer (PDF export), xlsx (Excel export), JSONata (formula eval), Zustand (state), Busboy (multipart file upload parsing).

**Deployment**: Serverless via `serverless.yml` (AWS Lambda) or Docker container (see root `Dockerfile`).

**Instrumentation**: `instrumentation.ts` runs at server boot and loads all secrets from AWS Secrets Manager before any request is handled.

---

### Pages (`apps/web/pages/`)

#### Root pages

| File | Route | Purpose |
|---|---|---|
| `_app.tsx` | — | Next.js app wrapper; sets up Mantine provider, Apollo Client, NextAuth session provider |
| `_document.tsx` | — | Next.js custom Document (Mantine SSR emotion setup) |
| `index.tsx` | `/` | Home page placeholder (renders "Home Page" in MainLayout) |
| `assesment.tsx` | `/assesment` | [QA: typo in filename] Assessment listing page |
| `questionnaires.tsx` | `/questionnaires` | Questionnaire listing page |
| `document-repository.tsx` | `/document-repository` | Document repository page |
| `pdf.tsx` | `/pdf` | PDF generation/preview page |
| `test.tsx` | `/test` | Ad-hoc test page |

#### `assessment/` — Assessment management

| File | Route | Purpose |
|---|---|---|
| `assessment/listing.tsx` | `/assessment/listing` | Assessment listing with status filters and action buttons |
| `assessment/[formId]/` | | Dynamic assessment pages (not fully listed) |

#### `form/` — Form filling

| File | Route | Purpose |
|---|---|---|
| `form/listing.tsx` | `/form/listing` | Form listing page |
| `form/[formId]/intro.tsx` | `/form/[formId]/intro` | Form introduction/overview page before starting |
| `form/[formId]/start.tsx` | `/form/[formId]/start` | Main form-filling UI (renders FormFields, handles answer saving) |
| `form/[formId]/invitation/` | `/form/[formId]/invitation/` | Invitation-specific form views |
| `form/[formId]/_index.tsx` | redirect/index | |
| `form/[formId]/list.tsx` | `/form/[formId]/list` | |
| `form/[formId]/ajv-test.tsx` | `/form/[formId]/ajv-test` | AJV validation test page |

#### `invitation/` — Invitation management

| File | Route | Purpose |
|---|---|---|
| `invitation/` (directory) | `/invitation/...` | Invitation detail and management pages |

#### `embed/` — Embeddable views

Embeddable form views for external integration (contents not fully explored).

#### `learn/` — Help/learning content

#### `globalDataStorage/` — Global state test pages

#### `temp/` and `test/` — Development scratch pages

---

### API Routes (`apps/web/pages/api/`)

#### Authentication

| File | Method | Purpose |
|---|---|---|
| `auth/[...nextauth].ts` | NextAuth handler | Email/password login via `CredentialsProvider`; issues JWT with Hasura claims |
| `jwt.ts` | GET/POST | JWT utility endpoint |
| `v1/platform/auth/signin.ts` | POST | Primary sign-in handler: validates credentials, builds Hasura JWT claims, includes AI subscription details and OPS-to-IQ curation plan |

#### User management

| File | Method | Purpose |
|---|---|---|
| `v1/platform/user/index.ts` | POST/PUT | Create or update user |
| `v1/platform/user/[userId].ts` | GET/PUT/DELETE | Get/update/delete specific user |
| `v1/platform/user/UpdateResetPasswordFlag.ts` | POST | Mark that user must reset password on next login |
| `new-user-created-email.ts` | POST | Send welcome email to newly created user |

#### Company management

| File | Method | Purpose |
|---|---|---|
| `v1/platform/company/index.ts` | POST/PUT | Create or update company (encrypts `primaryContact.email` before saving) |
| `v1/platform/company/[companyId].ts` | GET/PUT/DELETE | Get/update/delete specific company |
| `v1/platform/company/bulk.ts` | POST | Bulk create/update companies |
| `v1/platform/company/send-invitation.ts` | POST | Send form invitation to a company |
| `v1/platform/company/addresses/save-address.ts` | POST | Save company address |
| `v1/platform/company/addresses/update-address.ts` | PUT | Update company address |
| `v1/platform/company/addresses/delete-address.ts` | DELETE | Delete company address |
| `get-company-by-name-and-primary-contact.ts` | POST | Look up company by name and contact details |
| `v1/platform/emailsubscribed/index.ts` | GET/POST | Manage email subscription status |

#### Form submission flow

| File | Method | Purpose |
|---|---|---|
| `saveAnswers/index.ts` | POST/PUT | Save/upsert answers for a submission; delegates to `@warp/server/services/save-Answers/saveAnswers` |
| `submit-form.ts` | POST | Mark a FormSubmission as `Submitted`; validates JWT, calls `sdk.updateSubmissionStatus` |
| `v1/internal/post-form-submission.ts` | POST | Post-submission processor: runs score calculation, progress report, logs errors to S3 |
| `calculate-score/index.ts` | POST | Score calculation engine: fetches form tree, evaluates JSONata `calc` expressions per section/question, writes FormResult rows, generates Interim_Recommendations |
| `progress-report-score.ts` | POST | Progress report score calculation: evaluates scoring formulas, writes InterimFormLogs |
| `interiam/index.ts` | POST | Interim answer operations |
| `carry-forward-assessment-data/index.ts` | POST | Copy answers from a previous submission to the current one |
| `carry-forward-assessment-data-userwise/index.ts` | POST | User-scoped carry-forward variant |
| `carry-forward-suggestions.ts` | POST | Carry forward AI suggestions from previous submission |

#### Email notifications

All email routes use nodemailer via `@warp/server/services/notification.service`. Many fetch templates from the `EmailTemplate` table.

| File | Purpose |
|---|---|
| `email-invitation.ts` | Send form invitation email |
| `khaitan-email-invitation.ts` | Client-specific invitation email variant (Khaitan) |
| `Reviewer-email-invitation.ts` | Send invitation to a reviewer |
| `assigned-question-bulk-email-invitation.ts` | Bulk email for question assignments |
| `answer-on-assigned-question-bulk-email.ts` | Bulk email when assigned questions are answered |
| `question-assign-email-invitation.ts` | Email when a question is assigned |
| `question-response-email-invitation.ts` | Email when a question is responded to |
| `comments-on-question-bulk-email.ts` | Bulk email for comments on questions |
| `commentsubmission-email.ts` | Email when a comment is submitted |
| `commentsubmissionuser2-email.ts` | Secondary user comment submission email |
| `assessmentapproved-email1.ts` | Email when an assessment is approved |
| `assessmentreopen-email.ts` | Email when an assessment is re-opened |
| `reviewer-aaproved-email.ts` | [QA: typo "aaproved"] Email when reviewer approves |
| `reviewer-declined-email.ts` | Email when reviewer declines |
| `reviewer-resubmit-email.ts` | Email when reviewer requests resubmission |
| `reviewer-pending-emails-cron.ts` | Bulk reminder emails for pending reviewer actions (cron-triggered) |
| `sending-email-from-db.ts` | Generic send-email-by-type endpoint (fetches template from DB) |
| `calculate-score/form-submission-email.ts` | Email sent after score calculation on submission |
| `calculate-score/reviewer-form-submission-email.ts` | Reviewer-specific submission email |
| `recommendation/email-*.ts` (4 files) | Recommendation lifecycle emails (raised, reopened, action taken, action approved) |
| `recommendation/reminder/recommendation-reminder-pre-duedate.ts` | Reminder before recommendation due date |
| `recommendation/reminder/recommendation-reminder-post-duedate.ts` | Reminder after recommendation due date |

#### File storage (AWS S3)

| File | Purpose |
|---|---|
| `awss3/upload.ts` | Multipart file upload to S3 via Busboy; streams file to S3 |
| `awss3/download.ts` | Download file from S3 |
| `awss3/get-upload-url.ts` | Get pre-signed S3 upload URL |
| `awss3/get-download-url.ts` | Get pre-signed S3 download URL |
| `awss3/move-file.ts` | Move/copy file within S3 |
| `upload-carry-forward-pdf.ts` | Upload a carry-forward PDF to S3 |

#### OPs / external platform integration

| File | Purpose |
|---|---|
| `v1/ops/check-company-eligibility.ts` | Calls `NEXT_PUBLIC_PRO_API_URL` to check if a company exists in the OPs GHG calculator system |

#### AI features

All AI routes call the AI microservice at `NEXT_PUBLIC_AIAPI_BASE_URL` (production: `alphams.snowkap.com`).

| File | Purpose |
|---|---|
| `AI/AIprocessing.ts` | Trigger AI document processing job |
| `AI/AI-dataStats-calculation.ts` | Calculate AI data-fill statistics for a form invitation |
| `AI/AI-rara-document-validation.ts` | Trigger RARA document validation |
| `AI/ai-processing-completed.ts` | Callback: AI processing completed notification |
| `AI/document-processing-completed.ts` | Callback: document processing completed |
| `AI/generate-background-report.ts` | Generate an AI background report |
| `AI/suggestion-answer-entry.ts` | Write an AI suggestion as an answer |
| `AI/suggestion-cleanup.ts` | Clean up stale suggestions |
| `AI/update-form-invitation.ts` | Update form invitation AI metadata |
| `AI/update-invitation-and-skipped-status.ts` | Update AI curation skipped status |
| `AI/update-invitation-web-curation-ai-bulk-processing.ts` | Update web curation + AI bulk processing status |
| `AI/web-curation-for-processing.ts` | Trigger web curation processing |
| `AI/get-chat-subscription-status.ts` | Get AI chat subscription status |
| `AI/ai-chat-subscription-notification.ts` | Send AI chat subscription notification |
| `AI/get-formInvitation-detail.ts` | Get form invitation details for AI context |
| `AI/get-invitation-isdata-curation-skipped-status..ts` | [QA: double dot in filename] Check if curation is skipped |
| `AI/calculate-completion-percentage.ts` | Calculate % of AI-filled fields |
| `AI/migrate-existing-invitations-stats.ts` | One-off migration script for AI stats |
| `AI/email-invitation.ts` | AI-related invitation email |

#### RARA document validation

| File | Purpose |
|---|---|
| `rara/document-validation.ts` | Validate uploaded documents via RARA API |
| `rara/document-validation-comprehensive.ts` | Comprehensive RARA validation |
| `rara/document-rating.ts` | Rate a document via RARA API |
| `rara/document-rating-single.ts` | Rate a single document |
| `rara/document-rating-direct.ts` | Direct rating without AI pipeline |

#### Webhooks

| File | Purpose |
|---|---|
| `webhooks/document-expiry-notifications.ts` | Receives webhook from external scheduler to send document expiry reminder emails; validates `DOCUMENT_EXPIRY_NOTIFICATION_WEBHOOK_SECRET` header |

#### Utility and misc

| File | Purpose |
|---|---|
| `hello.ts` | Health-check placeholder (`"Hello"`) |
| `jwt.ts` | JWT decode/verify utility |
| `get-invited-assessmentlist-by-companyId.ts` | Get assessments a company has been invited to |
| `v1/platform/company/send-invitation.ts` | Send form invitation |
| `test/secrets-check.ts` | Test endpoint to verify secrets are loaded |
| `test-logs/index.ts` | Log test endpoint |

---

### Screens (`apps/web/screens/`)

The `screens/` directory (parallel to `pages/`) contains page-level components separated from route files, following a screens pattern. Not fully explored.

### Components (`apps/web/components/`)

App-specific components (not shared across the monorepo, unlike `packages/client/components/`). Not fully explored.

### Utils (`apps/web/utils/`)

App-specific utility functions. Not fully explored.

### Hooks (`apps/web/hooks/`)

App-specific hooks. Not fully explored.

### Types (`apps/web/types/`)

App-specific TypeScript types. Not fully explored.

### Styles (`apps/web/styles/`)

Global CSS styles.

### Public (`apps/web/public/`)

Static assets.

---

### Config files

| File | Purpose |
|---|---|
| `next.config.js` | Transpiles all `@warp/*` packages, enables instrumentation hook, disables `fs` for browser, sets page extensions |
| `tsconfig.json` | Extends `tsconfig/nextjs.json`, sets path aliases |
| `serverless.yml` | AWS Lambda/API Gateway deployment config |
| `env/` | Environment file templates (not tracked — gitignored) |
