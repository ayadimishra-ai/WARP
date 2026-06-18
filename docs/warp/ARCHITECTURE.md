# WARP Architecture

## System Purpose

WARP is an ESG (Environmental, Social, Governance) data collection and assessment platform built for Snowkap. It enables:

- **Form-based data collection**: Configurable questionnaires (Assessments and Reports) are sent to portfolio companies (Invitees) via invitations
- **Multi-party submission workflow**: Invitees fill forms, Inviter companies supervise, Approvers review, and Platform admins control tenant settings
- **Scoring and recommendations**: Submitted forms are automatically scored via JSONata expressions embedded in form fields; recommendations are generated per answer
- **AI-augmented data entry**: An AI layer (document ingestion, web curation, OPS-to-IQ curation) pre-fills form answers from uploaded documents, web sources, and the OPs GHG calculator
- **BRSR compliance**: Indian BRSR (Business Responsibility and Sustainability Reporting) frameworks are first-class form types with dedicated PDF export

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo orchestrator | Turborepo 1.6 |
| Package manager | Yarn 1.22 (workspaces) |
| Frontend framework | Next.js 14 (Pages Router) |
| UI library | Mantine 5, Tabler Icons, TanStack Table |
| GraphQL client | Apollo Client 3 |
| GraphQL codegen | graphql-code-generator (typescript-generic-sdk, react-apollo) |
| Backend API | Next.js API routes (serverless functions) |
| GraphQL engine | Hasura v2.10 (over PostgreSQL 12) |
| Database | PostgreSQL 12 |
| Auth | NextAuth v4 (JWT strategy) with Hasura JWT claims |
| File storage | AWS S3 (via aws-sdk v2) |
| Secrets | AWS Secrets Manager (loaded at server start via instrumentation hook) |
| PDF generation | @react-pdf/renderer, pdfmake |
| Excel export | xlsx, json2xls |
| Formula engine | JSONata (embedded in Form/Section/Question `calc` and `recommendationCalc` JSON fields) |
| Deployment | Docker (Node 20), AWS App Runner (Hasura at us-west-2), serverless/AWS Lambda (web) |
| Email | Nodemailer via SMTP; templates stored in DB (`EmailTemplate` table) |
| AI backend | External microservice at `NEXT_PUBLIC_AIAPI_BASE_URL` / `alphams.snowkap.com` |

---

## Monorepo Structure

```
warp/
├── apps/
│   ├── hasura/          # Hasura GraphQL engine config, migrations, metadata
│   └── web/             # Next.js frontend + all API routes (the main app)
├── packages/
│   ├── client/          # React components, features, hooks — consumed only by web
│   ├── configs/         # Shared environment-reading config functions
│   ├── eslint-config-custom/  # Shared ESLint rules
│   ├── graphql/         # GraphQL operations (.gql files) + code-generated SDK and types
│   ├── secrets/         # AWS Secrets Manager loader (runs at Next.js server boot)
│   ├── server/          # Server-side guards, services (S3, email, score calc) — Node only
│   ├── shared/          # Constants, types, utilities safe for client + server
│   └── tsconfig/        # Shared tsconfig.json base files
└── workflows/
    └── form-submission-workflow.v2.txt   # Process spec for post-submission flow
```

### What goes in each location

- **`apps/web/pages/`** — Next.js pages (UI routes) and `pages/api/` (API routes, all serverless)
- **`packages/client/`** — All React components, feature modules, hooks; imports `@warp/graphql`, `@warp/shared`, `@warp/configs`
- **`packages/server/`** — Services called only from API routes (S3, nodemailer, score calculation); never imported by client-side code
- **`packages/graphql/`** — Single source of truth for all GQL operations; codegen produces `generated/types.ts`, `generated/server.ts` (graphql-request SDK for server use), `generated/sdk.ts` (Apollo hooks for client use)
- **`packages/shared/`** — Pure TypeScript: constants (roles, statuses), utility functions, auth helpers; safe to use anywhere
- **`packages/configs/`** — Thin wrappers around `process.env` variables (GraphQL URL, S3 bucket, NextAuth secret, etc.)
- **`packages/secrets/`** — On server boot (`instrumentation.ts`), loads all env vars from AWS Secrets Manager and merges into `process.env`

---

## Database Layer: Hasura GraphQL Engine over PostgreSQL

Hasura connects to PostgreSQL and exposes an auto-generated GraphQL API with:

