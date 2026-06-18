# WARP Database Schema

All tables live in the `public` schema of PostgreSQL 12. Every table (unless noted) has an `updated_at` trigger that calls `set_current_timestamp_updated_at()` on every UPDATE. UUIDs are generated with `gen_random_uuid()` from the `pgcrypto` extension.

---

## Migration History

| Timestamp | Migration | Notes |
|---|---|---|
| 1663739678179 | Create `Platform` | Root tenant table; also installs pgcrypto and the `set_current_timestamp_updated_at` trigger function |
| 1663739903859 | Create `Role` | App roles with composite PK (id, name) |
| 1663739929536 | Add unique constraint `Role.name` | |
| 1663740304697 | Create `User` | Initially has `platformId FK` to Platform |
| 1663740980689 | Create `Company` | |
| 1663741146225 | `User.platformId` → nullable | |
| 1663741190565 | Add `User.compnayId` [QA: typo] | Nullable UUID |
| 1663741237220 | FK `User.compnayId` → `Company.id` | Constraint name retains typo: `User_compnayId_fkey` |
| 1663741346908 | Rename `User.compnayId` → `User.companyId` | Constraint name still `User_compnayId_fkey` in DB |
| 1663741609376 | Create `Form` | |
| 1663742229707 | Create `Section` | |
| 1663742271480 | Self-referential FK `Section.sectionId` → `Section.id` | Parent section |
| 1663742487185 | Create `Question` | |
| 1663743207753 | Create `FormField` | |
| 1663743558195 | Create `FormInvitation` | |
| 1663745125758 | Add `FormInvitation.status` | Nullable text |
| 1663745271905 | Create `FormSubmission` | `submittedBy` and `approvedBy` are NOT NULL at this point |
| 1663756305853 | Create `FormResult` | No `recommendation` column at creation |
| 1663756354991–1663756428305 | FKs on `FormResult` | submissionId, sectionId, questionId |
| 1663756719369 | Create `Answer` | |
| 1663756888237 | Create `AnswerFile` | |
| 1663757772475 | Create `EmailTemplate` | |
| 1663857665964 | Create `UserRole` | Junction table for User ↔ Role |
| 1663857830360 | Rename `UserRole.Role` → `UserRole.RoleName` | |
| 1663941706160 | Add `Company.parentCompanyId` | Self-ref nullable |
| 1663941727338 | Add `Company.platformId` | |
| 1663941770077 | FK `Company.platformId` → `Platform.id` | |
| 1663941795756 | FK `Company.parentCompanyId` → `Company.id` | |
| 1663941983723 | Drop `User.platformId` cascade | Platform-level user concept replaced by company-level |
| 1663942185692 | Add `Platform.expiry` | Nullable timestamptz |
| 1663942269652 | Add `EmailTemplate.subject` | Nullable |
| 1663942293332 | Add `EmailTemplate.ccEmails` | Nullable text[] |
| 1663942570944 | Create `EmailConfig` | Immediately renamed next migration |
| 1663942604348 | Rename `EmailConfig` → `EmailConfiguration` | [QA] Both names persist in Hasura metadata |
| 1663943937165 | Rename `UserRole.RoleName` → `UserRole.roleName` | Final column name |
| 1663944025747 | Add `Answer.submissionId` | Nullable initially |
| 1663944087900 | FK `Answer.submissionId` → `FormSubmission.id` | |
| 1664176531300–1664177323007 | Add `created_by`/`updated_by` UUIDs to Company, User, Answer, FormInvitation | All nullable |
| 1664180634687 | Create `CompanyForm` | Explicit Company ↔ Form many-to-many |
| 1664184822502 | Add `Company.country` | Nullable text |
| 1664186779277 | Add `Company.isActive` | Boolean NOT NULL default true |
| 1664188233834 | Add `User.isActive` | Nullable boolean default true |
| 1664192880245 | Create `GlobalMaster` | |
| 1664206165422–1664206246782 | Add `EmailConfiguration.fromEmail` NOT NULL | |
| 1664264620561–1664264640706 | Drop and re-add `Platform.origin` as `text[]` | Was a single Text, now an array of allowed origins |
| 1664284310860 | Unique constraint on `User.email` | |
| 1664346554670 | Function `fn_parse_form_tags_to_jsonb` | Computed field helper |
| 1664347865797 | Function `fn_parse_platform_origin_to_jsonb` | |
| 1664350088197 | `Form.tags` → nullable `text[]` | |
| 1664368828308–1664368845803 | Add `FormInvitation.durationFrom`, `durationTo` | Date columns |
| 1664370295664 | Function `fn_parse_question_tags_to_jsonb` | |
| 1664370532963 | Function `fn_parse_section_tags_to_jsonb` | |
| 1664374822481–1664374837267 | `FormSubmission.submittedBy` and `approvedBy` → nullable | |
| 1664456698177 | Create `FormDetails` | One-to-one extension of Form |
| 1665026897880 | Add `Form.calc` | JSON formula for form-level score |
| 1665026986182 | Add `Question.parentQuestionId` | Self-referential for nested questions |
| 1665027217341 | FK `Question.parentQuestionId` → `Question.id` | |
| 1665633644054 | Add `Answer.status` | Default `'draft'` |
| 1669625513767 | Rename `FormResult.recommendation` → `FormResult.recommendations` | [QA] Column `recommendation` not in original CREATE |
| 1669824103603 | Add `FormField.tags` | Nullable JSONB |
| 1675430176768 | Insert seed `GlobalMaster` row | `SendSuccessEmailOnSubmissionFormList` config |
| 1741883117000 | Composite index on `Answer(questionId, submissionId)` and `Interim_Answer(questionId, submissionId)` | Performance: `Interim_Answer` table referenced but not in core migrations |
| 1741955243000 | 10 indexes on FormInvitation, FormSubmission, Section, Question, FormField, ReviewerDetailsMapping, MakerCheckerRemarks | Performance |
| chat_search_migration.sql | FTS + trigram search on `AIConversations` and `AIMessages` | Manual script, not in numbered migration sequence |

