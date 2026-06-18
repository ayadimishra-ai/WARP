# Snowkap WARP — Complete Technical Documentation

> **Scope of this document**: This covers the `apps/hasura` backend layer and root-level configuration present in the repository. The full monorepo also includes `apps/web`, `packages/client`, `packages/graphql`, `packages/server`, `packages/shared`, `packages/configs`, and `packages/secrets` — those layers are described architecturally below but their source files are in the broader monorepo.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Architecture](#2-monorepo-architecture)
3. [Root-Level Files](#3-root-level-files)
4. [Hasura Application (`apps/hasura`)](#4-hasura-application-appshasura)
   - [Config & Local Dev Setup](#41-config--local-dev-setup)
   - [Metadata Layer](#42-metadata-layer)
   - [Database Migrations (Schema Evolution)](#43-database-migrations-schema-evolution)
5. [Full Database Schema](#5-full-database-schema)
   - [Entity Reference](#51-entity-reference)
   - [Entity Relationship Diagram (text)](#52-entity-relationship-diagram-text)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
   - [Roles Overview](#61-roles-overview)
   - [Per-Table Permission Matrix](#62-per-table-permission-matrix)
7. [Event Triggers & Webhooks](#7-event-triggers--webhooks)
8. [Computed Fields & Database Functions](#8-computed-fields--database-functions)
9. [Data Flow: End-to-End Journeys](#9-data-flow-end-to-end-journeys)
   - [Form Creation Journey](#91-form-creation-journey)
   - [Invitation & Submission Journey](#92-invitation--submission-journey)
   - [Authentication & Session Flow](#93-authentication--session-flow)
10. [Frontend Architecture (packages reference)](#10-frontend-architecture-packages-reference)
    - [GraphQL Code Generation](#101-graphql-code-generation)
    - [Authentication Guard Pattern](#102-authentication-guard-pattern)
    - [Clean Architecture (v2 Feature Standard)](#103-clean-architecture-v2-feature-standard)
    - [Apollo Client Usage](#104-apollo-client-usage)
    - [Infinite Scroll Pattern](#105-infinite-scroll-pattern)
11. [Environment Variables](#11-environment-variables)
12. [Development Scripts](#12-development-scripts)
13. [Docker & Deployment](#13-docker--deployment)
14. [Component–Data Contribution Map](#14-component-data-contribution-map)

---

## 1. Project Overview

**Snowkap WARP** is an ESG (Environmental, Social, Governance) assessment platform. It is served **embedded** inside client platforms via iframe. Client platforms ("Platforms") register with Snowkap, their companies ("Companies") are enrolled, and users within those companies are invited to fill out structured ESG assessment forms.

**Core capabilities:**
- Multi-tenant: one WARP instance serves many client Platforms
- Form builder: hierarchical Forms → Sections → Questions
- Invitation system: Inviter companies send forms to Invitee companies
- Submission workflow: fill → submit → approve
- File attachments on answers
- Scoring: computed FormResults per question and section
- Email notifications with per-platform/company templates
- Webhook sync to external microservice (`alphams.snowkap.com`)

**Technology stack (full monorepo):**

| Layer | Technology |
|---|---|
| Frontend | Next.js Pages Router, TypeScript |
| State | Apollo Client (GraphQL), React hooks |
| UI | Mantine v5, Emotion CSS-in-JS |
| GraphQL API | Hasura GraphQL Engine v2.10 |
| Database | PostgreSQL 12 |
| Auth | NextAuth.js + JWT, embedded via `?accessToken=` |
| Build system | Turborepo + Yarn workspaces |
| Secrets | AWS Secrets Manager |
| File storage | AWS S3 |
| Container | Docker (Node 20) |

---

## 2. Monorepo Architecture

```
warp/                              ← repo root
├── apps/
│   ├── web/                       ← Next.js frontend (Pages Router)
│   └── hasura/                    ← Hasura backend (metadata + migrations)
├── packages/
│   ├── client/                    ← Shared React components, hooks, features
│   ├── graphql/                   ← GQL queries/mutations + codegen config
│   ├── server/                    ← SSR guards, server-side utilities
│   ├── shared/                    ← Types, constants, validation
│   ├── configs/                   ← API, email, S3, NextAuth config modules
│   └── secrets/                   ← AWS Secrets Manager integration
├── Dockerfile
├── .eslintrc.js
├── turbo.json                     ← pipeline config (not in zip)
└── package.json                   ← workspace root (not in zip)
```

The monorepo uses **Turborepo** for orchestrated builds and **Yarn workspaces** for package linking. Packages import each other via workspace aliases (`@warp/graphql`, `@warp/client`, etc.).

---

## 3. Root-Level Files

### `.eslintrc.js`

**What it is:** Root ESLint configuration for the entire monorepo.

**What it does:** Sets `root: true` to stop ESLint from searching parent directories, extends the `custom` ESLint config (defined in `packages/eslint-config-custom`), and tells the `eslint-plugin-next` where to find Next.js apps (`apps/*/`).

**Inputs:** None at runtime. Consumed by `yarn lint`.
**Outputs:** Linting errors/warnings across all packages.

```js
module.exports = {
  root: true,
  extends: ["custom"],
  settings: {
    next: { rootDir: ["apps/*/"] },
  },
};
```

---

### `Dockerfile`

**What it is:** Production container build definition.

**What it does:**
1. Starts from `node:20`
2. Copies the entire monorepo into `/usr/src/app`
3. Runs `yarn install` at root (installs all workspace dependencies)
4. Changes into `apps/web` and runs `yarn run build` (Next.js production build)
5. Exposes port `3000`
6. Default CMD: `yarn run start` (serves the Next.js app)

**Input:** Source code, `yarn.lock`.
**Output:** A running Next.js server on `:3000`.

**Note:** The Dockerfile does not build Hasura — Hasura runs as a separate service (in production, on AWS App Runner at `https://e9jbguzixb.us-west-2.awsapprunner.com`).

---

### `README.md`

**What it is:** Developer quick-reference for scripts.

| Script | Command | What it does |
|---|---|---|
| Run Hasura console | `yarn dev:hasura` | Opens Hasura console (port 9695) |
| Run Directus | `yarn dev:directus` | Starts Directus CMS app |
| Run web app | `yarn dev:web` | Starts Next.js dev server (port 3000) |
| GraphQL codegen | `yarn codegen` | Generates TypeScript types from `.gql` files |
| Lint | `yarn lint` | ESLint across all packages |
| Format | `yarn format` | Prettier across all packages |
| Build | `yarn build` | Production build of web app |

---

### `TURBO_README.md`

**What it is:** Default Turborepo starter documentation — explains how Turborepo pipelines, caching, and remote caching work. Not WARP-specific.

---

### `.github/copilot-instructions.md`

**What it is:** The primary **living architectural specification** for the project. Written for AI coding agents but serves as the canonical architecture reference.

**Contents summary:**
- Full monorepo structure description
- Technology stack
- Critical patterns: codegen, auth guard, clean architecture, package aliases
- Development workflow
- Apollo Client usage patterns (server-side vs. client-side)
- Infinite scroll implementation for chat feature
- Document Repository V2 clean architecture standard
- Environment variable reference
- Key file reference

This file is the **go-to document** before making any architectural decision.

---

### `.vscode/settings.json` & `.vscode/extensions.json`

**What they are:** VS Code workspace settings for consistent developer experience across the team. `extensions.json` recommends relevant extensions; `settings.json` configures editor behavior (formatting, TypeScript, etc.).

---

## 4. Hasura Application (`apps/hasura`)

Hasura is the GraphQL API layer. It connects to PostgreSQL and auto-generates a GraphQL schema from the database schema. Migrations manage schema changes; metadata manages permissions, relationships, event triggers, and computed fields.

### 4.1 Config & Local Dev Setup

#### `apps/hasura/config.yaml`

**What it is:** Hasura CLI configuration.

```yaml
version: 3
endpoint: https://e9jbguzixb.us-west-2.awsapprunner.com  # production endpoint
metadata_directory: metadata
actions:
  kind: synchronous
  handler_webhook_baseurl: http://localhost:3000           # local action handler
```

**Inputs:** Used by `hasura` CLI commands (`hasura migrate apply`, `hasura metadata apply`, etc.).
**Outputs:** CLI directs API calls to the configured endpoint.

**Note:** The production endpoint is AWS App Runner. For local dev, you override with `--endpoint http://localhost:8080`.

---

#### `apps/hasura/docker-compose.yaml`

**What it is:** Local development Docker Compose stack.

**Services:**

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | postgres:12 | 5432 | Local database |
| `graphql-engine` | hasura/graphql-engine:v2.10.0.cli-migrations-v3 | 8080 | GraphQL API + auto-applies migrations |

**What it does:**
- Postgres stores data in a named volume `db_data` (persists across restarts)
- Hasura uses `cli-migrations-v3` image — it **automatically applies migrations and metadata** on startup from the mounted volumes
- Admin secret is `mylocaladminsecretkey` (for local only)
- Dev mode enabled: exposes query logs, disables production hardening

**Input:** `./migrations` and `./metadata` directories (mounted as volumes).
**Output:** Running GraphQL API at `http://localhost:8080/v1/graphql`.

---

#### `apps/hasura/README.md`

Quick summary of the Docker Compose setup and scripts:

| Script | What it does |
|---|---|
| `start:docker` | `docker-compose up` |
| `stop:docker` | `docker-compose down` |
| `start:hasura` | Starts Hasura console at port 5000 |

---

### 4.2 Metadata Layer

The `metadata/` directory is the Hasura configuration-as-code layer. It defines everything that isn't the raw schema — permissions, relationships, computed fields, event triggers, API limits, etc.

#### `metadata/version.yaml`

Declares metadata format version. Required by Hasura CLI.

#### `metadata/databases/databases.yaml`

```yaml
- name: default
  kind: postgres
  configuration:
    connection_info:
      database_url:
        from_env: HASURA_GRAPHQL_DATABASE_URL   # ← never hardcoded
      isolation_level: read-committed
      pool_settings:
        connection_lifetime: 600
        idle_timeout: 180
        max_connections: 50
        retries: 1
      use_prepared_statements: true
  tables: "!include default/tables/tables.yaml"
```

**What it does:** Registers the Postgres database with Hasura. DB URL is injected from environment — not stored in code. Connection pool is configured for production workloads (50 max connections, prepared statements).

**Inputs:** `HASURA_GRAPHQL_DATABASE_URL` env var at Hasura startup.
**Outputs:** Hasura connects to Postgres and exposes its tables via GraphQL.

---

#### `metadata/actions.yaml` & `metadata/actions.graphql`

Both are empty. No custom Hasura actions (custom mutations with external HTTP handlers) are defined. All mutations are handled directly by Hasura's auto-generated CRUD or via webhooks/event triggers.

---

#### `metadata/allow_list.yaml`, `metadata/api_limits.yaml`, `metadata/cron_triggers.yaml`, `metadata/rest_endpoints.yaml`, `metadata/query_collections.yaml`, `metadata/remote_schemas.yaml`, `metadata/inherited_roles.yaml`

All currently empty (`[]`). Future extensibility points:
- `allow_list.yaml` — restrict which operations are allowed in production
- `api_limits.yaml` — rate limiting per role
- `cron_triggers.yaml` — scheduled background tasks
- `rest_endpoints.yaml` — REST wrappers around GraphQL queries
- `remote_schemas.yaml` — federate external GraphQL APIs into Hasura
- `inherited_roles.yaml` — role hierarchy (one role inheriting permissions from another)

---

#### `metadata/databases/default/tables/tables.yaml`

Manifest file that imports all table metadata files:

```yaml
- "!include public_Answer.yaml"
- "!include public_AnswerFile.yaml"
- "!include public_Company.yaml"
# ... 20 tables total
```

Each `public_[Table].yaml` file defines relationships and permissions for one table.

---

### 4.3 Database Migrations (Schema Evolution)

Migrations live in `migrations/default/`. Each directory is named `{unix_timestamp}_{description}` and contains `up.sql` (apply) and `down.sql` (rollback).

The `cli-migrations-v3` Docker image auto-applies all pending migrations on startup. In production, migrations are applied via `hasura migrate apply`.

**Chronological migration history:**

| # | Timestamp | Migration | What it adds |
|---|---|---|---|
| 1 | 1663739678179 | `create_table_public_Platform` | Platform table + `set_current_timestamp_updated_at` trigger function + `pgcrypto` extension |
| 2 | 1663739903859 | `create_table_public_Role` | Role table |
| 3 | 1663739929536 | `alter_table_public_Role_add_unique_name` | Unique constraint on `Role.name` |
| 4 | 1663740304697 | `create_table_public_User` | User table with FK to Platform |
| 5 | 1663740980689 | `create_table_public_Company` | Company table |
| 6 | 1663741146225 | `alter_table_public_User_alter_column_platformId` | Makes `platformId` nullable on User |
| 7 | 1663741190565 | `alter_table_public_User_add_column_compnayId` | Adds `compnayId` (typo) column |
| 8 | 1663741237220 | `set_fk_public_User_compnayId` | FK from User.compnayId → Company.id |
| 9 | 1663741346908 | `alter_table_public_User_alter_column_compnayId` | Renames `compnayId` → `companyId` |
| 10 | 1663741609376 | `create_table_public_Form` | Form table |
| 11 | 1663742229707 | `create_table_public_Section` | Section table with FK to Form and self-ref FK |
| 12 | 1663742271480 | `set_fk_public_Section_sectionId` | Self-referential FK: Section.sectionId → Section.id |
| 13 | 1663742487185 | `create_table_public_Question` | Question table with FK to Section |
| 14 | 1663743207753 | `create_table_public_FormField` | FormField junction table |

**Common pattern across all migrations:**
1. Create table with `gen_random_uuid()` default for primary key
2. Create/replace `set_current_timestamp_updated_at()` trigger function
3. Attach `BEFORE UPDATE` trigger to auto-set `updated_at`
4. Ensure `pgcrypto` extension exists (for `gen_random_uuid()`)

---

## 5. Full Database Schema

### 5.1 Entity Reference

#### `Platform`
**Purpose:** Represents a client integration platform (a "tenant"). Each client that embeds WARP has a Platform record.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Auto-generated |
| `name` | text | Platform display name |
| `origin` | text | Allowed origin URL(s) for iframe embedding |
| `apiKey` | text | API key for platform-level auth |
| `isActive` | boolean | Soft disable toggle |
| `expiry` | timestamptz | Platform subscription expiry |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated via trigger |

**Computed field:** `json_origin` — calls `fn_parse_platform_origin_to_jsonb()` to parse origin text into a JSONB array, enabling JSON querying of allowed origins.

**Relationships (array):** `Companies`, `EmailConfigs`, `EmailTemplates`, `GlobalMasters`

**Contribution:** Root tenant entity — every piece of data is scoped to a Platform via `x-hasura-platform-id` in JWT claims.

---

#### `Company`
**Purpose:** A company enrolled in WARP. Can be a top-level company (the "Inviter") or a subsidiary/supplier ("Invitee"). Self-referential via `parentCompanyId`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text UNIQUE | |
| `primaryContact` | jsonb | Contact details JSON |
| `details` | jsonb | Arbitrary metadata |
| `isActive` | boolean | |
| `country` | text | |
| `platformId` | uuid FK→Platform | |
| `parentCompanyId` | uuid FK→Company | Self-ref for hierarchy |
| `created_by` / `updated_by` | uuid | Audit trail |
| `created_at` / `updated_at` | timestamptz | |

**Relationships (object):** `ParentCompany`, `Platform`
**Relationships (array):** `ChildCompanies`, `CompanyForms`, `EmailTemplates`, `FormInvitations`, `Users`

**Event trigger:** `ManageCompany` — fires on ALL insert/update/delete operations → POST to `https://alphams.snowkap.com/api/warp/webhook/company/manage` with the event body (transformed via Kriti template to just `$body.event`).

**Contribution:** Central multi-tenancy and hierarchy entity. The parent/child company model enables "Inviter sends form to Invitee" patterns.

---

#### `User`
**Purpose:** A person who logs into WARP, associated with a Company.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `email` | text | |
| `emailVerified` | timestamptz | |
| `phone` | text | |
| `phoneVerified` | timestamptz | |
| `image` | text | Avatar URL |
| `details` | jsonb | Arbitrary user metadata |
| `isActive` | boolean | |
| `companyId` | uuid FK→Company | |
| `created_by` / `updated_by` | uuid | |
| `created_at` / `updated_at` | timestamptz | |

**Note:** `platformId` was the original FK, later made nullable when `companyId` was added. Users are now scoped to a Company (which itself is scoped to a Platform).

**Relationships (object):** `Company`
**Relationships (array):** `FormSubmissions` (submitted), `FormSubmissionsApproved` (approved), `UserRoles`

**Event triggers:** Three triggers — `ManageUser_Insert`, `ManageUser_Update`, `ManageUser_Delete` — all POST to `https://alphams.snowkap.com/api/warp/webhook/user/manage`.

**Contribution:** Authentication principal. The JWT session carries `x-hasura-user-id` and `x-hasura-company-id` which drive all row-level security filters.

---

#### `Role`
**Purpose:** Named permission role. Rows define the roles that exist (Analytics, Approver, Creator, Invitee, Inviter, Platform).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | text UNIQUE | Role name (used as string FK) |
| `description` | text | |
| `created_at` / `updated_at` | timestamptz | |

**Primary key:** Composite `(id, name)`.

**Relationships (array):** `UserRoles`

**Contribution:** Defines the set of valid roles. The `name` column is the foreign key used in `UserRole.roleName`.

---

#### `UserRole`
**Purpose:** Many-to-many join between User and Role. A user can have multiple roles.

| Column | Type | Notes |
|---|---|---|
| `userId` | uuid FK→User | |
| `roleName` | text FK→Role.name | |

**Relationships (object):** `Role`, `User`

**Contribution:** At query time, Hasura reads the user's role from the JWT claim `x-hasura-role` to enforce permissions. This table allows checking that the JWT-claimed role is valid for the user.

---

#### `Form`
**Purpose:** An ESG assessment form template. Defines the structure and metadata of an assessment.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text UNIQUE | System name |
| `title` | text | Display title |
| `description` | text | |
| `type` | text | Form category/type |
| `tags` | text[] | Array of tags for filtering |
| `calc` | jsonb | Calculation/scoring configuration |
| `created_at` / `updated_at` | timestamptz | |

**Computed field:** `json_tags` — calls `fn_parse_form_tags_to_jsonb()` to convert the `text[]` array into JSONB for richer querying.

**Relationships (object):** `Details` (one-to-one FormDetails, via FK on FormDetails side)
**Relationships (array):** `CompanyForms`, `FormFields`, `FormInvitations`, `FormsIds` (GroupForm.formId), `GroupForms` (GroupForm.groupFormId), `Sections`

**Contribution:** The master template for an assessment. Forms are assigned to Companies via `CompanyForm`, then invited via `FormInvitation`.

---

#### `FormDetails`
**Purpose:** Extended metadata for a Form — one-to-one relationship (FK is on this side).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `formId` | uuid FK→Form | |
| `timeInMinutes` | int | Estimated completion time |
| `focusArea` | text | ESG focus area |
| `notes` | text | Additional notes |
| `bodyTemplate` | text | Email body template for this form |
| `framework` | text | ESG framework (GRI, SASB, etc.) |

**Relationships (object):** `Form`

**Contribution:** Keeps extended display/configuration data separate from the core Form to keep the Form table lean. Accessed via `Form.Details`.

---

#### `Section`
**Purpose:** A section within a Form. Sections are hierarchical (a section can have a parent section via `sectionId`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `key` | text | Section identifier key |
| `content` | text | Section title/content |
| `tags` | text[] | |
| `weightage` | numeric(10,2) | Scoring weight |
| `calc` | jsonb | Calculation configuration |
| `sectionId` | uuid FK→Section | Parent section (nullable for top-level) |
| `formId` | uuid FK→Form | |
| `created_at` / `updated_at` | timestamptz | |

**Note:** On creation, `sectionId` was `NOT NULL`. The migration added a self-referential FK. In practice the metadata treats it as optional for top-level sections.

**Computed field:** `json_tags` — calls `fn_parse_section_tags_to_jsonb()`.

**Relationships (object):** `Form`, `ParentSection`
**Relationships (array):** `ChildSections`, `FormFields`, `FormResults`, `Questions`

**Contribution:** Organises questions into logical groupings. Scoring is computed per section via `FormResult`. The tree structure (via `sectionId`) supports multi-level section hierarchies.

---

#### `Question`
**Purpose:** An individual question within a Section.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `key` | text | Question identifier |
| `content` | text | Question text |
| `tags` | text[] | |
| `weightage` | numeric(10,2) | Scoring weight |
| `calc` | jsonb | Scoring calculation config |
| `sectionId` | uuid FK→Section | |
| `parentQuestionId` | uuid | FK to parent Question (sub-questions) |
| `created_at` / `updated_at` | timestamptz | |

**Computed field:** `json_tags` — calls `fn_parse_question_tags_to_jsonb()`.

**Relationships (object):** `Section`
**Relationships (array):** `Answers`, `FormFields`, `FormResults`

**Contribution:** The atomic unit of assessment content. A question exists in the question library (scoped to a section/form via CompanyForm ownership). The `parentQuestionId` supports conditional/nested questions.

---

#### `FormField`
**Purpose:** The configuration layer that maps a Question to a Form with display/UX settings. Acts as the bridge between the question library and a specific form's UX.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `formId` | uuid FK→Form | |
| `sectionId` | uuid FK→Section | |
| `questionId` | uuid FK→Question | |
| `seqIndex` | int | Display order |
| `field` | text | Field name/key |
| `type` | text | Input type (text, number, select, etc.) |
| `interface` | text | UI component identifier |
| `groupField` | text | For grouped field sets |
| `display` | jsonb | Display configuration |
| `displayOptions` | jsonb | Options for display variants |
| `displayRules` | jsonb | Conditional display rules |
| `fieldOptions` | jsonb | Input field options (e.g. dropdown choices) |
| `interfaceOptions` | jsonb | UI component configuration |
| `validationRules` | jsonb | Client/server validation rules |
| `created_at` / `updated_at` | timestamptz | |

**Relationships (object):** `Form`, `Question`, `Section`
**Relationships (array):** `Answers`

**Contribution:** Separates *what to ask* (Question) from *how to present it* (FormField). This allows the same question to appear in different forms with different UI configurations without duplicating the question content.

---

#### `CompanyForm`
**Purpose:** Many-to-many join: which Forms are assigned/available to which Companies.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `companyId` | uuid FK→Company | |
| `formId` | uuid FK→Form | |

**Relationships (object):** `Company`, `Form`

**Contribution:** Controls form access and ownership. When checking permissions in Hasura, many filters traverse `CompanyForms → Company → platformId` to enforce tenant isolation. A Creator inserts a form and links it to their company via this table.

---

#### `FormInvitation`
**Purpose:** An invitation for a Company to submit a specific Form. The Inviter company sends this to an Invitee company.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `formId` | uuid FK→Form | |
| `companyId` | uuid FK→Company | The invited (Invitee) company |
| `email` | text | Invitee contact email |
| `isActive` | boolean | |
| `status` | text | Invitation status (pending/accepted/completed) |
| `durationFrom` | timestamptz | Assessment period start |
| `durationTo` | timestamptz | Assessment period end |
| `ReviewerDetails` | jsonb | Reviewer/approver metadata |
| `created_at` / `updated_at` | timestamptz | |
| `created_by` / `updated_by` | uuid | |

**Relationships (object):** `Company`, `Form`
**Relationships (array):** `FormSubmissions`

**Contribution:** The core workflow trigger. Without a `FormInvitation`, an Invitee company cannot create a `FormSubmission`. Most permission filters for Invitee/Approver roles cascade through this table.

---

#### `FormSubmission`
**Purpose:** A company's active submission in response to a FormInvitation. Contains the submission state and approval info.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `invitationId` | uuid FK→FormInvitation | |
| `isActive` | boolean | |
| `remarks` | text | Approver remarks |
| `approvedBy` | uuid FK→User | Set automatically via `x-hasura-user-id` |
| `submittedBy` | uuid FK→User | |
| `created_at` / `updated_at` | timestamptz | |

**Relationships (object):** `FormInvitation`, `ApproverUser` (User via approvedBy), `userBySubmittedby` (User via submittedBy)
**Relationships (array):** `Answers`, `FormResults`

**Contribution:** The container for all answers. Approval sets `approvedBy` automatically via Hasura's permission `set` clause (`set: { approvedBy: x-hasura-User-Id }`), preventing spoofing.

---

#### `Answer`
**Purpose:** A single answer to a single Question within a FormSubmission.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `questionId` | uuid FK→Question | |
| `submissionId` | uuid FK→FormSubmission | |
| `formFieldId` | uuid FK→FormField | The display config used |
| `data` | jsonb | The actual answer data |
| `status` | text | Answer status |
| `created_at` / `updated_at` | timestamptz | |
| `created_by` / `updated_by` | uuid | |

**Relationships (object):** `FormField`, `FormSubmission`, `Question`
**Relationships (array):** `AnswerFiles`

**Contribution:** Atomic answer storage. `data` is JSONB to accommodate any answer format (text, number, array of choices, etc.) without schema changes. Linked to `FormField` to know which display config was used.

---

#### `AnswerFile`
**Purpose:** File attachments uploaded in response to a question.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `answerId` | uuid FK→Answer | |
| `name` | text | Original filename |
| `path` | text | Storage path (S3 key) |
| `provider` | text | Storage provider (e.g. `s3`) |
| `sizeInBytes` | int | |
| `type` | text | MIME type |
| `created_at` | timestamptz | |

**Relationships (object):** `Answer`

**Contribution:** Supports evidence upload for ESG assessments. Files are stored in S3; only the metadata (path/name/type) is stored in Postgres.

---

#### `FormResult`
**Purpose:** Computed score for a question and/or section within a submission. Populated after submission scoring runs.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `submissionId` | uuid FK→FormSubmission | |
| `questionId` | uuid FK→Question | |
| `sectionId` | uuid FK→Section | |
| `score` | numeric | Computed score |

**Relationships (object):** `FormSubmission`, `Question`, `Section`

**Contribution:** Pre-computed analytics output. By storing scores at question and section level, reporting/analytics queries are fast without needing to re-run scoring calculations on every read.

---

#### `EmailTemplate`
**Purpose:** Custom email templates per Platform (and optionally per Company).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `platformId` | uuid FK→Platform | |
| `companyId` | uuid FK→Company | Optional company-specific override |
| `subject` | text | Email subject |
| `template` | text | Email body template (HTML/text) |
| `ccEmails` | text[] | CC recipients |
| `type` | text | Template type (invitation, reminder, etc.) |
| `created_at` / `updated_at` | timestamptz | |

**Relationships (object):** `Company`, `Platform`

**Contribution:** Enables per-platform and per-company email customisation without code changes.

---

#### `EmailConfiguration` / `EmailConfig`
**Purpose:** SMTP/email service configuration for a Platform.

Both tables have a FK to `Platform`. `EmailConfig` is the older table; `EmailConfiguration` appears to be the active one. They hold SMTP server credentials and settings for the platform's outbound email.

**Contribution:** Allows each Platform to send emails from their own SMTP server/identity.

---

#### `GlobalMaster`
**Purpose:** Platform-scoped key/value configuration store for reference data (dropdowns, master lists, global settings).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `platformId` | uuid FK→Platform | |
| `type` | text | Category key |
| `data` | jsonb | Configuration data |

**Relationships (object):** `Platform`

**Contribution:** Centralises shared reference data (e.g. industry lists, country codes, scoring scales) that all companies on a platform share. Read-only for most roles.

---

#### `GroupForm`
**Purpose:** Groups multiple individual Forms into a bundle/assessment suite.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `groupFormId` | uuid FK→Form | The parent "group" Form |
| `formId` | uuid FK→Form | A child Form in the group |

**Relationships (object):** `Form` (via formId), `formByGroupformid` (via groupFormId)

**Contribution:** Allows sending a set of related forms as a single assessment bundle. One `Form` record acts as the group container; individual forms are linked to it via this table.

---

### 5.2 Entity Relationship Diagram (text)

```
Platform
  │
  ├─── Company (platformId) ──── [self-ref: parentCompanyId]
  │       │
  │       ├─── User (companyId)
  │       │       └─── UserRole (userId) ──── Role (roleName)
  │       │
  │       ├─── CompanyForm (companyId) ──── Form (formId)
  │       │                                   │
  │       │                         ┌──────────┴─────────────┐
  │       │                      Section (formId)         FormDetails (formId)
  │       │                    [self-ref: sectionId]      FormField (formId)
  │       │                         │                     GroupForm (formId/groupFormId)
  │       │                      Question (sectionId)
  │       │                    [self-ref: parentQuestionId]
  │       │                         │
  │       │                      FormField (questionId, sectionId, formId)
  │       │
  │       ├─── FormInvitation (companyId) ──── Form (formId)
  │       │       │
  │       │       └─── FormSubmission (invitationId)
  │       │               ├─── Answer (submissionId) ──── Question (questionId)
  │       │               │       └─── AnswerFile (answerId)  FormField (formFieldId)
  │       │               └─── FormResult (submissionId) ──── Question/Section
  │       │
  │       └─── EmailTemplate (companyId)
  │
  ├─── EmailConfiguration (platformId)
  ├─── EmailTemplate (platformId)
  └─── GlobalMaster (platformId)
```

---

## 6. Role-Based Access Control (RBAC)

### 6.1 Roles Overview

WARP uses Hasura's row-level security model. The JWT token carries Hasura claims (`x-hasura-role`, `x-hasura-user-id`, `x-hasura-company-id`, `x-hasura-platform-id`) and Hasura enforces per-row filters automatically.

| Role | Who uses it | Core capability |
|---|---|---|
| `Platform` | Platform admin accounts | Full read/write within their platform. Can create/update Companies, manage Platform config. |
| `Creator` | Form designers at parent company | Can create and manage Forms, Sections, Questions, FormFields, assign forms to companies. |
| `Inviter` | Parent company users who send invitations | Can create/update FormInvitations to child companies. Read access to child company data. |
| `Approver` | Parent company reviewers | Can view and approve submissions from child companies. Can insert/update Answers and FormSubmissions. |
| `Invitee` | Invited (child) company users | Can view their own invitations, create submissions, fill in answers, upload files. |
| `Analytics` | Read-only analytics/reporting users | Broad read access scoped to platform, no write access. |

**JWT claims used in filters:**

| Claim | Used for |
|---|---|
| `x-hasura-platform-id` | Tenant isolation — virtually every filter includes this |
| `x-hasura-company-id` | Company scoping — Invitee/Inviter/Approver filters |
| `x-hasura-user-id` | User self-access — User, UserRole, Role filters |
| `x-hasura-role` | Current role being used for this request |

---

### 6.2 Per-Table Permission Matrix

**Legend:** `I` = Insert, `S` = Select, `U` = Update, `D` = Delete, `—` = no permission

| Table | Analytics | Approver | Creator | Invitee | Inviter | Platform |
|---|---|---|---|---|---|---|
| Platform | S | S | S | S | S | S, U |
| Company | S | S | S | S | S | S, U |
| User | S, U | S, U | S, U | S, U | S, U | S, U |
| Role | S | S | S | S | S | S |
| UserRole | S | S | S | S | S | S |
| Form | S | S | S, I, U | S | S | S |
| FormDetails | S | S | S, I, U | S | S | S |
| Section | S | S | S, I, U | S | S | S |
| Question | S | S | S, I, U | S | S | S |
| FormField | S | S | S, I, U | S | S | S |
| CompanyForm | S | S | S, I, U | S | S | S, I, U |
| FormInvitation | S | S | S | S | S, I, U | S |
| FormSubmission | S | S, I, U | S | S, I, U | S | S |
| Answer | S | S, I, U | S | S, I, U | S | S |
| AnswerFile | S | S | S | S, I, U | S | S |
| FormResult | S | S | S | S | S | S |
| EmailTemplate | S | S | S, I, U | S | S | S |
| EmailConfiguration | — | — | — | — | — | — |
| GlobalMaster | S | S | S | S | S | S |
| GroupForm | — | — | — | — | — | — |

**Key permission patterns:**

- **Tenant isolation**: Nearly every SELECT filter includes `platformId: { _eq: x-hasura-platform-id }`.
- **Company scoping for Inviter/Approver**: filters check `parentCompanyId: { _eq: x-hasura-company-id }` — they can only see *child* companies they own.
- **Company self-access for Invitee**: filters check `id: { _eq: x-hasura-company-id }` — only their own company's data.
- **User self-access**: User table always filters by `id: { _eq: x-hasura-user-id }` — users can only read/update their own profile.
- **Auto-set fields**: Hasura `set` clauses automatically inject `approvedBy: x-hasura-User-Id` on submission approval and `updated_by: x-hasura-User-Id` on answer updates — prevents tampering.

---

## 7. Event Triggers & Webhooks

Event triggers fire HTTP webhooks when database rows change. Both triggers call the external microservice at `alphams.snowkap.com`.

### `ManageCompany` (on `Company` table)

| Attribute | Value |
|---|---|
| Fires on | INSERT, UPDATE, DELETE |
| Webhook URL | `https://alphams.snowkap.com/api/warp/webhook/company/manage` |
| Auth header | `Authorization: EzqUt3IXQxidMdRA` |
| Body transform | Kriti template: `{{$body.event}}` — sends only the event payload, not the full Hasura wrapper |
| Retry | 0 retries, 60s timeout, 10s interval |

**Purpose:** Keeps the external microservice in sync with Company data changes. The external service likely manages Company records in its own database or triggers further downstream actions (notifications, provisioning, etc.).

---

### `ManageUser_Insert` / `ManageUser_Update` / `ManageUser_Delete` (on `User` table)

Three separate triggers (one per operation type), all pointing to the same URL:

| Attribute | Value |
|---|---|
| Webhook URL | `https://alphams.snowkap.com/api/warp/webhook/user/manage` |
| Auth header | `Authorization: EzqUt3IXQxidMdRA` |
| Body transform | `{{$body.event}}` |
| Retry | 0 retries, 60s timeout, 10s interval |

**Purpose:** Keeps the external service in sync with User data changes — likely used to sync user accounts, trigger welcome emails, or provision access in the external platform.

---

## 8. Computed Fields & Database Functions

Hasura computed fields call PostgreSQL functions and expose their result as a virtual GraphQL field. Three tag-parsing functions are referenced in the metadata:

| Function | Table | Computed field name | Purpose |
|---|---|---|---|
| `fn_parse_form_tags_to_jsonb` | Form | `json_tags` | Converts `tags text[]` → JSONB |
| `fn_parse_section_tags_to_jsonb` | Section | `json_tags` | Converts `tags text[]` → JSONB |
| `fn_parse_question_tags_to_jsonb` | Question | `json_tags` | Converts `tags text[]` → JSONB |
| `fn_parse_platform_origin_to_jsonb` | Platform | `json_origin` | Converts `origin text` → JSONB |

**Why these exist:** PostgreSQL arrays (`text[]`) don't support complex GraphQL filtering. Converting them to JSONB allows Hasura to filter with `_contains`, `_has_key`, etc. on the `json_tags` computed field while still storing data as a native array.

**Input:** The row's `tags` (or `origin`) column value.
**Output:** JSONB representation exposed as `json_tags` / `json_origin` in GraphQL queries.

The functions themselves are defined in the database (not in the migration files in this export) and would live in earlier migration files or seed scripts.

---

## 9. Data Flow: End-to-End Journeys

### 9.1 Form Creation Journey

```
Creator user (parent company, Creator role)
  │
  ├── 1. INSERT Form (name, title, type, tags)
  │         └── Permission check: CompanyForms.Company.platformId = x-hasura-platform-id
  │
  ├── 2. INSERT FormDetails (formId, framework, bodyTemplate, etc.)
  │
  ├── 3. INSERT CompanyForm (companyId, formId)
  │         └── Links the form to the creator's company — enables all downstream permissions
  │
  ├── 4. INSERT Section(s) (formId, key, content, weightage)
  │         └── Can be nested via sectionId for hierarchies
  │
  ├── 5. INSERT Question(s) (sectionId, key, content, weightage, tags)
  │
  └── 6. INSERT FormField(s) (formId, sectionId, questionId, type, interface, displayRules...)
            └── Configures how each question is presented in the UI
```

**Output:** A complete Form template ready to be assigned to companies and sent out as invitations.

---

### 9.2 Invitation & Submission Journey

```
Inviter user (parent company, Inviter role)
  │
  └── 1. INSERT FormInvitation (formId, companyId, durationFrom, durationTo, email)
            └── companyId = the child/Invitee company
            └── created_by auto-set to x-hasura-User-Id

Invitee user (child company, Invitee role)
  │
  ├── 2. Query FormInvitation (filtered to their companyId and platformId)
  │
  ├── 3. INSERT FormSubmission (invitationId, submittedBy)
  │
  ├── 4. INSERT Answer(s) (submissionId, questionId, formFieldId, data)
  │         └── Files? INSERT AnswerFile(s) (answerId, path, name, type...)
  │
  └── 5. UPDATE FormSubmission (mark as submitted)

Approver user (parent company, Approver role)
  │
  ├── 6. Query FormSubmissions (child companies' submissions, filtered by parentCompanyId)
  │
  ├── 7. Review Answers (read only)
  │
  └── 8. UPDATE FormSubmission (remarks, isActive)
            └── approvedBy auto-set to x-hasura-User-Id

[Background] Scoring engine
  │
  └── 9. INSERT FormResult(s) (submissionId, questionId, sectionId, score)
            └── Triggered externally or via Hasura action (not yet defined)
```

---

### 9.3 Authentication & Session Flow

```
Client platform (3rd party)
  │
  └── 1. Embeds WARP in iframe with:
           src="https://warp.snowkap.com/embed/[page]?accessToken=JWT"

Next.js (apps/web)
  │
  ├── 2. getServerSideProps runs embeddedAuthGuard(context)
  │         └── Extracts accessToken from query params
  │         └── Validates JWT, creates NextAuth session
  │         └── Session contains: { user, company, platform, hasuraClaims }
  │
  ├── 3. Apollo Client initialised with session's hasuraClaims as headers:
  │         x-hasura-role, x-hasura-user-id, x-hasura-company-id, x-hasura-platform-id
  │
  └── 4. All GraphQL queries/mutations automatically scoped by Hasura RBAC
```

---

## 10. Frontend Architecture (packages reference)

The source code for these packages is in the full monorepo. This section documents the patterns and responsibilities.

### 10.1 GraphQL Code Generation

**Location:** `packages/graphql/codegen.js`

**How it works:**
1. `.gql` files define GraphQL operations (queries, mutations, subscriptions)
2. `yarn codegen` reads these against the Hasura schema
3. TypeScript files are generated in `queries/generated/` and `mutations/generated/`
4. Generated files export typed `Document` constants

**Convention:**

| File pattern | Generated export |
|---|---|
| `get-[entity].gql` | `Get[Entity]Document` |
| `get-[entity]-by-[filter].gql` | `Get[Entity]By[Filter]Document` |
| `insert-[entity].gql` | `Insert[Entity]Document` |
| `update-[entity].gql` | `Update[Entity]Document` |

**Rule:** Always import from generated files. Never import `.gql` files directly.

**Inputs:** `.gql` files + Hasura GraphQL schema (from endpoint).
**Outputs:** Type-safe TypeScript constants with full operation typing.

---

### 10.2 Authentication Guard Pattern

**Location:** `packages/server/guards/embedded-auth-guard.ts`

```typescript
// Every page uses this pattern
export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionProps = await embeddedAuthGuard(context);
  if ("redirect" in sessionProps) return sessionProps; // unauthenticated → redirect
  const session = sessionProps.props.session;
  // fetch data with Apollo...
  return { props: { session, ...data } };
};
```

**What it does:** Validates the `?accessToken=` JWT from the query string, establishes a NextAuth session, and returns session data as props. If invalid, returns a redirect.

**Inputs:** Next.js `GetServerSidePropsContext` (contains the URL with `?accessToken=`)
**Outputs:** `{ props: { session } }` or `{ redirect: { destination: '/auth/error' } }`

---

### 10.3 Clean Architecture (v2 Feature Standard)

For complex features. Reference implementation: `packages/client/features/document-repository-v2/`.

```
feature-name-v2/
├── domain/         Pure TypeScript business logic (no React, no side effects)
│   ├── *.types.ts  Domain model types
│   ├── *.rules.ts  Pure business rule functions
│   └── *.selectors.ts  Derived data selectors
├── server/         SSR data fetching functions (GraphQL queries, no React)
├── application/    React hooks (useState, useEffect allowed here only)
│   └── use*.ts     Custom hooks exposing { data, actions, status }
├── ui/             Memoized presentational React components (no business logic)
└── pages/          Composition only: call hooks, render components
    └── *.tsx       No useState/useEffect/GraphQL here
```

**Layer rules:**

| Layer | Allowed | Forbidden |
|---|---|---|
| `pages/` | Hook calls, JSX, `useCallback`, `useMemo` | `useEffect`, `useState`, Apollo calls, business logic |
| `ui/` | Props-driven rendering, `React.memo` | Business logic, data fetching |
| `application/` | `useState`, `useEffect`, mutations, polling | Business logic (put in domain) |
| `server/` | GraphQL queries, async functions | React imports, browser APIs |
| `domain/` | Pure TS functions, types | React imports, side effects, browser APIs |

**Data flow:** SSR in parent's `getServerSideProps` → complete data set passed as props → page layer only composes, never fetches.

---

### 10.4 Apollo Client Usage

**Initialisation:** `packages/graphql/provider/apollo-client.ts` via `initializeApollo()`

**Server-side (in `getServerSideProps`):**
```typescript
const apolloClient = initializeApollo();
const { data } = await apolloClient.query({
  query: GetFormsDocument,
  variables: { where: { companyId: { _eq: companyId } } }
});
```

**Client-side (in application hooks):**
```typescript
const { data, loading } = useQuery(GetFormsDocument, { variables: ... });
const [mutate] = useMutation(InsertAnswerDocument);
```

**Provider:** `apps/web/pages/_app.tsx` wraps the app with Apollo Provider and Mantine Provider.
---

### 10.5 Infinite Scroll Pattern

Implemented for the "Chat with Snowkap AI" feature. Two directions:

- **Messages**: scroll UP → prepend older messages (cursor = oldest message's `createdAt`)
- **Conversations**: scroll DOWN → append more conversations

**Critical implementation rules:**
1. Use database UUIDs as message IDs, never array indices (index shifts when prepending)
2. Detect *user-initiated* scroll via direction tracking (`previousScrollTop` ref), not just position
3. Auto-scroll to bottom only when the *last message ID changes* (new message), not when prepending old ones
4. Store `previousScrollHeight` before loading → restore relative position after prepend

**Pagination:** Cursor-based via `createdAt < cursor` with `order_by: [{ createdAt: desc }]`.

---

## 11. Environment Variables

Loaded from **AWS Secrets Manager** (`snowkap-warp-beta` secret, `ap-south-1` region) via `packages/secrets`.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GRAPHQL_API_URL` | Client + Server | Hasura GraphQL endpoint URL |
| `HASURA_GRAPHQL_ADMIN_SECRET` | Server only | Hasura admin bypass (for migrations/codegen) |
| `HASURA_GRAPHQL_DATABASE_URL` | Hasura service | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Server | NextAuth JWT signing secret |
| `NEXTAUTH_URL` | Server | App base URL for NextAuth callbacks |
| `S3_BUCKET_NAME` | Server | AWS S3 bucket for file uploads |
| `S3_BUCKET_REGION` | Server | S3 bucket region |
| `S3_ACCESS_KEY_ID` | Server | AWS S3 credentials |
| `S3_SECRET_ACCESS_KEY` | Server | AWS S3 credentials |
| `EMAIL_SMTP_HOST` | Server | SMTP server hostname |
| `EMAIL_SMTP_PORT` | Server | SMTP port |
| `EMAIL_SMTP_USER` | Server | SMTP authentication user |
| `EMAIL_SMTP_PASS` | Server | SMTP authentication password |

**Local dev:** Override via `.env.local` in `apps/web`. Never commit secrets.

---

## 12. Development Scripts

All run from the **monorepo root**:

| Command | What runs | Output |
|---|---|---|
| `yarn dev:hasura` | Hasura CLI console | Console UI at `http://localhost:9695` connected to Hasura at `http://localhost:8080` |
| `yarn dev:web` | Next.js dev server | App at `http://localhost:3000` with HMR |
| `yarn dev:directus` | Directus CMS app | CMS interface (separate service) |
| `yarn codegen` | GraphQL Code Generator | Updates all `*/generated/*.ts` files in `packages/graphql` |
| `yarn lint` | ESLint across all packages | Lint errors/warnings in terminal |
| `yarn format` | Prettier across all packages | Reformats all files in-place |
| `yarn build` | Next.js production build | Optimised bundle in `apps/web/.next` |

**Standard workflow for schema changes:**
1. `yarn dev:hasura` — open Hasura console
2. Make schema changes in console (creates migration files automatically)
3. Apply new metadata changes
4. `yarn codegen` — regenerate TypeScript types
5. Update frontend code to use new generated types

---

## 13. Docker & Deployment

### Local Docker (Hasura + Postgres)

```bash
cd apps/hasura
docker-compose up        # starts Postgres:5432 + Hasura:8080
docker-compose down      # stops containers
```

The `cli-migrations-v3` Hasura image auto-applies all migrations and metadata on start. No manual `hasura migrate apply` needed locally.

### Production

| Service | Platform |
|---|---|
| Hasura GraphQL Engine | AWS App Runner (`https://e9jbguzixb.us-west-2.awsapprunner.com`) |
| PostgreSQL | Managed RDS (connection via `HASURA_GRAPHQL_DATABASE_URL`) |
| Next.js web app | Containerised via `Dockerfile`, served on port 3000 |

**Dockerfile build sequence:**
```
node:20 base image
  → COPY entire monorepo
  → yarn install (all workspace deps)
  → cd apps/web && yarn run build (Next.js production build)
  → EXPOSE 3000
  → CMD: yarn run start
```

---

## 14. Component–Data Contribution Map

This maps what each file contributes to system capabilities:

| File / Component | Contributes to | Inputs | Outputs |
|---|---|---|---|
| `apps/hasura/config.yaml` | CLI tooling, deployment | CLI commands | Routes hasura CLI to correct endpoint |
| `apps/hasura/docker-compose.yaml` | Local dev environment | Docker daemon | Running Hasura + Postgres stack |
| `metadata/databases/databases.yaml` | DB connectivity | `HASURA_GRAPHQL_DATABASE_URL` env | Postgres connection with pool config |
| `metadata/databases/default/tables/tables.yaml` | Table registration | Individual YAML files | Tells Hasura which tables to manage |
| `public_Platform.yaml` | Tenant model, RBAC | Platform rows, JWT claims | Scoped GQL API for each platform |
| `public_Company.yaml` | Multi-tenant hierarchy, webhook sync | Company rows, JWT claims | Company-scoped GQL + `ManageCompany` webhook |
| `public_User.yaml` | Auth principal, webhook sync | User rows, JWT claims | User-scoped GQL + 3 `ManageUser` webhooks |
| `public_Role.yaml` + `public_UserRole.yaml` | RBAC enforcement | Role + UserRole rows | Role validation in permission filters |
| `public_Form.yaml` + `public_FormDetails.yaml` | Form templates | Creator writes, all roles read | Assessments available to platform companies |
| `public_Section.yaml` | Form structure | Creator writes | Hierarchical grouping of questions |
| `public_Question.yaml` | Assessment content | Creator writes | Question library for forms |
| `public_FormField.yaml` | UI configuration | Creator writes | Per-form question presentation rules |
| `public_CompanyForm.yaml` | Form assignment | Creator/Platform writes | Determines which forms a company can use |
| `public_FormInvitation.yaml` | Workflow initiation | Inviter writes | Triggers Invitee access to submit |
| `public_FormSubmission.yaml` | Submission state | Invitee/Approver writes | Container for answers + approval state |
| `public_Answer.yaml` | Answer storage | Invitee/Approver writes | Actual assessment response data |
| `public_AnswerFile.yaml` | Evidence upload | Invitee writes | File metadata (actual files in S3) |
| `public_FormResult.yaml` | Scoring output | Read by all, written by scoring engine | Pre-computed scores per question/section |
| `public_EmailTemplate.yaml` | Email customisation | Creator writes | Per-platform email content |
| `public_EmailConfiguration.yaml` | Email delivery | Platform config | SMTP settings for platform email |
| `public_GlobalMaster.yaml` | Reference data | Platform admin writes | Shared lookup data (dropdown options, etc.) |
| `public_GroupForm.yaml` | Form bundling | — | Groups multiple forms into an assessment suite |
| `migrations/default/*/up.sql` | Schema history | `hasura migrate apply` | Creates/alters PostgreSQL tables |
| `Dockerfile` | Production deployment | Monorepo source | Containerised Next.js app |
| `.eslintrc.js` | Code quality | Source files | Lint reports |
| `.github/copilot-instructions.md` | Developer guidance | — | Architectural patterns, rules, anti-patterns |

---

*Document generated from source: `apps/hasura/` metadata + migrations, root config files, and `.github/copilot-instructions.md` architectural specification.*