- **Relationships** declared in YAML metadata (object and array relationships between tables)
- **Row-level permissions** per Hasura role, evaluated against JWT claims embedded in the request
- **Computed fields** (e.g., `json_tags` on Form/Section/Question — converts PostgreSQL `text[]` to JSONB for GraphQL compatibility)
- **Event triggers** on User and Company tables that POST to `https://alphams.snowkap.com/api/warp/webhook/...` whenever rows are inserted, updated, or deleted — this keeps the AI microservice in sync

Hasura endpoint (production): `https://e9jbguzixb.us-west-2.awsapprunner.com`
GraphQL API URL (from env): `NEXT_PUBLIC_GRAPHQL_API_URL` (default: `https://2bcfdg2um2.ap-south-1.awsapprunner.com/v1/graphql`)

The web app's API routes call Hasura using the **admin secret** (server-to-server) via `@warp/graphql/generated/server`'s `sdk` object. The browser-side Apollo Client sends the user's JWT in the Authorization header.

---

## Auth Model

### JWT Claims

Every authenticated request carries a JWT with Hasura-namespace claims:

```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["Creator", "Inviter", "Invitee", "Approver", "Analytics"],
    "x-hasura-default-role": "<user's active role>",
    "x-hasura-role": "<active role>",
    "x-hasura-user-id": "<uuid>",
    "x-hasura-user-email": "<email>",
    "x-hasura-platform-id": "<uuid>",
    "x-hasura-company-id": "<uuid>",
    "x-user-ai-details": { "isUserAI": "true/false", "aiPlanDetails": [...] }
  }
}
```

### Roles (defined in `AppRoles` constant and Hasura metadata)

| Role | Who | What they can do |
|---|---|---|
| `Platform` | Platform admin (Snowkap staff) | Full CRUD on Companies, Users, Platform settings; can update Platform row itself |
| `Creator` | Inviter company admin creating forms | Insert/update Forms, Sections, Questions, FormFields, FormDetails; read own platform data |
| `Inviter` | Staff at the parent company sending invitations | Insert FormInvitations to child companies; read child company data |
| `Invitee` | Staff at the portfolio/investee company | Fill out forms (insert/update Answers for their own submission); read only their company's data |
| `Approver` | Reviewer at the parent company | Insert/update FormSubmissions and Answers for child companies; approve submissions |
| `Analytics` | Read-only analyst | Select on most tables filtered to platform scope |
| `Consultant` | Third-party consultant (referenced in code, not in migrations yet) | — |
| `Responder` | Assigned question responder (referenced in code) | — |

### Row-Level Security Pattern

All Hasura permissions use claim variables to enforce multi-tenancy. Example on `Company.select`:
- `Inviter`: sees companies where `platformId = x-hasura-platform-id AND (id = x-hasura-company-id OR parentCompanyId = x-hasura-company-id)`
- `Invitee`: sees only their own company (`id = x-hasura-company-id AND platformId = x-hasura-platform-id`)
- `Platform`: sees all companies where `platformId = x-hasura-platform-id`

### Login Flow

The `/api/v1/platform/auth/signin` API route:
1. Validates email/password against the `User` table (password stored encrypted via `encryptionDecryption` hook)
2. Looks up the user's `UserRole`, `Company`, `Platform`, and AI subscriptions via Hasura (admin secret)
3. Builds Hasura JWT claims via `buildHasuraClaims()`
4. Signs and returns a JWT; the client stores it and sends it with every subsequent request

---

## Data Flow: Form → FormSubmission → Answer Pipeline

```
Platform (tenant)
  └─ Company (parent/portfolio company)
       └─ FormInvitation  ─── Form
            │                   └─ Section (hierarchical, sectionId self-ref)
            │                        └─ Question (parentQuestionId self-ref)
            │                             └─ FormField (UI field definition)
            └─ FormSubmission
                 └─ Answer (one per FormField per FormSubmission)
                      └─ AnswerFile (uploaded attachments)
                 └─ FormResult (score per section/question per submission)
```

### Step-by-step

1. **Form definition**: A `Form` contains `Sections` → `Questions` → `FormFields`. Each `FormField` carries `field`, `type`, `interface`, `fieldOptions`, `displayRules`, `validationRules`, and optionally `recommendationCalc` (JSONata expression for generating recommendations).

2. **Invitation**: An `Inviter`-role user creates a `FormInvitation` linking a `Form` to a target `Company` with a date range (`durationFrom`/`durationTo`) and email. Status starts as `Draft` → `Invited`.

3. **Submission creation**: An `Invitee` user opens the form and a `FormSubmission` row is created (status `New`), linked to the `FormInvitation`.

4. **Answer saving**: As the user fills the form, `POST /api/saveAnswers` is called. This calls `@warp/server/services/save-Answers/saveAnswers.ts` which upserts `Answer` rows (one per `FormField` per `FormSubmission`) and handles interim answer logic for re-opened submissions.