---

## Tables

### Platform

The top-level tenant. Every company and email config belongs to a platform.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | Tenant name |
| origin | text[] | nullable | Allowed CORS/origin domains (was scalar, changed to array in migration 1664264640706) |
| apiKey | text | NOT NULL | API key for platform-level calls |
| isActive | boolean | NOT NULL, default true | |
| expiry | timestamptz | nullable | Platform license expiry |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Computed field**: `json_origin` — converts `origin text[]` to JSONB via `fn_parse_platform_origin_to_jsonb`.

**Relationships**: has many Companies, EmailConfigs (EmailConfiguration), EmailTemplates, GlobalMasters.

---

### Company

Represents an organisation (either a parent/Inviter company or a portfolio/Invitee company).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL, UNIQUE | |
| primaryContact | jsonb | nullable | Contact person data |
| details | jsonb | nullable | Arbitrary extra data |
| parentCompanyId | uuid | nullable, FK → Company.id | Self-referential: child companies point to their parent |
| platformId | uuid | nullable, FK → Platform.id | Which tenant this company belongs to |
| country | text | nullable | |
| isActive | boolean | NOT NULL, default true | |
| created_by | uuid | nullable | User UUID who created the row |
| updated_by | uuid | nullable | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Relationships**: belongs to Platform, belongs to ParentCompany, has many ChildCompanies, CompanyForms, FormInvitations, Users, EmailTemplates.

**Event trigger**: `ManageCompany` fires on INSERT/UPDATE/DELETE → POST to `https://alphams.snowkap.com/api/warp/webhook/company/manage`.

---

### User

An authenticated user of the platform.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL | Display name |
| email | text | NOT NULL, UNIQUE | Login email |
| emailVerified | timestamptz | nullable | |
| phone | text | nullable | |
| phoneVerified | timestamptz | nullable | |
| image | text | nullable | Avatar URL |
| details | jsonb | nullable | Arbitrary profile data |
| companyId | uuid | nullable, FK → Company.id | [QA] FK constraint retains typo name `User_compnayId_fkey` |
| isActive | boolean | nullable, default true | |
| created_by | uuid | nullable | |
| updated_by | uuid | nullable | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Relationships**: belongs to Company; has many FormSubmissions (as submitter), FormSubmissionsApproved (as approver), UserRoles.

**Event triggers**: `ManageUser_Insert`, `ManageUser_Update`, `ManageUser_Delete` → POST to `https://alphams.snowkap.com/api/warp/webhook/user/manage` (body is `{{$body.event}}` via Kriti transform).

---

### Role

Lookup table for role definitions.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK (composite with name) | |
| name | text | UNIQUE | e.g., "Creator", "Inviter", "Invitee", "Approver", "Analytics", "Platform" |
| description | text | NOT NULL | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

---

### UserRole

Junction table assigning roles to users (many-to-many).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| userId | uuid | PK (composite), FK → User.id | |
| roleName | text | PK (composite), FK → Role.name | Renamed from "Role" then "RoleName" during early migrations |

**All roles** can select their own UserRole row (`userId = X-Hasura-User-Id`).

---

### Form

A form definition (questionnaire template). Forms are either type `Assessment` or `Report`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL, UNIQUE | Internal identifier |
| title | text | NOT NULL | Display title |
| description | text | NOT NULL | |
| type | text | NOT NULL | `"Assessment"` or `"Report"` |
| tags | text[] | nullable | Classification tags |
| calc | json | nullable | JSONata expression for form-level score calculation |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Computed field**: `json_tags` — converts `tags text[]` to JSONB.

**Relationships**: has many Sections, FormFields, FormInvitations, CompanyForms, GroupForms (member), GroupForms (as group container); has one FormDetails.

**Creator** role can insert/update Forms scoped to their platform via CompanyForms path.

---

### FormDetails

One-to-one extension table for additional form metadata.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| formId | uuid | NOT NULL, FK → Form.id, UNIQUE | |
| framework | text | nullable | e.g., "BRSR", "GRI" |
| focusArea | jsonb | nullable | |
| timeInMinutes | integer | nullable | Estimated completion time |
| bodyTemplate | text | nullable | HTML body template for email invitations |
| notes | jsonb | nullable | |

---

### Section

A section within a Form. Sections are hierarchical (a section can have a parent section).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| key | text | NOT NULL | Short identifier key |
| content | text | NOT NULL | Section title/label |
| tags | text[] | NOT NULL | |
| weightage | numeric(10,2) | NOT NULL | Weight used in score calculation |
| calc | jsonb | nullable | JSONata score formula |
| sectionId | uuid | NOT NULL, FK → Section.id | Parent section (self-ref); root sections point to themselves [QA: this is confusing — root sections must have a valid sectionId, cannot be null] |
| formId | uuid | NOT NULL, FK → Form.id | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Computed field**: `json_tags`.

**Indexes** (added migration 1741955243000): `idx_section_form_id`.

---

### Question

A question within a Section. Questions can be nested via `parentQuestionId`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| key | text | NOT NULL | Short identifier |
| content | text | NOT NULL | Question text |
| tags | text[] | NOT NULL | |
| weightage | numeric(10,2) | NOT NULL | Weight in scoring |
| calc | jsonb | nullable | JSONata score formula |
| sectionId | uuid | NOT NULL, FK → Section.id | |
| parentQuestionId | uuid | nullable, FK → Question.id | Self-ref for nested questions (added migration 1665026986182) |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Computed field**: `json_tags`.

**Indexes**: `idx_question_section_id`.

---

### FormField

The UI field definition for a single input within a Question. This is what gets rendered in the form and what gets answered.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| field | text | NOT NULL | Field name/key |
| type | text | NOT NULL | Data type (e.g., `"string"`, `"number"`, `"boolean"`, `"file"`, `"array"`) |
| fieldOptions | jsonb | NOT NULL | Field-specific options |
| interface | text | NOT NULL | UI component type (e.g., `"input"`, `"select"`, `"multiselect"`, `"file-upload"`) |
| interfaceOptions | jsonb | nullable | UI component options |
| display | jsonb | nullable | Display configuration |
| displayOptions | jsonb | nullable | |
| displayRules | jsonb | nullable | Conditional display logic |
| validationRules | jsonb | nullable | Validation rules (Yup-compatible) |
| seqIndex | integer | NOT NULL | Ordering within the group |
| groupField | text | NOT NULL | Group identifier for logical grouping |
| tags | jsonb | nullable | Tags added migration 1669824103603 |
| formId | uuid | NOT NULL, FK → Form.id | |
| sectionId | uuid | nullable, FK → Section.id | |
| questionId | uuid | nullable, FK → Question.id | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Relationships**: belongs to Form, Section, Question; has many Answers.

**Indexes**: `idx_form_field_section_id`, `idx_form_field_question_id`, `idx_form_field_form_id`.

---

### FormInvitation

Represents a company being invited to fill out a specific form.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| email | text | NOT NULL | Contact email for the invitation |
| companyId | uuid | nullable, FK → Company.id | The invitee company |
| formId | uuid | NOT NULL, FK → Form.id | Which form |
| isActive | boolean | NOT NULL, default true | Soft-delete flag |
| status | text | nullable | See `FormInvitationStatus` constants |
| durationFrom | date | nullable | Assessment period start |
| durationTo | date | nullable | Assessment period end |
| created_by | uuid | nullable | |
| updated_by | uuid | nullable | |
| ReviewerDetails | (column present in YAML but not in migrations) | | [QA] This column appears in Hasura metadata permissions but has no corresponding migration |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Status values** (`FormInvitationStatus`): `Draft`, `Invited`, `Submitted`, `Approved`, `Processing`, `Completed`, `Failed`, `Uploaded`, `Under Review`.