5. **Form submit**: `POST /api/submit-form` updates `FormSubmission.status = "Submitted"` and `FormInvitation.status = "Submitted"`.

6. **Post-submission processing** (`POST /api/v1/internal/post-form-submission`):
   - Calls `processScoreCalculation()` — evaluates JSONata `calc` expressions on each Section/Question, writes scores to `FormResult`
   - Calls `processProgressReportScore()` — calculates `InterimFormLogs` progress report
   - Generates recommendations from `recommendationCalc` JSONata → writes `Interim_Recommendation` rows
   - Sends confirmation email
   - Updates `FormInvitation.status = "Approved"` or other terminal state

7. **Approval**: An `Approver`-role user can update `FormSubmission.approvedBy` and change status to `Approved`. This triggers re-scoring.

---

## How WARP Connects to OPs (GHG Calculator)

OPs is a separate sister platform (the GHG/emissions calculator). WARP integrates with it in two ways:

### 1. Company Eligibility Check
`GET /api/v1/ops/check-company-eligibility?companyId=<uuid>` calls the OPs PRO API (`NEXT_PUBLIC_PRO_API_URL`) to verify whether a company has a valid `OPSCompanyId`. Used by `canEnableOPSToIQCuration()` to determine whether AI can pull GHG data from OPs.

### 2. OPS-to-IQ Curation
When a company is eligible, the AI microservice performs "OPS-to-IQ curation" — it fetches emissions/GHG data from OPs and pre-fills WARP form answers. This is tracked via the `AIProcessingTypes.OPSToIQCuration` constant and `OPSToIQCurationStatus` state machine. Non-AI users can have OPS-to-IQ curation access without being "AI users" (handled separately in JWT generation; see comment in `signin.ts`).

---

## Key Architectural Decisions

### Multi-tenancy via JWT claims
Every database query is automatically scoped to `x-hasura-platform-id` and `x-hasura-company-id` from the JWT — no application-level tenant filtering needed. Misconfigured JWT = wrong data visible. This means the auth layer is load-bearing.

### JSONata as formula engine
`Form.calc`, `Section.calc`, `Question.calc`, and `FormField.recommendationCalc` store JSONata expressions evaluated at score-calculation time. This allows no-code customization of scoring logic without code deploys. Errors in these expressions silently fail or throw at runtime.

### Interim Answer pattern
When a submitted form is re-opened (e.g., by an Approver requesting changes), answers are written to `Interim_Answer` (a shadow table, not in the base migrations but referenced in code and indexes). The original `Answer` rows are preserved. On re-submission, interim answers are promoted. This preserves audit history.

### AWS Secrets Manager at boot
The `instrumentation.ts` hook (Next.js 14 experimental feature) loads all secrets from AWS Secrets Manager before any request is served. Secrets not already in `process.env` are merged in. If AWS SM is unreachable, the server refuses to start (fail-fast).

### Event triggers as integration bus
User and Company CRUD changes fire Hasura event triggers to `alphams.snowkap.com/api/warp/webhook/...` with an `Authorization: EzqUt3IXQxidMdRA` header. This keeps the AI microservice's user/company registry in sync without a message broker.

### CompanyForm as explicit many-to-many
Rather than relying on FormInvitation to imply which forms a company has access to, a `CompanyForm` join table explicitly grants a Company access to a Form. Hasura permission filters traverse this relationship to scope Form/Section/Question/FormField visibility.

### Self-referential hierarchies
Both `Section` (via `sectionId`) and `Question` (via `parentQuestionId`) are self-referential trees. The score calculation code (`progress-report-score.ts`) builds a tree via `calcTreeChildren()` before evaluating weighted scores bottom-up.

### [QA] Typo in migration column name
Migration `1663741190565` added column `compnayId` (note the transposition). The very next migration `1663741346908` renames it to `companyId`. The FK constraint name `User_compnayId_fkey` retains the typo and remains in the database. No functional impact, but confusing when reading `\d User` in psql.

### [QA] EmailConfig vs EmailConfiguration table name confusion
Migration `1663942570944` creates `EmailConfig`, then `1663942604348` immediately renames it to `EmailConfiguration`. Both table names appear in Hasura metadata YAML, which has separate (duplicate) entries for `EmailConfig` and `EmailConfiguration`. The metadata references should be consolidated.

### [QA] FormResult missing `recommendations` column in migrations
Migration `1669625513767` renames `recommendation` to `recommendations` on `FormResult`, but this column is not created in the original `1663756305853` migration (which only has `id`, `submissionId`, `sectionId`, `questionId`, `score`). The rename migration will fail unless the column was added outside version control.