**Relationships**: belongs to Company, Form; has many FormSubmissions.

**Indexes**: `idx_form_invitation_form_id`.

**Inviter** role can insert invitations for child companies only.

---

### FormSubmission

A specific submission attempt by an invitee for a form invitation.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| invitationId | uuid | NOT NULL, FK → FormInvitation.id | |
| remarks | text | nullable | Free-text comments |
| submittedBy | uuid | nullable, FK → User.id | Nullable since migration 1664374822481 |
| approvedBy | uuid | nullable, FK → User.id | Nullable since migration 1664374837267 |
| isActive | boolean | NOT NULL, default true | |
| status | text | nullable | See `FormSubmissionStatus` constants — added at application level (not in base migrations; referenced in constants and code) |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Status values** (`FormSubmissionStatus`): `New`, `Submitted`, `InProgress`, `Successful`, `Failed`, `Declined`, `Re-submitted`, `Approved`.

**Relationships**: belongs to FormInvitation, submittedBy User, approvedBy User (ApproverUser); has many Answers, FormResults.

**Indexes**: `idx_form_submission_invitation_id`.

**Approver** sets `approvedBy` automatically via Hasura `set` preset on update.

---

### Answer

One answer per FormField per FormSubmission. The actual response data.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| questionId | uuid | NOT NULL, FK → Question.id | |
| submissionId | uuid | nullable, FK → FormSubmission.id | Added migration 1663944025747 |
| formFieldId | uuid | (referenced in metadata relationships but not in base CREATE migration) | [QA] FK to FormField appears in Hasura metadata but no migration adds this column |
| data | jsonb | NOT NULL | The actual answer value (structure varies by field type) |
| status | text | nullable, default `'draft'` | `QuestionStatus`: Draft, Submitted, Approved, Pending, Responded |
| created_by | uuid | nullable | |
| updated_by | uuid | nullable | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

**Relationships**: belongs to Question, FormSubmission, FormField; has many AnswerFiles.

**Composite index**: `idx_answer_question_submission ON Answer(questionId, submissionId)`.

**Invitee** can only update answers for their own company's active submission; auto-sets `updated_by` from JWT.

---

### AnswerFile

Files uploaded as part of an answer.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL | Original file name |
| type | text | NOT NULL | MIME type |
| sizeInBytes | text | NOT NULL | [QA] Stored as text, not integer |
| provider | text | NOT NULL | Storage provider, e.g., `"s3"` |
| path | text | NOT NULL | S3 key or URL |
| answerId | uuid | NOT NULL, FK → Answer.id | |
| created_at | timestamptz | NOT NULL | No `updated_at` column (no update trigger) |

---

### FormResult

Score output for a submission, broken down by section and question.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| submissionId | uuid | NOT NULL, FK → FormSubmission.id | |
| sectionId | uuid | nullable, FK → Section.id | |
| questionId | uuid | nullable, FK → Question.id | |
| score | numeric(10,2) | NOT NULL, default 0 | Calculated score |
| recommendations | text | nullable | [QA] Renamed from `recommendation` in migration 1669625513767 but no original `recommendation` column in CREATE migration |

No `created_at`/`updated_at` columns. No update trigger.

---

### GlobalMaster

Platform-level configuration data stored as typed JSON blobs.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| platformId | uuid | NOT NULL, FK → Platform.id | |
| type | text | NOT NULL | Config type key (see below) |
| data | jsonb | NOT NULL | Arbitrary config payload |

**Known `type` values** (from `app.constants.ts` `Platform.Types`):
- `InviterFormAutoAppover` — forms where the inviter auto-approves on submission
- `OnFormScoreCalculationTrigger` — forms that trigger score calc on submission
- `BRSRreportdata` — BRSR report configuration
- `SendSuccessEmailOnSubmissionFormList` — forms that send a success email on submission
- `InvitationListDashboardActionPermission` — dashboard action permissions
- `InternalRequestCompany` — internal company ID list
- `CommentsAccess` — controls comment visibility
- `companyFundType` — fund type configuration
- `Recommendation_new` — recommendation workflow flag
- `FormIcons` — icon mapping for form types
- `RaraIntegrationAccess` — RARA document validation access control
- `IHCPredealFundTypeChange` — IHC pre-deal fund type override
- `SelfAssessmentDisabled` / `SelfAssessmentFiltersEnable` — self-assessment feature flags

A seed row (migration 1675430176768) creates a `SendSuccessEmailOnSubmissionFormList` entry for a specific form UUID.

---

### CompanyForm

Explicit many-to-many join between Company and Form. Controls which forms a company can see.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| companyId | uuid | NOT NULL, FK → Company.id | |
| formId | uuid | NOT NULL, FK → Form.id | |
| (unique) | | UNIQUE(companyId, formId) | Prevents duplicate grants |

No timestamps. No update trigger.

---

### GroupForm

Links a Form to a "group form" container (another Form acting as a group). Supports grouped form views.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| (structure from metadata only — no migration found) | | | [QA] Table referenced in Form YAML metadata but no CREATE migration exists in the migration history |
| formId | uuid | FK → Form.id | |
| groupFormId | uuid | FK → Form.id | |

---

### EmailTemplate

Per-platform email templates for various notification types.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| platformId | uuid | NOT NULL, FK → Platform.id | |
| companyId | uuid | nullable, FK → Company.id | Per-company template override (referenced in Company relationships) |
| type | text | NOT NULL | Template type key (e.g., `"AIDocumentProcessed"`, `"AINewFormInvitation"`) |
| subject | text | nullable | Email subject |
| template | text | NOT NULL | HTML template body |
| ccEmails | text[] | nullable | CC addresses |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

[QA] The `companyId` column appears in the `Company.EmailTemplates` Hasura array relationship but is not in any migration for `EmailTemplate`.

---

### EmailConfiguration

SMTP configuration per platform.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| host | text | NOT NULL | SMTP host |
| port | integer | NOT NULL | SMTP port |
| isSecure | boolean | NOT NULL | TLS flag |
| user | text | NOT NULL | SMTP username |
| password | text | NOT NULL | SMTP password (stored in plaintext in DB — [QA] should be encrypted) |
| fromEmail | text | NOT NULL | Sender address |
| platformId | uuid | NOT NULL, FK → Platform.id | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL, auto-updated | |

[QA] Also tracked under the old name `EmailConfig` in Hasura metadata — duplicate entries.

---

## AI / Extended Tables (referenced in code and indexes but without numbered migrations)

These tables exist in the live database (referenced by Hasura relationships, application code, and the performance index migrations) but have no CREATE migration in the versioned migration set. They were likely created via Hasura console or manual SQL.

| Table | Purpose |
|---|---|
| `Interim_Answer` | Shadow copy of Answer used when a submitted form is re-opened; preserves original answers while edits are in progress |
| `Interim_Recommendation` | Generated recommendations from `recommendationCalc` JSONata expressions, linked to Interim_Answer |
| `InterimFormLogs` | Progress report intermediate data per submission |
| `AIConversations` | AI chat conversation records (with FTS `search_vector`, `title`) |
| `AIMessages` | Individual AI chat messages (`content`, `rephrasedContent`, `metadata`) |
| `ReviewerDetailsMapping` | Maps reviewer users to form invitation + question combinations |
| `MakerCheckerRemarks` | Maker-checker workflow audit remarks |
| `SourceFiles` | Document files uploaded for AI processing |
| `Sources` | Source references for AI suggestions |
| `Suggestions` | AI-generated answer suggestions |
| `AIProcessing` | Tracks AI processing jobs (web curation, document processing) |
| `DocumentLogs` | Upload/processing status log per document |
| `ParentCompanyMapping` | Additional parent-child company relationship metadata |
| `AssesseeUserMapping` | Maps assessee users to form invitations |

---

## Entity-Relationship Summary

```
Platform (1)
  ├─(n) Company
  │       ├─(1) parent: Company (self-ref)
  │       ├─(n) User
  │       │      └─(n) UserRole ─── Role
  │       ├─(n) CompanyForm ─── Form
  │       └─(n) FormInvitation
  │                  │
  │                  └─(n) FormSubmission
  │                           ├─ submittedBy → User
  │                           ├─ approvedBy → User
  │                           ├─(n) Answer ─── Question ─── Section ─── Form
  │                           │         └─(n) AnswerFile
  │                           └─(n) FormResult ─── Section / Question
  ├─(n) EmailConfiguration
  ├─(n) EmailTemplate
  └─(n) GlobalMaster

Form (1)
  ├─(1) FormDetails
  ├─(n) Section (tree via sectionId self-ref)
  │       └─(n) Question (tree via parentQuestionId self-ref)
  │                └─(n) FormField
  └─(n) GroupForm (as group container or member)
```
